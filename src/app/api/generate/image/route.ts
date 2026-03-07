import { NextResponse } from 'next/server'
import { generateImage, generateImageFromImage } from '@/lib/together/image'
import { getModelById, getModelResolution } from '@/lib/together/models'
import { checkCredits, deductCredits, refundCredits } from '@/lib/credits'
import { createAdminClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/tier-gate'
import { applyWatermark } from '@/lib/watermark'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'

// Allow up to 2 minutes for image generation + storage upload (Vercel)
export const maxDuration = 120

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const { userId } = await requireUser(request)
    const body = await request.json()
    const { model, prompt, negativePrompt, width, height, steps, seed, imageUrl, type, aspectRatio } = body

    if (!model || !prompt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const modelData = getModelById(model)
    if (!modelData) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 })
    }

    // Server-side resolution validation: snap to model's supported resolution
    const validRes = getModelResolution(model, aspectRatio || '1:1')
    const safeWidth = validRes.w
    const safeHeight = validRes.h

    // Validate model supports image-to-image if an image URL is provided
    if (imageUrl && !modelData.supportsImageUrl) {
      return NextResponse.json(
        { error: `${modelData.displayName} does not support image-to-image. Please select a model that supports image input.` },
        { status: 400 }
      )
    }

    const hasCredits = await checkCredits(userId, modelData.credits)
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits', required: modelData.credits }, { status: 402 })
    }

    const supabase = createAdminClient()

    const { data: genDoc, error: genInsertError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        type: type || 'text-to-image',
        model,
        prompt: prompt.slice(0, 1500),
        negative_prompt: negativePrompt || null,
        input_image_url: imageUrl || null,
        width: safeWidth,
        height: safeHeight,
        steps: steps || modelData.defaultSteps || null,
        seed: seed || null,
        credits_used: modelData.credits,
        status: 'processing',
        aspect_ratio: aspectRatio || '1:1',
      })
      .select()
      .single()

    if (genInsertError || !genDoc) {
      return NextResponse.json({ error: 'Failed to create generation record' }, { status: 500 })
    }

    const generationId = genDoc.id

    const deducted = await deductCredits(userId, modelData.credits, `${type || 'text-to-image'}: ${model}`, generationId)
    if (!deducted) {
      await supabase.from('generations').update({ status: 'failed', error_message: 'Credit deduction failed' }).eq('id', generationId)
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 402 })
    }

    try {
      const result = imageUrl
        ? await generateImageFromImage({ model, prompt, negativePrompt, width: safeWidth, height: safeHeight, steps, seed, imageUrl })
        : await generateImage({ model, prompt, negativePrompt, width: safeWidth, height: safeHeight, steps, seed })

      // Store in Supabase Storage
      const imageResponse = await fetch(result.url)
      const rawBuffer = Buffer.from(await imageResponse.arrayBuffer())

      // Watermark free tier images (graceful fallback — don't fail gen if watermark errors)
      const userTier = await getUserTier(userId)
      let imageBuffer: Buffer = rawBuffer
      if (userTier === 'free') {
        try {
          imageBuffer = await applyWatermark(rawBuffer)
        } catch (wmErr) {
          console.error('Watermark failed, uploading without:', wmErr)
        }
      }

      const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_UPLOADS || 'uploads'
      const filePath = `gen-${generationId}.png`
      await supabase.storage
        .from(bucket)
        .upload(filePath, imageBuffer, { contentType: 'image/png' })

      const { data: { publicUrl: outputUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      await supabase.from('generations').update({
        status: 'completed',
        output_url: outputUrl,
        completed_at: new Date().toISOString(),
      }).eq('id', generationId)

      // Update user stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, total_generations, total_images, last_active_at')
        .eq('user_id', userId)
        .limit(1)
        .single()

      if (profile) {
        await supabase.from('profiles').update({
          total_generations: (profile.total_generations || 0) + 1,
          total_images: (profile.total_images || 0) + 1,
          last_active_at: new Date().toISOString(),
        }).eq('id', profile.id)
      }

      // Log API usage
      await supabase.from('api_usage_log').insert({
        user_id: userId,
        endpoint: 'images/generations',
        model,
        request_type: type || 'text-to-image',
        latency_ms: Date.now() - startTime,
        status_code: 200,
      })

      return NextResponse.json({ url: outputUrl, seed: result.seed, width: result.width, height: result.height, generationId })
    } catch (genError: any) {
      await refundCredits(userId, modelData.credits, `Refund: ${type || 'text-to-image'} failed`, generationId)

      // Give clearer error messages for common API failures
      let errorMsg = genError.message || 'Generation failed'
      if (errorMsg.includes('image_url') && errorMsg.includes('not supported')) {
        errorMsg = `${modelData.displayName} does not support image-to-image on this provider. Try a Kontext, SeedEdit, or Qwen Image Edit model instead.`
      } else if (errorMsg.toLowerCase().includes('provider returned') || errorMsg.toLowerCase().includes('responded with an error')) {
        errorMsg = 'The AI provider encountered a temporary error. Your credits have been refunded. Please try again or switch to a different model.'
      }

      await supabase.from('generations').update({
        status: 'failed', error_message: errorMsg.slice(0, 1500),
      }).eq('id', generationId)

      await supabase.from('api_usage_log').insert({
        user_id: userId, endpoint: 'images/generations', model, request_type: type || 'text-to-image',
        latency_ms: Date.now() - startTime, status_code: 500, error: errorMsg,
      })

      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
