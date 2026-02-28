import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { ID } from 'node-appwrite'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, promptText, category, modelType, modelUsed, previewImageUrl, userId, userName } = body

    if (!title || !promptText || !userId) {
      return NextResponse.json({ error: 'Title, prompt, and userId are required' }, { status: 400 })
    }

    const { databases } = createAdminClient()
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.PROMPTS, ID.unique(), {
      title,
      promptText,
      category: category || 'general',
      modelType: modelType || 'image',
      modelUsed: modelUsed || null,
      previewImageUrl: previewImageUrl || null,
      isPublished: false,
      isFeatured: false,
      usageCount: 0,
      submissionStatus: 'pending',
      submittedBy: userId,
      submitterName: userName || 'Anonymous',
    })

    return NextResponse.json(doc)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
