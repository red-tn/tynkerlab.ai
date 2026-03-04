import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()

    // Fetch all subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error

    // Fetch profiles for user info (name/email)
    const userIds = [...new Set((subscriptions || []).map((s: any) => s.user_id))]
    let profilesMap: Record<string, { full_name: string | null; email: string }> = {}

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds)

      for (const p of profiles || []) {
        profilesMap[p.user_id] = { full_name: p.full_name, email: p.email }
      }
    }

    // Enrich subscriptions with user info
    const enriched = (subscriptions || []).map((sub: any) => ({
      ...sub,
      user_name: profilesMap[sub.user_id]?.full_name || null,
      user_email: profilesMap[sub.user_id]?.email || null,
    }))

    // Calculate stats
    const active = enriched.filter((s: any) => s.status === 'active')
    const canceled = enriched.filter((s: any) => s.status === 'canceled')
    const proMonthly = active.filter((s: any) => s.tier === 'pro' && s.period === 'monthly').length
    const proAnnual = active.filter((s: any) => s.tier === 'pro' && s.period === 'annual').length
    const enterpriseMonthly = active.filter((s: any) => s.tier === 'enterprise' && s.period === 'monthly').length
    const enterpriseAnnual = active.filter((s: any) => s.tier === 'enterprise' && s.period === 'annual').length

    // MRR: monthly subs pay full price, annual subs pay discounted monthly equivalent
    // Pro: $20/mo or $15/mo (annual), Enterprise: $99/mo or $75/mo (annual)
    const mrr =
      proMonthly * 20 +
      proAnnual * 15 +
      enterpriseMonthly * 99 +
      enterpriseAnnual * 75

    const churn = enriched.length > 0
      ? parseFloat((canceled.length / enriched.length * 100).toFixed(1))
      : 0

    return NextResponse.json({
      subscriptions: enriched,
      stats: {
        total: enriched.length,
        active: active.length,
        proCount: proMonthly + proAnnual,
        enterpriseCount: enterpriseMonthly + enterpriseAnnual,
        mrr,
        churn,
      },
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error('Admin subscriptions error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
