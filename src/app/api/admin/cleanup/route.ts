import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

/**
 * POST /api/admin/cleanup
 * Clean up failed, stuck, and orphaned generation records.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()
    const bucketId = 'uploads'
    let deletedCount = 0
    let cleanedCount = 0

    // 1. Delete all failed generations
    let hasMore = true
    while (hasMore) {
      const { data: failed, error } = await supabase
        .from('generations')
        .select('*')
        .eq('status', 'failed')
        .limit(100)

      if (error) throw error
      if (!failed || failed.length === 0) {
        hasMore = false
        break
      }
      for (const doc of failed) {
        // Try to delete associated storage file if it exists
        if (doc.output_url) {
          try {
            const fileId = doc.output_url.split('/files/')[1]?.split('/')[0]
              || doc.output_url.split('/object/public/')[1]
            if (fileId) await supabase.storage.from(bucketId).remove([fileId])
          } catch {}
        }
        const { error: delError } = await supabase
          .from('generations')
          .delete()
          .eq('id', doc.id)

        if (delError) throw delError
        deletedCount++
      }
    }

    // 2. Clean up stuck "processing" generations older than 15 minutes
    const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    hasMore = true
    while (hasMore) {
      const { data: stuck, error } = await supabase
        .from('generations')
        .select('*')
        .eq('status', 'processing')
        .lt('created_at', cutoff)
        .limit(100)

      if (error) throw error
      if (!stuck || stuck.length === 0) {
        hasMore = false
        break
      }
      for (const doc of stuck) {
        const { error: updateError } = await supabase
          .from('generations')
          .update({
            status: 'failed',
            error_message: 'Cleaned up: generation timed out',
          })
          .eq('id', doc.id)

        if (updateError) throw updateError
        // Note: these will be cleaned up in the next cleanup run as failed
        cleanedCount++
      }
    }

    // 3. Clean up stuck "pending" generations older than 15 minutes
    hasMore = true
    while (hasMore) {
      const { data: pending, error } = await supabase
        .from('generations')
        .select('*')
        .eq('status', 'pending')
        .lt('created_at', cutoff)
        .limit(100)

      if (error) throw error
      if (!pending || pending.length === 0) {
        hasMore = false
        break
      }
      for (const doc of pending) {
        const { error: delError } = await supabase
          .from('generations')
          .delete()
          .eq('id', doc.id)

        if (delError) throw delError
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
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * GET /api/admin/cleanup
 * Get counts of records that need cleanup.
 */
export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()
    const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString()

    const [failedResult, stuckProcessingResult, stuckPendingResult] = await Promise.all([
      supabase.from('generations').select('*', { count: 'exact', head: true })
        .eq('status', 'failed'),
      supabase.from('generations').select('*', { count: 'exact', head: true })
        .eq('status', 'processing')
        .lt('created_at', cutoff),
      supabase.from('generations').select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('created_at', cutoff),
    ])

    const failedCount = failedResult.count ?? 0
    const stuckProcessingCount = stuckProcessingResult.count ?? 0
    const stuckPendingCount = stuckPendingResult.count ?? 0

    return NextResponse.json({
      failedCount,
      stuckProcessingCount,
      stuckPendingCount,
      totalCleanable: failedCount + stuckProcessingCount + stuckPendingCount,
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
