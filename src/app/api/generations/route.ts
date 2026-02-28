import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId are required' }, { status: 400 })
    }

    const { databases, storage } = createAdminClient()

    // Fetch the generation to verify ownership and get file info
    const gen = await databases.getDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, id)

    if (gen.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Try to delete the file from storage if it exists
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_UPLOADS!
    if (gen.outputUrl) {
      try {
        // Extract file ID from URL: .../files/{fileId}/view?...
        const match = gen.outputUrl.match(/\/files\/([^/]+)\//)
        if (match) {
          await storage.deleteFile(bucketId, match[1])
        }
      } catch {
        // File may already be deleted or URL format different — continue
      }
    }

    // Delete the generation document
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
