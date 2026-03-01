import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'

/**
 * POST /api/admin/cleanup
 * Clean up failed, stuck, and orphaned generation records.
 */
export async function POST(request: Request) {
  try {
    const { databases, storage } = createAdminClient()
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_UPLOADS!
    let deletedCount = 0
    let cleanedCount = 0

    // 1. Delete all failed generations
    let hasMore = true
    while (hasMore) {
      const failed = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.equal('status', 'failed'),
        Query.limit(100),
      ])
      if (failed.documents.length === 0) {
        hasMore = false
        break
      }
      for (const doc of failed.documents) {
        // Try to delete associated storage file if it exists
        if (doc.outputUrl) {
          try {
            const fileId = doc.outputUrl.split('/files/')[1]?.split('/')[0]
            if (fileId) await storage.deleteFile(bucketId, fileId)
          } catch {}
        }
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, doc.$id)
        deletedCount++
      }
    }

    // 2. Clean up stuck "processing" generations older than 15 minutes
    const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    hasMore = true
    while (hasMore) {
      const stuck = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.equal('status', 'processing'),
        Query.lessThan('$createdAt', cutoff),
        Query.limit(100),
      ])
      if (stuck.documents.length === 0) {
        hasMore = false
        break
      }
      for (const doc of stuck.documents) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, doc.$id, {
          status: 'failed',
          errorMessage: 'Cleaned up: generation timed out',
        })
        // Note: these will be cleaned up in the next cleanup run as failed
        cleanedCount++
      }
    }

    // 3. Clean up stuck "pending" generations older than 15 minutes
    hasMore = true
    while (hasMore) {
      const pending = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.equal('status', 'pending'),
        Query.lessThan('$createdAt', cutoff),
        Query.limit(100),
      ])
      if (pending.documents.length === 0) {
        hasMore = false
        break
      }
      for (const doc of pending.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.GENERATIONS, doc.$id)
        deletedCount++
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      markedFailed: cleanedCount,
      message: `Cleaned up ${deletedCount} records, marked ${cleanedCount} stuck jobs as failed`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * GET /api/admin/cleanup
 * Get counts of records that need cleanup.
 */
export async function GET() {
  try {
    const { databases } = createAdminClient()
    const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString()

    const [failed, stuckProcessing, stuckPending] = await Promise.all([
      databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.equal('status', 'failed'),
        Query.limit(1),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.equal('status', 'processing'),
        Query.lessThan('$createdAt', cutoff),
        Query.limit(1),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.equal('status', 'pending'),
        Query.lessThan('$createdAt', cutoff),
        Query.limit(1),
      ]),
    ])

    return NextResponse.json({
      failedCount: failed.total,
      stuckProcessingCount: stuckProcessing.total,
      stuckPendingCount: stuckPending.total,
      totalCleanable: failed.total + stuckProcessing.total + stuckPending.total,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
