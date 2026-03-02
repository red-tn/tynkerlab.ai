import { NextResponse } from 'next/server'
import { createVideoJob, checkVideoStatus } from '@/lib/together/video'
import { getModelById, getModelResolution, getVideoResolutionForQuality, getVideoCreditsForQuality } from '@/lib/together/models'
import { checkCredits, deductCredits, refundCredits } from '@/lib/credits'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { ID, Query } from 'node-appwrite'

export const maxDuration = 60

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      model, prompt, imageUrl, type, userId, aspectRatio, duration,
      quality, seed, negativePrompt, cameraMotion,
    } = body

    if (!model || !prompt || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    const creditsToCharge = quality
      ? getVideoCreditsForQuality(model, selectedQuality)
      : modelData.credits

    const hasCredits = await checkCredits(userId, creditsToCharge)
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits', required: creditsToCharge }, { status: 402 })
    }

    const { databases } = createAdminClient()
    const generationId = ID.unique()

    await databases.createDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, {
      userId,
      type: type || 'text-to-video',
      model,
      prompt: prompt.slice(0, 1500),
      inputImageUrl: imageUrl || null,
      width: validRes.w,
      height: validRes.h,
      creditsUsed: creditsToCharge,
      status: 'processing',
      aspectRatio: ar,
      seed: seed || null,
    })

    const deducted = await deductCredits(userId, creditsToCharge, `${type || 'text-to-video'}: ${model} (${selectedQuality})`, generationId)
    if (!deducted) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, { status: 'failed', errorMessage: 'Credit deduction failed' })
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 402 })
    }

    try {
      const frameImages = imageUrl ? [imageUrl] : undefined
      // Only send params the Together.ai video API actually supports
      // (no aspect_ratio — use width/height instead)
      const job = await createVideoJob({
        model, prompt,
        width: validRes.w, height: validRes.h,
        frameImages,
        seed: seed || undefined,
        seconds: duration ? parseInt(duration) : undefined,
        negativePrompt: negativePrompt || undefined,
        cameraMotion: cameraMotion || undefined,
      })

      await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, {
        togetherJobId: job.id,
      })

      return NextResponse.json({ jobId: job.id, generationId })
    } catch (genError: any) {
      await refundCredits(userId, creditsToCharge, `Refund: video failed`, generationId)
      let errorMsg = genError.message || 'Video generation failed'
      if (isContentModerationError(errorMsg)) {
        errorMsg = 'Invalid content detected. The generated content was flagged and rejected by the model\'s content moderation system. Try rephrasing your prompt or using a different model.'
      }
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, {
        status: 'failed', errorMessage: errorMsg.slice(0, 1500),
      })
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const { databases } = createAdminClient()

    // Check if we already marked this job done (avoid re-polling Together)
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
      Query.equal('togetherJobId', jobId), Query.limit(1),
    ])
    if (existing.documents[0]) {
      const gen = existing.documents[0]
      if (gen.status === 'completed' && gen.outputUrl) {
        return NextResponse.json({ status: 'completed', url: gen.outputUrl })
      }
      if (gen.status === 'failed') {
        return NextResponse.json({ status: 'failed', error: gen.errorMessage || 'Video generation failed' })
      }
    }

    // Poll Together.ai for current status
    const status = await checkVideoStatus(jobId)

    if (status.status === 'completed' && status.videoUrl) {
      // Return the Together.ai CDN URL directly — no download/re-upload.
      // This is fast and reliable. Together hosts the video for us.
      const videoUrl = status.videoUrl

      // Update generation record + user stats (non-blocking, don't wait)
      if (existing.documents[0]) {
        const gen = existing.documents[0]
        databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, gen.$id, {
          status: 'completed', outputUrl: videoUrl, completedAt: new Date().toISOString(),
        }).catch(() => {})
        databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
          Query.equal('userId', gen.userId), Query.limit(1),
        ]).then(profiles => {
          if (profiles.documents[0]) {
            const p = profiles.documents[0]
            databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, p.$id, {
              totalGenerations: (p.totalGenerations || 0) + 1,
              totalVideos: (p.totalVideos || 0) + 1,
              lastActiveAt: new Date().toISOString(),
            }).catch(() => {})
          }
        }).catch(() => {})
      }

      return NextResponse.json({ status: 'completed', url: videoUrl })
    }

    if (status.status === 'failed') {
      let errorMsg = status.error || 'Video generation failed'
      if (isContentModerationError(errorMsg)) {
        errorMsg = 'Invalid content detected. The generated content was flagged and rejected by the model\'s content moderation system. Try rephrasing your prompt or using a different model.'
      }
      if (existing.documents[0]) {
        const gen = existing.documents[0]
        await refundCredits(gen.userId, gen.creditsUsed, 'Refund: video generation failed', gen.$id)
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, gen.$id, {
          status: 'failed', errorMessage: errorMsg.slice(0, 1500),
        })
      }
      return NextResponse.json({ status: 'failed', error: errorMsg })
    }

    return NextResponse.json({ status: status.status })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT — client reports a timeout or cancellation, refund credits
export async function PUT(request: Request) {
  try {
    const { jobId } = await request.json()
    if (!jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 })
    }

    const { databases } = createAdminClient()
    const generations = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
      Query.equal('togetherJobId', jobId), Query.limit(1),
    ])

    if (!generations.documents[0]) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    const gen = generations.documents[0]

    // Only refund if not already completed or failed
    if (gen.status !== 'completed' && gen.status !== 'failed') {
      await refundCredits(gen.userId, gen.creditsUsed, 'Refund: video generation cancelled', gen.$id)
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, gen.$id, {
        status: 'failed',
        errorMessage: 'Generation cancelled — credits refunded',
      })
      return NextResponse.json({ refunded: true, amount: gen.creditsUsed })
    }

    return NextResponse.json({ refunded: false, reason: `Generation status is ${gen.status}` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
