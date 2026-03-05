'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import dynamic from 'next/dynamic'
import { StatsCard } from '@/components/admin/stats-card'
import { ActivityFeed, type ActivityItem } from '@/components/admin/activity-feed'
import { ChartWrapper } from '@/components/admin/chart-wrapper'
import { Users, CreditCard, DollarSign, Image, Coins, Activity, Wallet } from 'lucide-react'

const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })

interface Balances {
  together: { healthy: boolean; error?: string }
  stripe: { available: number; pending: number } | null
  ltx: { healthy: boolean; error?: string }
  wavespeed: { healthy: boolean; error?: string }
}

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
  generationsChart: { date: string; images: number; videos: number; avatars: number }[]
  recentActivity: ActivityItem[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [balances, setBalances] = useState<Balances | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, monitoringRes] = await Promise.all([
          adminFetch('/api/admin/analytics'),
          adminFetch('/api/admin/monitoring'),
        ])
        if (analyticsRes.ok) setData(await analyticsRes.json())
        if (monitoringRes.ok) {
          const m = await monitoringRes.json()
          setBalances(m.balances || null)
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

      {/* Stripe Balance */}
      {balances?.stripe && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-nyx-border bg-nyx-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-green-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stripe Available</span>
            </div>
            <p className="text-2xl font-bold text-white">${balances.stripe.available.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-nyx-border bg-nyx-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stripe Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">${balances.stripe.pending.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* AI Provider Health */}
      {balances && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([
            { key: 'together' as const, label: 'Together.ai' },
            { key: 'ltx' as const, label: 'LTX Video' },
            { key: 'wavespeed' as const, label: 'WaveSpeed' },
          ]).map(({ key, label }) => {
            const provider = balances[key]
            return (
              <div key={key} className="rounded-xl border border-nyx-border bg-nyx-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${provider.healthy ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                </div>
                <p className={`text-lg font-bold ${provider.healthy ? 'text-green-400' : 'text-red-400'}`}>
                  {provider.healthy ? 'Connected' : 'Error'}
                </p>
                {provider.error && (
                  <p className="text-xs text-gray-500 mt-1">{provider.error}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

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
            <Bar dataKey="avatars" fill="#ec4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartWrapper>
      </div>

      {/* Activity Feed */}
      <ActivityFeed items={data?.recentActivity || []} />
    </div>
  )
}
