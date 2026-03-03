import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAllAffiliates, processPayout } from '@/lib/affiliates'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const result = await getAllAffiliates(200)

    // Aggregate stats
    let totalEarnings = 0
    let totalPending = 0
    let activeCount = 0
    for (const a of result.data) {
      totalEarnings += a.total_earnings || 0
      totalPending += a.pending_balance || 0
      if (a.status === 'active') activeCount++
    }

    return NextResponse.json({
      affiliates: result.data,
      total: result.total,
      stats: { totalEarnings, totalPending, activeCount },
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request)
    const { affiliateId, action, status } = await request.json()
    if (!affiliateId) {
      return NextResponse.json({ error: 'affiliateId required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (action === 'payout') {
      const amount = await processPayout(affiliateId)
      return NextResponse.json({ success: true, amount })
    }

    if (status) {
      const { error } = await supabase
        .from('affiliates')
        .update({ status })
        .eq('id', affiliateId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
