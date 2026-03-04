'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { StatsCard } from '@/components/admin/stats-card'
import { ChartWrapper } from '@/components/admin/chart-wrapper'
import { adminFetch } from '@/lib/admin-fetch'
import { Eye, Users } from 'lucide-react'

const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false })
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
        const res = await adminFetch('/api/admin/analytics')
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const data = await res.json()

        setTotalViews(data.stats?.totalGenerations ?? 0)
        setUniqueUsers(data.stats?.totalUsers ?? 0)

        // Use the generationsChart data for the chart
        setPageViews(data.generationsChart ?? [])
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
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
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
        <p className="text-sm text-gray-400 mt-1">Generations and user engagement metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatsCard title="Generations (30d)" value={totalViews} icon={Eye} />
        <StatsCard title="Total Users" value={uniqueUsers} icon={Users} iconColor="text-accent-400" />
      </div>

      <ChartWrapper title="Generations (Last 30 Days)" height={350}>
        <AreaChart data={pageViews}>
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="images" stroke="var(--color-primary-500)" fillOpacity={1} fill="url(#viewsGrad)" name="Images" />
          <Area type="monotone" dataKey="videos" stroke="var(--color-accent-500)" fillOpacity={0.3} fill="none" name="Videos" />
        </AreaChart>
      </ChartWrapper>
    </div>
  )
}
