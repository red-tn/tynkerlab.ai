import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Fetch all data in parallel
    const [
      profilesResult,
      prevProfilesResult,
      subsResult,
      prevSubsResult,
      allActiveSubsResult,
      generationsResult,
      prevGenerationsResult,
      apiUsageResult,
      recentGensResult,
      recentSignupsResult,
    ] = await Promise.all([
      // Current month users
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      // Previous month users (created before 30d ago)
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .lt('created_at', thirtyDaysAgo.toISOString()),
      // Current active subscriptions
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      // Subscriptions that were active 30 days ago (approximate: created before 30d ago and still active or canceled after)
      supabase.from('subscriptions').select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lt('created_at', thirtyDaysAgo.toISOString()),
      // All active subscriptions with tier and period for revenue calculation
      supabase.from('subscriptions').select('tier, period').eq('status', 'active'),
      // Current 30d generations
      supabase.from('generations').select('*').gt('created_at', thirtyDaysAgo.toISOString()).limit(5000),
      // Previous 30d generations count
      supabase.from('generations').select('*', { count: 'exact', head: true })
        .gt('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('api_usage_log').select('*', { count: 'exact', head: true })
        .gt('created_at', twentyFourHoursAgo.toISOString()),
      supabase.from('generations').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
    ])

    const generations = generationsResult.data || []
    const generationsCount = generationsResult.count ?? generations.length
    const prevGenerationsCount = prevGenerationsResult.count ?? 0

    // Calculate actual month-over-month changes
    const totalUsers = profilesResult.count ?? 0
    const prevUsers = prevProfilesResult.count ?? 0
    const newUsersThisMonth = totalUsers - prevUsers
    const usersChange = prevUsers > 0
      ? Math.round((newUsersThisMonth / prevUsers) * 100)
      : 0

    const activeSubs = subsResult.count ?? 0
    const prevActiveSubs = prevSubsResult.count ?? 0
    const subsChange = prevActiveSubs > 0
      ? Math.round(((activeSubs - prevActiveSubs) / prevActiveSubs) * 100)
      : 0

    // Calculate proper revenue from subscription tiers and periods
    const activeSubsData = allActiveSubsResult.data || []
    let monthlyRevenue = 0
    for (const sub of activeSubsData) {
      if (sub.tier === 'pro') {
        monthlyRevenue += sub.period === 'annual' ? 15 : 20
      } else if (sub.tier === 'enterprise') {
        monthlyRevenue += sub.period === 'annual' ? 75 : 99
      }
    }

    // Revenue change: compare current MRR with what we'd estimate from prev subs
    // Use simplified approach: prevActiveSubs had some revenue, current has monthlyRevenue
    const estimatedPrevRevenue = prevActiveSubs > 0 ? (prevActiveSubs * (monthlyRevenue / Math.max(activeSubs, 1))) : 0
    const revenueChange = estimatedPrevRevenue > 0
      ? Math.round(((monthlyRevenue - estimatedPrevRevenue) / estimatedPrevRevenue) * 100)
      : 0

    // Build activity feed
    const recentActivity = [
      ...(recentSignupsResult.data || []).map((p: any) => ({
        id: p.id,
        type: 'signup' as const,
        message: `${p.full_name || 'New user'} signed up`,
        timestamp: p.created_at,
      })),
      ...(recentGensResult.data || []).map((g: any) => ({
        id: g.id,
        type: 'generation' as const,
        message: `${g.type}: ${g.model?.split('/').pop() || 'unknown'}`,
        timestamp: g.created_at,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15)

    // Build chart data (simplified -- group generations by day)
    const gensByDay: Record<string, { images: number; videos: number; avatars: number }> = {}
    for (const g of generations) {
      const day = (g as any).created_at?.slice(0, 10)
      if (!day) continue
      if (!gensByDay[day]) gensByDay[day] = { images: 0, videos: 0, avatars: 0 }
      if ((g as any).type === 'ugc-avatar') gensByDay[day].avatars++
      else if ((g as any).type?.includes('video')) gensByDay[day].videos++
      else gensByDay[day].images++
    }

    const generationsChart = Object.entries(gensByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date: date.slice(5), ...counts }))

    const totalCreditsUsed = generations.reduce((sum: number, g: any) => sum + (g.credits_used || 0), 0)

    return NextResponse.json({
      stats: {
        totalUsers,
        activeSubscriptions: activeSubs,
        monthlyRevenue,
        totalGenerations: generationsCount,
        creditsUsed: totalCreditsUsed,
        apiCalls: apiUsageResult.count ?? 0,
        usersChange,
        subsChange,
        revenueChange,
        generationsChange: Math.round(((generationsCount - prevGenerationsCount) / Math.max(prevGenerationsCount, 1)) * 100),
      },
      revenueChart: generationsChart.map(d => ({ date: d.date, revenue: (d.images * 2 + d.videos * 10) })),
      generationsChart,
      recentActivity,
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
