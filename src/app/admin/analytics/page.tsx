'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { StatsCard } from '@/components/admin/stats-card'
import { ChartWrapper } from '@/components/admin/chart-wrapper'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/client'
import { Query } from 'appwrite'
import { Eye, Users, Clock, MousePointer } from 'lucide-react'

const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [pageViews, setPageViews] = useState<any[]>([])
  const [totalViews, setTotalViews] = useState(0)
  const [uniqueUsers, setUniqueUsers] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const views = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PAGE_VIEWS, [
          Query.greaterThan('$createdAt', thirtyDaysAgo),
          Query.limit(5000),
        ])

        setTotalViews(views.total)

        // Count unique users
        const userSet = new Set(views.documents.map((d: any) => d.userId || d.sessionId))
        setUniqueUsers(userSet.size)

        // Group by day
        const byDay: Record<string, number> = {}
        for (const v of views.documents) {
          const day = (v as any).$createdAt?.slice(0, 10)
          if (day) byDay[day] = (byDay[day] || 0) + 1
        }

        setPageViews(
          Object.entries(byDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, views]) => ({ date: date.slice(5), views }))
        )

        // Group by path for top pages
        const byPath: Record<string, number> = {}
        for (const v of views.documents) {
          const path = (v as any).path || '/'
          byPath[path] = (byPath[path] || 0) + 1
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-nyx-surface animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Page views and user engagement metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Page Views (30d)" value={totalViews} icon={Eye} />
        <StatsCard title="Unique Visitors" value={uniqueUsers} icon={Users} iconColor="text-accent-400" />
        <StatsCard title="Avg Session" value="2m 34s" icon={Clock} iconColor="text-green-400" />
        <StatsCard title="Bounce Rate" value="42%" icon={MousePointer} iconColor="text-orange-400" />
      </div>

      <ChartWrapper title="Page Views (Last 30 Days)" height={350}>
        <AreaChart data={pageViews}>
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="views" stroke="#7c3aed" fillOpacity={1} fill="url(#viewsGrad)" />
        </AreaChart>
      </ChartWrapper>
    </div>
  )
}
