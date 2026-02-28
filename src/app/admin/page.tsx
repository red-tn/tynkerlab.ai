'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { StatsCard } from '@/components/admin/stats-card'
import { ActivityFeed, type ActivityItem } from '@/components/admin/activity-feed'
import { ChartWrapper } from '@/components/admin/chart-wrapper'
import { Users, CreditCard, DollarSign, Image, Coins, Activity } from 'lucide-react'

const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })

interface DashboardData {
  stats: {
    totalUsers: number
    activeSubscriptions: number
    monthlyRevenue: number
    totalGenerations: number
    creditsUsed: number
    apiCalls: number
    usersChange: number
    subsChange: number
    revenueChange: number
    generationsChange: number
  }
  revenueChart: { date: string; revenue: number }[]
  generationsChart: { date: string; images: number; videos: number }[]
  recentActivity: ActivityItem[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/analytics')
        if (res.ok) {
          setData(await res.json())
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-nyx-surface animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const stats = data?.stats || {
    totalUsers: 0, activeSubscriptions: 0, monthlyRevenue: 0,
    totalGenerations: 0, creditsUsed: 0, apiCalls: 0,
    usersChange: 0, subsChange: 0, revenueChange: 0, generationsChange: 0,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Users" value={stats.totalUsers} change={stats.usersChange} changeLabel="vs last month" icon={Users} />
        <StatsCard title="Active Subscriptions" value={stats.activeSubscriptions} change={stats.subsChange} changeLabel="vs last month" icon={CreditCard} iconColor="text-accent-400" />
        <StatsCard title="Monthly Revenue" value={`$${stats.monthlyRevenue.toLocaleString()}`} change={stats.revenueChange} changeLabel="vs last month" icon={DollarSign} iconColor="text-green-400" />
        <StatsCard title="Total Generations" value={stats.totalGenerations} change={stats.generationsChange} changeLabel="vs last month" icon={Image} />
        <StatsCard title="Credits Used" value={stats.creditsUsed} icon={Coins} iconColor="text-yellow-400" />
        <StatsCard title="API Calls (24h)" value={stats.apiCalls} icon={Activity} iconColor="text-orange-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Revenue (Last 30 Days)">
          <LineChart data={data?.revenueChart || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartWrapper>

        <ChartWrapper title="Generations (Last 30 Days)">
          <BarChart data={data?.generationsChart || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="images" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="videos" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartWrapper>
      </div>

      {/* Activity Feed */}
      <ActivityFeed items={data?.recentActivity || []} />
    </div>
  )
}
