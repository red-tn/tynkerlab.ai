import { NextResponse } from 'next/server'
import { createAvatarJob, checkJobStatus } from '@/lib/wavespeed/client'
import { checkCredits, deductCredits, refundCredits } from '@/lib/credits'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserTier, requirePaidTier, TierGateError } from '@/lib/tier-gate'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'
import { uploadFromUrl } from '@/lib/storage'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const { userId } = await requireUser(request)
    const body = await request.json()
    const { imageUrl, audioUrl, textPrompt, resolution, durationSeconds } = body

    if (!imageUrl || !audioUrl) {
      return NextResponse.json({ error: 'Missing required fields (imageUrl, audioUrl)' }, { status: 400 })
    }

    // Tier gate: UGC Avatars require a paid subscription
    const tier = await getUserTier(userId)
    try {
      requirePaidTier(tier, 'UGC Avatars')
    } catch (e) {
      if (e instanceof TierGateError) {
        return NextResponse.json({ error: e.message }, { status: 403 })
      }
      throw e
    }

    const res = resolution || '480p'
    const duration = durationSeconds || 60

    // 120 credits per minute, minimum 120
    const creditsToCharge = Math.max(120, Math.ceil(duration / 60) * 120)

    const hasCredits = await checkCredits(userId, creditsToCharge)
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits', required: creditsToCharge }, { status: 402 })
    }

    const supabase = createAdminClient()

    const { data: genDoc, error: genInsertError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        type: 'ugc-avatar',
        model: 'wavespeed/infinitetalk',
        prompt: (textPrompt || 'talking avatar').slice(0, 1500),
        input_image_url: imageUrl,
        input_audio_url: audioUrl,
        duration_seconds: duration,
        resolution: res,
        credits_used: creditsToCharge,
        status: 'processing',
      })
      .select()
      .single()

    if (genInsertError || !genDoc) {
      return NextResponse.json({ error: 'Failed to create generation record' }, { status: 500 })
    }

    const generationId = genDoc.id

    const deducted = await deductCredits(userId, creditsToCharge, `ugc-avatar: wavespeed/infinitetalk (${res})`, generationId)
    if (!deducted) {
      await supabase.from('generations').update({ status: 'failed', error_message: 'Credit deduction failed' }).eq('id', generationId)
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 402 })
    }

    try {
      const job = await createAvatarJob({
        image: imageUrl,
        audio: audioUrl,
        prompt: textPrompt || undefined,
        resolution: res as '480p' | '720p',
      })

      await supabase.from('generations').update({
        together_job_id: job.id,
      }).eq('id', generationId)

      return NextResponse.json({ jobId: job.id, generationId })
    } catch (genError: any) {
      await refundCredits(userId, creditsToCharge, 'Refund: avatar generation failed', generationId)
      const errorMsg = genError.message || 'Avatar generation failed'
      await supabase.from('generations').update({
        status: 'failed', error_message: errorMsg.slice(0, 1500),
      }).eq('id', generationId)
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    await requireUser(request)
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if we already marked this job done
    const { data: gen } = await supabase
      .from('generations')
      .select('*')
      .eq('together_job_id', jobId)
      .limit(1)
      .maybeSingle()

    if (gen) {
      if (gen.status === 'completed' && gen.output_url) {
        return NextResponse.json({ status: 'completed', url: gen.output_url })
      }
      if (gen.status === 'failed') {
        return NextResponse.json({ status: 'failed', error: gen.error_message || 'Avatar generation failed' })
      }
    }

    // Poll WaveSpeed for current status
    const status = await checkJobStatus(jobId)

    if (status.status === 'completed' && status.videoUrl) {
      let videoUrl = status.videoUrl
      if (gen) {
        try {
          const storagePath = `${gen.user_id}/${gen.id}.mp4`
          videoUrl = await uploadFromUrl(status.videoUrl, 'generations', storagePath, 'video/mp4')
        } catch (uploadErr) {
          console.error('Failed to upload avatar to storage, using direct URL:', uploadErr)
        }
      }

      if (gen) {
        await supabase.from('generations').update({
          status: 'completed', output_url: videoUrl, completed_at: new Date().toISOString(),
        }).eq('id', gen.id)

        const { data: profile } = await supabase.from('profiles')
          .select('id, total_generations, total_avatars, last_active_at')
          .eq('user_id', gen.user_id)
          .limit(1)
          .maybeSingle()

        if (profile) {
          await supabase.from('profiles').update({
            total_generations: (profile.total_generations || 0) + 1,
            total_avatars: (profile.total_avatars || 0) + 1,
            last_active_at: new Date().toISOString(),
          }).eq('id', profile.id)
        }
      }

      return NextResponse.json({ status: 'completed', url: videoUrl })
    }

    if (status.status === 'failed') {
      const errorMsg = status.error || 'Avatar generation failed'
      if (gen) {
        await refundCredits(gen.user_id, gen.credits_used, 'Refund: avatar generation failed', gen.id)
        await supabase.from('generations').update({
          status: 'failed', error_message: errorMsg.slice(0, 1500),
        }).eq('id', gen.id)
      }
      return NextResponse.json({ status: 'failed', error: errorMsg })
    }

    return NextResponse.json({ status: status.status })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT — client reports a timeout or cancellation, refund credits
export async function PUT(request: Request) {
  try {
    const { userId } = await requireUser(request)
    const { jobId } = await request.json()
    if (!jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: gen } = await supabase
      .from('generations')
      .select('*')
      .eq('together_job_id', jobId)
      .limit(1)
      .single()

    if (!gen) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    // Verify the generation belongs to the authenticated user
    if (gen.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only refund if not already completed or failed
    if (gen.status !== 'completed' && gen.status !== 'failed') {
      await refundCredits(gen.user_id, gen.credits_used, 'Refund: avatar generation cancelled', gen.id)
      await supabase.from('generations').update({
        status: 'failed',
        error_message: 'Generation cancelled — credits refunded',
      }).eq('id', gen.id)
      return NextResponse.json({ refunded: true, amount: gen.credits_used })
    }

    return NextResponse.json({ refunded: false, reason: `Generation status is ${gen.status}` })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
