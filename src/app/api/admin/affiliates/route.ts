import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'
import { getAllAffiliates, processPayout } from '@/lib/affiliates'

export async function GET() {
  try {
    const result = await getAllAffiliates(200)

    // Aggregate stats
    let totalEarnings = 0
    let totalPending = 0
    let activeCount = 0
    for (const a of result.documents) {
      totalEarnings += a.totalEarnings || 0
      totalPending += a.pendingBalance || 0
      if (a.status === 'active') activeCount++
    }

    return NextResponse.json({
      affiliates: result.documents,
      total: result.total,
      stats: { totalEarnings, totalPending, activeCount },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { affiliateId, action, status } = await request.json()
    if (!affiliateId) {
      return NextResponse.json({ error: 'affiliateId required' }, { status: 400 })
    }

    const { databases } = createAdminClient()

    if (action === 'payout') {
      const amount = await processPayout(affiliateId)
      return NextResponse.json({ success: true, amount })
    }

    if (status) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.AFFILIATES, affiliateId, { status })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
