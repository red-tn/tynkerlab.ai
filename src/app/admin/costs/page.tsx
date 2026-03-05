'use client'

import { useState, useEffect, useMemo } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import dynamic from 'next/dynamic'
import { ChartWrapper } from '@/components/admin/chart-wrapper'
import { DollarSign, TrendingUp, Coins, BarChart3, ChevronUp, ChevronDown, Image, Film, Mic, Brain } from 'lucide-react'

const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false })

interface CostData {
  summary: {
    totalApiCost: number
    totalCreditsUsed: number
    totalGenerations: number
    estimatedRevenue: number
    margin: number
  }
  byProvider: { provider: string; count: number; cost: number; credits: number }[]
  byModel: { model: string; displayName: string; provider: string; count: number; cost: number; credits: number; costPerGen: number }[]
  byService: { service: string; count: number; cost: number; credits: number }[]
  dailyCosts: { date: string; cost: number; credits: number; generations: number }[]
}

type SortField = 'displayName' | 'provider' | 'count' | 'cost' | 'credits' | 'costPerGen'

const PROVIDER_LABELS: Record<string, string> = {
  together: 'Together.ai',
  ltx: 'LTX',
}

const SERVICE_ICONS: Record<string, React.ElementType> = {
  'Image Gen': Image,
  'Video Gen': Film,
  'TTS': Mic,
  'LLM': Brain,
}

const SERVICE_COLORS: Record<string, string> = {
  'Image Gen': 'text-violet-400',
  'Video Gen': 'text-cyan-400',
  'TTS': 'text-amber-400',
  'LLM': 'text-emerald-400',
}

export default function CostAnalysisPage() {
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('cost')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminFetch('/api/admin/costs')
        if (!res.ok) throw new Error('Failed to fetch cost data')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error('Failed to load cost data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 inline ml-0.5" />
      : <ChevronDown className="h-3 w-3 inline ml-0.5" />
  }

  const sortedModels = useMemo(() => {
    if (!data) return []
    const items = [...data.byModel]
    items.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortField) {
        case 'displayName': return dir * a.displayName.localeCompare(b.displayName)
        case 'provider': return dir * a.provider.localeCompare(b.provider)
        case 'count': return dir * (a.count - b.count)
        case 'cost': return dir * (a.cost - b.cost)
        case 'credits': return dir * (a.credits - b.credits)
        case 'costPerGen': return dir * (a.costPerGen - b.costPerGen)
        default: return 0
      }
    })
    return items
  }, [data, sortField, sortDir])

  const chartData = useMemo(() => {
    if (!data) return []
    const avgCreditPrice = 0.035
    return data.dailyCosts.map(d => ({
      ...d,
      cost: Math.round(d.cost * 100) / 100,
      revenue: Math.round(d.credits * avgCreditPrice * 100) / 100,
    }))
  }, [data])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Cost Analysis</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-nyx-surface animate-pulse" />
          ))}
        </div>
        <div className="h-[350px] rounded-xl bg-nyx-surface animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Cost Analysis</h1>
        <p className="text-gray-400">Failed to load cost data.</p>
      </div>
    )
  }

  const { summary } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Cost Analysis</h1>
        <p className="text-sm text-gray-400 mt-1">API costs vs credit revenue (last 30 days)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="API Cost"
          value={`$${summary.totalApiCost.toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-red-400"
        />
        <KpiCard
          title="Credits Used"
          value={summary.totalCreditsUsed.toLocaleString()}
          icon={Coins}
          iconColor="text-yellow-400"
        />
        <KpiCard
          title="Est. Revenue"
          value={`$${summary.estimatedRevenue.toFixed(2)}`}
          icon={TrendingUp}
          iconColor="text-green-400"
        />
        <KpiCard
          title="Margin"
          value={`${summary.margin.toFixed(1)}%`}
          icon={BarChart3}
          iconColor={summary.margin >= 50 ? 'text-green-400' : summary.margin >= 20 ? 'text-yellow-400' : 'text-red-400'}
        />
      </div>

      {/* Service Breakdown */}
      {data.byService && data.byService.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {data.byService.map(s => {
            const icon = SERVICE_ICONS[s.service] || Image
            const color = SERVICE_COLORS[s.service] || 'text-gray-400'
            return (
              <div key={s.service} className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
                <div className="flex items-center gap-2 mb-3">
                  {(() => { const Icon = icon; return <Icon className={`h-4 w-4 ${color}`} /> })()}
                  <h3 className="text-sm font-semibold text-white">{s.service}</h3>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Calls</span>
                    <span className="text-white">{s.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">API Cost</span>
                    <span className="text-white">${s.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Credits</span>
                    <span className="text-white">{s.credits.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Provider Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.byProvider.map(p => (
          <div key={p.provider} className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              {PROVIDER_LABELS[p.provider] || p.provider}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Generations</span>
                <span className="text-white">{p.count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">API Cost</span>
                <span className="text-white">${p.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Credits Used</span>
                <span className="text-white">{p.credits.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Chart */}
      <ChartWrapper title="Daily Cost vs Revenue (30 Days)" height={350}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2a2a3e', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={((value: any, name: any) => [`$${Number(value).toFixed(2)}`, name === 'cost' ? 'API Cost' : 'Revenue']) as any}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value: string) => value === 'cost' ? 'API Cost' : 'Revenue'}
          />
          <Area type="monotone" dataKey="cost" stroke="#ef4444" fill="url(#costGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} />
        </AreaChart>
      </ChartWrapper>

      {/* Model Table */}
      <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Top Models by Cost</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-nyx-border">
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('displayName')}>
                  Model <SortIcon field="displayName" />
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('provider')}>
                  Provider <SortIcon field="provider" />
                </th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('count')}>
                  Gens <SortIcon field="count" />
                </th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('cost')}>
                  API Cost <SortIcon field="cost" />
                </th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('credits')}>
                  Credits <SortIcon field="credits" />
                </th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('costPerGen')}>
                  Cost/Gen <SortIcon field="costPerGen" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedModels.map(m => (
                <tr key={m.model} className="border-b border-nyx-border/50 hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-sm text-white">{m.displayName}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-400">{PROVIDER_LABELS[m.provider] || m.provider}</td>
                  <td className="px-3 py-2.5 text-sm text-white text-right">{m.count.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-sm text-white text-right">${m.cost.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-sm text-white text-right">{m.credits.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-300 text-right">${m.costPerGen.toFixed(4)}</td>
                </tr>
              ))}
              {sortedModels.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">No generation data in the last 30 days</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ title, value, icon: Icon, iconColor }: {
  title: string
  value: string
  icon: React.ElementType
  iconColor: string
}) {
  return (
    <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400">{title}</span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
