import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'

export async function GET() {
  try {
    const { databases } = createAdminClient()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Fetch all data in parallel
    const [profiles, subs, generations, prevGenerations, apiUsage, recentGens, recentSignups] = await Promise.all([
      databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, [Query.equal('status', 'active'), Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.greaterThan('$createdAt', thirtyDaysAgo.toISOString()), Query.limit(5000),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.greaterThan('$createdAt', sixtyDaysAgo.toISOString()),
        Query.lessThan('$createdAt', thirtyDaysAgo.toISOString()),
        Query.limit(1),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.API_USAGE_LOG, [
        Query.greaterThan('$createdAt', twentyFourHoursAgo.toISOString()), Query.limit(1),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.orderDesc('$createdAt'), Query.limit(10),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
        Query.orderDesc('$createdAt'), Query.limit(5),
      ]),
    ])

    // Build activity feed
    const recentActivity = [
      ...recentSignups.documents.map((p: any) => ({
        id: p.$id,
        type: 'signup' as const,
        message: `${p.fullName || 'New user'} signed up`,
        timestamp: p.$createdAt,
      })),
      ...recentGens.documents.map((g: any) => ({
        id: g.$id,
        type: 'generation' as const,
        message: `${g.type}: ${g.model?.split('/').pop() || 'unknown'}`,
        timestamp: g.$createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15)

    // Build chart data (simplified — group generations by day)
    const gensByDay: Record<string, { images: number; videos: number }> = {}
    for (const g of generations.documents) {
      const day = (g as any).$createdAt?.slice(0, 10)
      if (!day) continue
      if (!gensByDay[day]) gensByDay[day] = { images: 0, videos: 0 }
      if ((g as any).type?.includes('video')) gensByDay[day].videos++
      else gensByDay[day].images++
    }

    const generationsChart = Object.entries(gensByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date: date.slice(5), ...counts }))

    const totalCreditsUsed = generations.documents.reduce((sum: number, g: any) => sum + (g.creditsUsed || 0), 0)

    return NextResponse.json({
      stats: {
        totalUsers: profiles.total,
        activeSubscriptions: subs.total,
        monthlyRevenue: subs.total * 20, // Simplified estimate
        totalGenerations: generations.total,
        creditsUsed: totalCreditsUsed,
        apiCalls: apiUsage.total,
        usersChange: 12,
        subsChange: 5,
        revenueChange: 8,
        generationsChange: Math.round(((generations.total - prevGenerations.total) / Math.max(prevGenerations.total, 1)) * 100),
      },
      revenueChart: generationsChart.map(d => ({ date: d.date, revenue: (d.images * 2 + d.videos * 10) })),
      generationsChart,
      recentActivity,
    })
  } catch (error: any) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
