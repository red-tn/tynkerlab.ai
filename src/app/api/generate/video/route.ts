import { NextResponse } from 'next/server'
import { createVideoJob, checkVideoStatus } from '@/lib/together/video'
import { getModelById, getModelResolution, getVideoResolutionForQuality, getVideoCreditsForQuality } from '@/lib/together/models'
import { checkCredits, deductCredits, refundCredits } from '@/lib/credits'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserTier, requirePaidTier, TierGateError } from '@/lib/tier-gate'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'
import { uploadFromUrl } from '@/lib/storage'
import { generateAndUploadLtxVideo } from '@/lib/ltx/client'

export const maxDuration = 300

/** Detect content moderation / safety filter errors from Google Veo, OpenAI Sora, etc. */
function isContentModerationError(msg: string): boolean {
  const lower = msg.toLowerCase()
  return lower.includes('content moderation') ||
    lower.includes('content was flagged') ||
    lower.includes('safety filter') ||
    lower.includes('content policy') ||
    lower.includes('violates') ||
    lower.includes('blocked by') ||
    lower.includes('unsafe content') ||
    lower.includes('responsible ai')
}

/** Detect transient provider errors (Together.ai routing issues, upstream timeouts, etc.) */
function isProviderTransientError(msg: string): boolean {
  const lower = msg.toLowerCase()
  return lower.includes('provider returned') ||
    lower.includes('responded with an error') ||
    lower.includes('upstream') ||
    lower.includes('gateway') ||
    lower.includes('service unavailable') ||
    lower.includes('internal server error') ||
    lower.includes('timeout') ||
    lower.includes('network error') ||
    lower.includes('rate limit')
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireUser(request)
    const body = await request.json()
    const {
      model, prompt, imageUrl, type, aspectRatio, duration,
      quality, seed, negativePrompt, cameraMotion,
    } = body

    if (!model || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Tier gate: video generation requires a paid subscription
    const tier = await getUserTier(userId)
    try {
      requirePaidTier(tier, 'Video generation')
    } catch (e) {
      if (e instanceof TierGateError) {
        return NextResponse.json({ error: e.message }, { status: 403 })
      }
      throw e
    }

    const modelData = getModelById(model)
    if (!modelData) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 })
    }

    if (imageUrl && !modelData.supportsFrameImages) {
      return NextResponse.json(
        { error: `${modelData.displayName} does not support image-to-video. Please select a model that supports image input.` },
        { status: 400 }
      )
    }

    const ar = aspectRatio || '16:9'
    const selectedQuality = quality || modelData.defaultQuality || '720p'
    const validRes = quality
      ? getVideoResolutionForQuality(model, selectedQuality, ar)
      : getModelResolution(model, ar)

    const parsedDuration = duration ? parseInt(duration) : undefined
    const creditsToCharge = quality
      ? getVideoCreditsForQuality(model, selectedQuality, parsedDuration)
      : modelData.credits

    const hasCredits = await checkCredits(userId, creditsToCharge)
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits', required: creditsToCharge }, { status: 402 })
    }

    const supabase = createAdminClient()

    const { data: genDoc, error: genInsertError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        type: type || 'text-to-video',
        model,
        prompt: prompt.slice(0, 1500),
        input_image_url: imageUrl || null,
        width: validRes.w,
        height: validRes.h,
        credits_used: creditsToCharge,
        status: 'processing',
        aspect_ratio: ar,
        seed: seed || null,
      })
      .select()
      .single()

    if (genInsertError || !genDoc) {
      return NextResponse.json({ error: 'Failed to create generation record' }, { status: 500 })
    }

    const generationId = genDoc.id

    const deducted = await deductCredits(userId, creditsToCharge, `${type || 'text-to-video'}: ${model} (${selectedQuality})`, generationId)
    if (!deducted) {
      await supabase.from('generations').update({ status: 'failed', error_message: 'Credit deduction failed' }).eq('id', generationId)
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 402 })
    }

    try {
      // Branch by provider
      if (modelData.provider === 'ltx') {
        // LTX — synchronous: generate + upload in one go
        const storagePath = `${userId}/${generationId}.mp4`
        const videoUrl = await generateAndUploadLtxVideo({
          prompt,
          model: model as 'ltx-2-fast' | 'ltx-2-pro',
          duration: parsedDuration || 6,
          width: validRes.w,
          height: validRes.h,
          generateAudio: modelData.supportsAudio,
          imageUrl: imageUrl || undefined,
        }, 'generations', storagePath)

        await supabase.from('generations').update({
          status: 'completed', output_url: videoUrl, completed_at: new Date().toISOString(),
        }).eq('id', generationId)

        // Increment user stats
        const { data: profile } = await supabase.from('profiles')
          .select('id, total_generations, total_videos, last_active_at')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle()

        if (profile) {
          await supabase.from('profiles').update({
            total_generations: (profile.total_generations || 0) + 1,
            total_videos: (profile.total_videos || 0) + 1,
            last_active_at: new Date().toISOString(),
          }).eq('id', profile.id)
        }

        return NextResponse.json({ generationId, status: 'completed', url: videoUrl })
      }

      // Together.ai — async: submit job and return jobId for polling
      const frameImages = imageUrl ? [imageUrl] : undefined
      const job = await createVideoJob({
        model, prompt,
        width: validRes.w, height: validRes.h,
        frameImages,
        seed: seed || undefined,
        seconds: parsedDuration || undefined,
        negativePrompt: negativePrompt || undefined,
        cameraMotion: cameraMotion || undefined,
      })

      await supabase.from('generations').update({
        together_job_id: job.id,
      }).eq('id', generationId)

      return NextResponse.json({ jobId: job.id, generationId })
    } catch (genError: any) {
      await refundCredits(userId, creditsToCharge, `Refund: video failed`, generationId)
      let errorMsg = genError.message || 'Video generation failed'
      if (isContentModerationError(errorMsg)) {
        errorMsg = 'Your prompt was flagged by the model\'s content filter. Try rephrasing your prompt or using a different model.'
      } else if (isProviderTransientError(errorMsg)) {
        errorMsg = `The AI provider encountered a temporary error. Your credits have been refunded. Please try again — or switch to a different model (Kling, Seedance, and PixVerse tend to be most reliable).`
      }
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

    // Check if we already marked this job done (avoid re-polling Together)
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
        return NextResponse.json({ status: 'failed', error: gen.error_message || 'Video generation failed' })
      }
    }

    // Poll Together.ai for current status
    const status = await checkVideoStatus(jobId)

    if (status.status === 'completed' && status.videoUrl) {
      // Download from Together.ai and upload to Supabase storage (temp URLs expire)
      let videoUrl = status.videoUrl
      if (gen) {
        try {
          const storagePath = `${gen.user_id}/${gen.id}.mp4`
          videoUrl = await uploadFromUrl(status.videoUrl, 'generations', storagePath, 'video/mp4')
        } catch (uploadErr) {
          console.error('Failed to upload video to storage, using direct URL:', uploadErr)
        }
      }

      // Update generation record + user stats — must await before response
      if (gen) {
        await supabase.from('generations').update({
          status: 'completed', output_url: videoUrl, completed_at: new Date().toISOString(),
        }).eq('id', gen.id)

        const { data: profile } = await supabase.from('profiles')
          .select('id, total_generations, total_videos, last_active_at')
          .eq('user_id', gen.user_id)
          .limit(1)
          .maybeSingle()

        if (profile) {
          await supabase.from('profiles').update({
            total_generations: (profile.total_generations || 0) + 1,
            total_videos: (profile.total_videos || 0) + 1,
            last_active_at: new Date().toISOString(),
          }).eq('id', profile.id)
        }
      }

      return NextResponse.json({ status: 'completed', url: videoUrl })
    }

    if (status.status === 'failed') {
      let errorMsg = status.error || 'Video generation failed'
      if (isContentModerationError(errorMsg)) {
        errorMsg = 'Your prompt was flagged by the model\'s content filter. Try rephrasing your prompt or using a different model.'
      } else if (isProviderTransientError(errorMsg)) {
        errorMsg = 'The AI provider encountered a temporary error. Your credits have been refunded. Please try again — or switch to a different model (Kling, Seedance, and PixVerse tend to be most reliable).'
      }
      if (gen) {
        await refundCredits(gen.user_id, gen.credits_used, 'Refund: video generation failed', gen.id)
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
      await refundCredits(gen.user_id, gen.credits_used, 'Refund: video generation cancelled', gen.id)
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
