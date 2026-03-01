import { NextResponse } from 'next/server'
import { createVideoJob, checkVideoStatus } from '@/lib/together/video'
import { getModelById, getModelResolution } from '@/lib/together/models'
import { checkCredits, deductCredits, refundCredits } from '@/lib/credits'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { ID, Query } from 'node-appwrite'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { model, prompt, imageUrl, type, userId, aspectRatio, duration } = body

    if (!model || !prompt || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const modelData = getModelById(model)
    if (!modelData) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 })
    }

    // Validate model supports image-to-video if an image URL is provided
    if (imageUrl && !modelData.supportsFrameImages) {
      return NextResponse.json(
        { error: `${modelData.displayName} does not support image-to-video. Please select a model that supports image input.` },
        { status: 400 }
      )
    }

    // Compute valid resolution for this model + aspect ratio
    const ar = aspectRatio || '16:9'
    const validRes = getModelResolution(model, ar)

    const hasCredits = await checkCredits(userId, modelData.credits)
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits', required: modelData.credits }, { status: 402 })
    }

    const { databases } = createAdminClient()
    const generationId = ID.unique()

    await databases.createDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, {
      userId,
      type: type || 'text-to-video',
      model,
      prompt,
      inputImageUrl: imageUrl || null,
      width: validRes.w,
      height: validRes.h,
      creditsUsed: modelData.credits,
      status: 'processing',
      aspectRatio: ar,
    })

    const deducted = await deductCredits(userId, modelData.credits, `${type || 'text-to-video'}: ${model}`, generationId)
    if (!deducted) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, { status: 'failed', errorMessage: 'Credit deduction failed' })
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 402 })
    }

    try {
      const frameImages = imageUrl ? [imageUrl] : undefined
      const job = await createVideoJob({ model, prompt, width: validRes.w, height: validRes.h, aspectRatio: ar, frameImages })

      await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, {
        togetherJobId: job.id,
      })

      return NextResponse.json({ jobId: job.id, generationId })
    } catch (genError: any) {
      await refundCredits(userId, modelData.credits, `Refund: video failed`, generationId)
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, {
        status: 'failed', errorMessage: genError.message,
      })
      return NextResponse.json({ error: genError.message }, { status: 500 })
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

    const status = await checkVideoStatus(jobId)

    if (status.status === 'completed' && status.output?.video_url) {
      const { databases, storage } = createAdminClient()
      try {
        const videoResponse = await fetch(status.output.video_url)
        const videoBuffer = await videoResponse.arrayBuffer()

        const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_UPLOADS!
        const file = await storage.createFile(
          bucketId,
          ID.unique(),
          new File([Buffer.from(videoBuffer)], `video-${jobId}.mp4`, { type: 'video/mp4' })
        )

        const outputUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

        const generations = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
          Query.equal('togetherJobId', jobId), Query.limit(1),
        ])
        if (generations.documents[0]) {
          const gen = generations.documents[0]
          await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, gen.$id, {
            status: 'completed', outputUrl, completedAt: new Date().toISOString(),
          })
          const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
            Query.equal('userId', gen.userId), Query.limit(1),
          ])
          if (profiles.documents[0]) {
            const p = profiles.documents[0]
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, p.$id, {
              totalGenerations: (p.totalGenerations || 0) + 1,
              totalVideos: (p.totalVideos || 0) + 1,
              lastActiveAt: new Date().toISOString(),
            })
          }
        }

        return NextResponse.json({ status: 'completed', url: outputUrl })
      } catch {
        return NextResponse.json({ status: 'completed', url: status.output.video_url })
      }
    }

    if (status.status === 'failed') {
      const { databases } = createAdminClient()
      const generations = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.equal('togetherJobId', jobId), Query.limit(1),
      ])
      if (generations.documents[0]) {
        const gen = generations.documents[0]
        await refundCredits(gen.userId, gen.creditsUsed, 'Refund: video generation failed', gen.$id)
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, gen.$id, {
          status: 'failed', errorMessage: status.error || 'Video generation failed',
        })
      }
      return NextResponse.json({ status: 'failed', error: status.error })
    }

    return NextResponse.json({ status: status.status })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT — client reports a timeout, refund credits
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

    // Only refund if not already completed or failed (covers processing, queued, etc.)
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
