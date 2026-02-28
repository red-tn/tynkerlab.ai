import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { ID, Query, Permission, Role } from 'node-appwrite'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')

    const { databases } = createAdminClient()
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROMPTS, [
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset(page * limit),
    ])

    return NextResponse.json({
      prompts: result.documents,
      total: result.total,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, promptText, category, modelType, isPublished } = body

    if (!title || !promptText) {
      return NextResponse.json({ error: 'Title and prompt text are required' }, { status: 400 })
    }

    const { databases } = createAdminClient()
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.PROMPTS, ID.unique(), {
      title,
      promptText,
      category: category || 'general',
      modelType: modelType || 'image',
      isPublished: isPublished ?? true,
      usageCount: 0,
      ...(body.modelUsed ? { modelUsed: body.modelUsed } : {}),
      ...(body.previewImageUrl ? { previewImageUrl: body.previewImageUrl } : {}),
      ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
      ...(body.createdBy ? { createdBy: body.createdBy } : {}),
    }, [
      Permission.read(Role.any()),
    ])

    return NextResponse.json(doc)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { databases } = createAdminClient()
    const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROMPTS, id, updates, [
      Permission.read(Role.any()),
    ])

    return NextResponse.json(doc)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { databases } = createAdminClient()
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROMPTS, id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
