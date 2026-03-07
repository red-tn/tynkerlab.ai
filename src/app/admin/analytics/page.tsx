'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { StatsCard } from '@/components/admin/stats-card'
import { ChartWrapper } from '@/components/admin/chart-wrapper'
import { adminFetch } from '@/lib/admin-fetch'
import { Eye, Users, Calendar, Clock, TrendingUp, Trash2 } from 'lucide-react'

const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false })

interface PageViewStats {
  pageViews24h: number
  pageViews7d: number
  pageViews30d: number
  uniqueVisitors24h: number
  uniqueVisitors7d: number
  uniqueVisitors30d: number
}

interface TopPage {
  path: string
  views: number
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PageViewStats>({
    pageViews24h: 0, pageViews7d: 0, pageViews30d: 0,
    uniqueVisitors24h: 0, uniqueVisitors7d: 0, uniqueVisitors30d: 0,
  })
  const [pageViewsChart, setPageViewsChart] = useState<{ date: string; views: number; unique: number }[]>([])
  const [topPages, setTopPages] = useState<TopPage[]>([])
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('30d')
  const [purgeIp, setPurgeIp] = useState('')
  const [purging, setPurging] = useState(false)
  const [purgeResult, setPurgeResult] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminFetch('/api/admin/analytics')
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const data = await res.json()

        setStats({
          pageViews24h: data.stats?.pageViews24h ?? 0,
          pageViews7d: data.stats?.pageViews7d ?? 0,
          pageViews30d: data.stats?.pageViews30d ?? 0,
          uniqueVisitors24h: data.stats?.uniqueVisitors24h ?? 0,
          uniqueVisitors7d: data.stats?.uniqueVisitors7d ?? 0,
          uniqueVisitors30d: data.stats?.uniqueVisitors30d ?? 0,
        })
        setPageViewsChart(data.pageViewsChart ?? [])
        setTopPages(data.topPages ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePurgeIp = async () => {
    if (!purgeIp.trim()) return
    setPurging(true)
    setPurgeResult(null)
    try {
      // Hash the IP the same way the server does (sha256 + slice 0..16)
      const enc = new TextEncoder().encode(purgeIp.trim() + 'tynkerlab')
      const hashBuf = await crypto.subtle.digest('SHA-256', enc)
      const ipHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)

      const res = await adminFetch('/api/admin/analytics', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipHash }),
      })
      const data = await res.json()
      if (res.ok) {
        setPurgeResult(`Deleted ${data.deleted} page view(s) for IP hash ${ipHash}`)
        setPurgeIp('')
        // Refresh data
        window.location.reload()
      } else {
        setPurgeResult(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setPurgeResult(`Error: ${err.message}`)
    } finally {
      setPurging(false)
    }
  }

  const periodViews = period === '24h' ? stats.pageViews24h : period === '7d' ? stats.pageViews7d : stats.pageViews30d
  const periodUnique = period === '24h' ? stats.uniqueVisitors24h : period === '7d' ? stats.uniqueVisitors7d : stats.uniqueVisitors30d
  const avgPerDay = period === '24h' ? stats.pageViews24h : period === '7d' ? Math.round(stats.pageViews7d / 7) : Math.round(stats.pageViews30d / 30)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Page views and visitor analytics</p>
        </div>
        {/* Period toggle */}
        <div className="flex gap-1 p-1 rounded-lg bg-nyx-surface border border-nyx-border">
          {(['24h', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p
                  ? 'bg-primary-500/20 text-primary-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {p === '24h' ? 'Today' : p === '7d' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Page Views" value={periodViews.toLocaleString()} icon={Eye} iconColor="text-emerald-400" />
        <StatsCard title="Unique Visitors" value={periodUnique.toLocaleString()} icon={Users} iconColor="text-accent-400" />
        <StatsCard title="Avg Views / Day" value={avgPerDay.toLocaleString()} icon={TrendingUp} iconColor="text-primary-400" />
        <StatsCard
          title="Views / Visitor"
          value={periodUnique > 0 ? (periodViews / periodUnique).toFixed(1) : '0'}
          icon={Clock}
          iconColor="text-yellow-400"
        />
      </div>

      {/* Quick summary: all periods */}
      <div className="grid grid-cols-3 gap-4">
        {([
          { label: 'Today', views: stats.pageViews24h, unique: stats.uniqueVisitors24h, icon: Clock },
          { label: 'This Week', views: stats.pageViews7d, unique: stats.uniqueVisitors7d, icon: Calendar },
          { label: 'This Month', views: stats.pageViews30d, unique: stats.uniqueVisitors30d, icon: Calendar },
        ]).map(({ label, views, unique, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-nyx-border bg-nyx-surface p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-baseline gap-4">
              <div>
                <p className="text-2xl font-bold text-white">{views.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">page views</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent-400">{unique.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">unique visitors</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Chart */}
        <ChartWrapper title="Daily Page Views (30 Days)" height={350}>
          <AreaChart data={pageViewsChart}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: 12 }} />
            <Legend />
            <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#viewsGrad)" name="Page Views" />
            <Area type="monotone" dataKey="unique" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#uniqueGrad)" name="Unique Visitors" />
          </AreaChart>
        </ChartWrapper>

        {/* Top Pages */}
        <ChartWrapper title="Top Pages (30 Days)" height={350}>
          <BarChart data={topPages.slice(0, 10)} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="path" stroke="#6b7280" tick={{ fontSize: 10 }} width={95} />
            <Tooltip contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="views" fill="#7c3aed" radius={[0, 4, 4, 0]} name="Views" />
          </BarChart>
        </ChartWrapper>
      </div>

      {/* Full top pages table */}
      {topPages.length > 0 && (
        <div className="rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-nyx-border">
            <h3 className="text-sm font-semibold text-white">All Pages (Last 30 Days)</h3>
          </div>
          <div className="divide-y divide-nyx-border">
            {topPages.map((page, i) => (
              <div key={page.path} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-5 text-right">{i + 1}</span>
                  <span className="text-sm text-gray-300 font-mono">{page.path}</span>
                </div>
                <span className="text-sm font-medium text-white">{page.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IP Purge tool */}
      <div className="rounded-xl border border-nyx-border bg-nyx-surface p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Exclude IP from Analytics</h3>
        <p className="text-xs text-gray-500 mb-3">Remove all page views from a specific IP address. The IP is hashed before deletion.</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 66.128.248.30"
            value={purgeIp}
            onChange={(e) => setPurgeIp(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-nyx-dark border border-nyx-border text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-500"
          />
          <button
            onClick={handlePurgeIp}
            disabled={purging || !purgeIp.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {purging ? 'Purging...' : 'Purge'}
          </button>
        </div>
        {purgeResult && (
          <p className={`text-xs mt-2 ${purgeResult.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
            {purgeResult}
          </p>
        )}
      </div>
    </div>
  )
}
