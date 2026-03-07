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
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
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
      // Page view queries
      pageViews30dResult,
      pageViews7dResult,
      pageViews24hResult,
      pageViewsRawResult,
    ] = await Promise.all([
      // Current month users
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      // Previous month users (created before 30d ago)
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .lt('created_at', thirtyDaysAgo.toISOString()),
      // Current active subscriptions
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      // Subscriptions that were active 30 days ago
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
      // Page views: 30d count
      supabase.from('page_views').select('*', { count: 'exact', head: true })
        .gt('created_at', thirtyDaysAgo.toISOString()),
      // Page views: 7d count
      supabase.from('page_views').select('*', { count: 'exact', head: true })
        .gt('created_at', sevenDaysAgo.toISOString()),
      // Page views: 24h count
      supabase.from('page_views').select('*', { count: 'exact', head: true })
        .gt('created_at', twentyFourHoursAgo.toISOString()),
      // Page views: raw data for charts (30d, limited fields)
      supabase.from('page_views').select('path, ip_hash, session_id, created_at')
        .gt('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(10000),
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

    // Revenue change
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

    // Build generations chart data (group by day)
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

    // ----- Page View Analytics -----
    const pageViewsRaw = pageViewsRawResult.data || []

    // Daily page views chart (30 days) with views + unique visitors
    const pvByDay: Record<string, { views: number; uniqueIps: Set<string>; uniqueSessions: Set<string> }> = {}
    for (const pv of pageViewsRaw) {
      const day = pv.created_at?.slice(0, 10)
      if (!day) continue
      if (!pvByDay[day]) pvByDay[day] = { views: 0, uniqueIps: new Set(), uniqueSessions: new Set() }
      pvByDay[day].views++
      if (pv.ip_hash) pvByDay[day].uniqueIps.add(pv.ip_hash)
      if (pv.session_id) pvByDay[day].uniqueSessions.add(pv.session_id)
    }

    const pageViewsChart = Object.entries(pvByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: date.slice(5),
        views: data.views,
        unique: Math.max(data.uniqueIps.size, data.uniqueSessions.size),
      }))

    // Top pages (30d)
    const pageHits: Record<string, number> = {}
    for (const pv of pageViewsRaw) {
      pageHits[pv.path] = (pageHits[pv.path] || 0) + 1
    }
    const topPages = Object.entries(pageHits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([path, views]) => ({ path, views }))

    // Unique visitors (30d) by ip_hash
    const uniqueIps30d = new Set(pageViewsRaw.filter(pv => pv.ip_hash).map(pv => pv.ip_hash))
    const uniqueIps7d = new Set(
      pageViewsRaw
        .filter(pv => pv.ip_hash && new Date(pv.created_at) >= sevenDaysAgo)
        .map(pv => pv.ip_hash)
    )
    const uniqueIps24h = new Set(
      pageViewsRaw
        .filter(pv => pv.ip_hash && new Date(pv.created_at) >= twentyFourHoursAgo)
        .map(pv => pv.ip_hash)
    )

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
        // Page view stats
        pageViews24h: pageViews24hResult.count ?? 0,
        pageViews7d: pageViews7dResult.count ?? 0,
        pageViews30d: pageViews30dResult.count ?? 0,
        uniqueVisitors24h: uniqueIps24h.size,
        uniqueVisitors7d: uniqueIps7d.size,
        uniqueVisitors30d: uniqueIps30d.size,
      },
      revenueChart: generationsChart.map(d => ({ date: d.date, revenue: (d.images * 2 + d.videos * 10) })),
      generationsChart,
      recentActivity,
      // Page view data
      pageViewsChart,
      topPages,
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
