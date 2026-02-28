import { NextResponse } from 'next/server'
import { generateImage, generateImageFromImage } from '@/lib/together/image'
import { getModelById } from '@/lib/together/models'
import { checkCredits, deductCredits, refundCredits } from '@/lib/credits'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { ID, Query } from 'node-appwrite'

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { model, prompt, negativePrompt, width, height, steps, seed, imageUrl, type, userId } = body

    if (!model || !prompt || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const modelData = getModelById(model)
    if (!modelData) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 })
    }

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

    const { databases } = createAdminClient()
    const generationId = ID.unique()

    await databases.createDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, {
      userId,
      type: type || 'text-to-image',
      model,
      prompt,
      negativePrompt: negativePrompt || null,
      inputImageUrl: imageUrl || null,
      width: width || 1024,
      height: height || 1024,
      steps: steps || modelData.defaultSteps || null,
      seed: seed || null,
      creditsUsed: modelData.credits,
      status: 'processing',
      aspectRatio: body.aspectRatio || '1:1',
    })

    const deducted = await deductCredits(userId, modelData.credits, `${type || 'text-to-image'}: ${model}`, generationId)
    if (!deducted) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, { status: 'failed', errorMessage: 'Credit deduction failed' })
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 402 })
    }

    try {
      const result = imageUrl
        ? await generateImageFromImage({ model, prompt, negativePrompt, width, height, steps, seed, imageUrl })
        : await generateImage({ model, prompt, negativePrompt, width, height, steps, seed })

      // Store in Appwrite Storage
      const { storage } = createAdminClient()
      const imageResponse = await fetch(result.url)
      const imageBuffer = await imageResponse.arrayBuffer()
      const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_UPLOADS!
      const file = await storage.createFile(
        bucketId,
        ID.unique(),
        new File([Buffer.from(imageBuffer)], `gen-${generationId}.png`, { type: 'image/png' })
      )

      const outputUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

      await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, {
        status: 'completed',
        outputUrl,
        completedAt: new Date().toISOString(),
      })

      // Update user stats
      const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
        Query.equal('userId', userId), Query.limit(1),
      ])
      if (profiles.documents[0]) {
        const p = profiles.documents[0]
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, p.$id, {
          totalGenerations: (p.totalGenerations || 0) + 1,
          totalImages: (p.totalImages || 0) + 1,
          lastActiveAt: new Date().toISOString(),
        })
      }

      // Log API usage
      await databases.createDocument(DATABASE_ID, COLLECTIONS.API_USAGE_LOG, ID.unique(), {
        userId,
        endpoint: 'images/generations',
        model,
        requestType: type || 'text-to-image',
        latencyMs: Date.now() - startTime,
        statusCode: 200,
      })

      return NextResponse.json({ url: outputUrl, seed: result.seed, width: result.width, height: result.height, generationId })
    } catch (genError: any) {
      await refundCredits(userId, modelData.credits, `Refund: ${type || 'text-to-image'} failed`, generationId)

      // Detect Together.ai image_url rejection and give a clearer message
      let errorMsg = genError.message || 'Generation failed'
      if (errorMsg.includes('image_url') && errorMsg.includes('not supported')) {
        errorMsg = `${modelData.displayName} does not support image-to-image on this provider. Try a Kontext, SeedEdit, or Qwen Image Edit model instead.`
      }

      await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, generationId, {
        status: 'failed', errorMessage: errorMsg,
      })

      await databases.createDocument(DATABASE_ID, COLLECTIONS.API_USAGE_LOG, ID.unique(), {
        userId, endpoint: 'images/generations', model, requestType: type || 'text-to-image',
        latencyMs: Date.now() - startTime, statusCode: 500, error: errorMsg,
      })

      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
