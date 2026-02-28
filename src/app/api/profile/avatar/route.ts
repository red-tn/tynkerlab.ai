import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query, ID } from 'node-appwrite'
import { getTogetherClient } from '@/lib/together/client'

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json()
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Generate avatar using Together.ai
    const together = getTogetherClient()
    const response = await together.images.generate({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt: `Professional portrait avatar: ${prompt}. High quality, centered face, clean background.`,
      width: 512,
      height: 512,
      steps: 4,
      n: 1,
      response_format: 'url',
    })

    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    // Download the image and upload to Appwrite Storage
    const { storage, databases } = createAdminClient()
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const file = await storage.createFile(
      'avatars',
      ID.unique(),
      new File([Buffer.from(imageBuffer)], 'avatar.png', { type: 'image/png' })
    )

    const avatarUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/avatars/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

    // Update profile with new avatar
    if (userId) {
      const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
        Query.equal('userId', userId),
      ])
      if (profiles.documents[0]) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profiles.documents[0].$id, {
          avatarUrl,
          avatarPrompt: prompt,
        })
      }
    }

    return NextResponse.json({ avatarUrl })
  } catch (error: any) {
    console.error('Avatar generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
