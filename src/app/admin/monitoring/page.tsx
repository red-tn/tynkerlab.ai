'use client'

import { useState, useEffect, useMemo } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { ApiStatusCard } from '@/components/admin/api-status-card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { ChevronUp, ChevronDown, RefreshCw, Wallet } from 'lucide-react'

interface ErrorEntry {
  id: string
  endpoint: string
  model: string
  error: string
  statusCode: number
  userId: string | null
  timestamp: string
}

interface MonitoringData {
  totalRequests: number
  requestsPerHour: number
  errorCount: number
  errorRate: number
  avgLatency: number
  p95Latency: number
  modelStats: { model: string; count: number }[]
  recentErrors: ErrorEntry[]
  balances: {
    together: { balance: number | null; error?: string }
    stripe: { available: number; pending: number } | null
  }
  filterOptions: {
    models: string[]
    endpoints: string[]
  }
}

type SortField = 'timestamp' | 'statusCode' | 'model' | 'endpoint' | 'userId'
type SortDir = 'asc' | 'desc'

export default function AdminMonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Sort & filter state
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterModel, setFilterModel] = useState('')
  const [filterEndpoint, setFilterEndpoint] = useState('')
  const [filterStatusCode, setFilterStatusCode] = useState('')

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await adminFetch('/api/admin/monitoring')
      if (res.ok) setData(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 30000)
    return () => clearInterval(interval)
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

  // Filter + sort errors
  const filteredErrors = useMemo(() => {
    if (!data) return []
    let errors = [...data.recentErrors]

    if (filterModel) errors = errors.filter(e => e.model === filterModel)
    if (filterEndpoint) errors = errors.filter(e => e.endpoint === filterEndpoint)
    if (filterStatusCode) errors = errors.filter(e => String(e.statusCode) === filterStatusCode)

    errors.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortField) {
        case 'timestamp': return dir * (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        case 'statusCode': return dir * (a.statusCode - b.statusCode)
        case 'model': return dir * (a.model || '').localeCompare(b.model || '')
        case 'endpoint': return dir * (a.endpoint || '').localeCompare(b.endpoint || '')
        case 'userId': return dir * (a.userId || '').localeCompare(b.userId || '')
        default: return 0
      }
    })
    return errors
  }, [data, filterModel, filterEndpoint, filterStatusCode, sortField, sortDir])

  const uniqueStatusCodes = useMemo(() => {
    if (!data) return []
    return [...new Set(data.recentErrors.map(e => String(e.statusCode)))].sort()
  }, [data])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">API Monitoring</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-nyx-surface animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const d = data || { totalRequests: 0, requestsPerHour: 0, errorCount: 0, errorRate: 0, avgLatency: 0, p95Latency: 0, modelStats: [], recentErrors: [], balances: { together: { balance: null }, stripe: null }, filterOptions: { models: [], endpoints: [] } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Monitoring</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time API health, performance metrics, and balances</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-nyx-surface border border-nyx-border hover:border-nyx-borderBright transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* API Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-nyx-border bg-nyx-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-primary-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Together.ai Balance</span>
          </div>
          {d.balances.together.balance !== null ? (
            <p className="text-2xl font-bold text-white">${d.balances.together.balance.toFixed(2)}</p>
          ) : (
            <p className="text-sm text-gray-500">{d.balances.together.error || 'Unavailable'}</p>
          )}
        </div>
        <div className="rounded-xl border border-nyx-border bg-nyx-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-green-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stripe Available</span>
          </div>
          {d.balances.stripe ? (
            <p className="text-2xl font-bold text-white">${d.balances.stripe.available.toFixed(2)}</p>
          ) : (
            <p className="text-sm text-gray-500">Unavailable</p>
          )}
        </div>
        <div className="rounded-xl border border-nyx-border bg-nyx-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-yellow-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stripe Pending</span>
          </div>
          {d.balances.stripe ? (
            <p className="text-2xl font-bold text-white">${d.balances.stripe.pending.toFixed(2)}</p>
          ) : (
            <p className="text-sm text-gray-500">Unavailable</p>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ApiStatusCard title="Requests (24h)" value={d.totalRequests} status={d.totalRequests > 0 ? 'healthy' : 'warning'} />
        <ApiStatusCard title="Error Rate" value={`${d.errorRate}`} unit="%" status={d.errorRate > 5 ? 'critical' : d.errorRate > 1 ? 'warning' : 'healthy'} />
        <ApiStatusCard title="Avg Latency" value={d.avgLatency} unit="ms" status={d.avgLatency > 10000 ? 'critical' : d.avgLatency > 5000 ? 'warning' : 'healthy'} />
        <ApiStatusCard title="P95 Latency" value={d.p95Latency} unit="ms" status={d.p95Latency > 15000 ? 'critical' : d.p95Latency > 8000 ? 'warning' : 'healthy'} />
      </div>

      {/* Model Usage */}
      <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Requests by Model (24h)</h3>
        {d.modelStats.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No data</p>
        ) : (
          <div className="space-y-2">
            {d.modelStats.map(({ model, count }) => {
              const max = d.modelStats[0]?.count || 1
              return (
                <div key={model} className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 w-40 truncate">{model}</span>
                  <div className="flex-1 h-5 bg-nyx-bg rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="text-sm text-gray-400 font-mono w-12 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Errors — sortable + filterable */}
      <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Recent Errors ({filteredErrors.length})</h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={filterModel}
            onChange={e => setFilterModel(e.target.value)}
            className="px-2 py-1 rounded-md bg-nyx-bg border border-nyx-border text-xs text-white"
          >
            <option value="">All Models</option>
            {d.filterOptions.models.map(m => <option key={m} value={m}>{m.split('/').pop()}</option>)}
          </select>
          <select
            value={filterEndpoint}
            onChange={e => setFilterEndpoint(e.target.value)}
            className="px-2 py-1 rounded-md bg-nyx-bg border border-nyx-border text-xs text-white"
          >
            <option value="">All Endpoints</option>
            {d.filterOptions.endpoints.map(ep => <option key={ep} value={ep}>{ep}</option>)}
          </select>
          <select
            value={filterStatusCode}
            onChange={e => setFilterStatusCode(e.target.value)}
            className="px-2 py-1 rounded-md bg-nyx-bg border border-nyx-border text-xs text-white"
          >
            <option value="">All Status Codes</option>
            {uniqueStatusCodes.map(sc => <option key={sc} value={sc}>{sc}</option>)}
          </select>
          {(filterModel || filterEndpoint || filterStatusCode) && (
            <button
              onClick={() => { setFilterModel(''); setFilterEndpoint(''); setFilterStatusCode('') }}
              className="px-2 py-1 rounded-md text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredErrors.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No errors</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-nyx-border">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('statusCode')}>
                    Status <SortIcon field="statusCode" />
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('endpoint')}>
                    Endpoint <SortIcon field="endpoint" />
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('model')}>
                    Model <SortIcon field="model" />
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('userId')}>
                    User <SortIcon field="userId" />
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Error</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase cursor-pointer hover:text-white" onClick={() => handleSort('timestamp')}>
                    Time <SortIcon field="timestamp" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredErrors.map((err) => (
                  <tr key={err.id} className="border-b border-nyx-border/50 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <Badge variant="error" className="text-[10px]">{err.statusCode}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-400 font-mono">{err.endpoint}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-300">{err.model?.split('/').pop() || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 font-mono">{err.userId?.slice(0, 8) || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-300 max-w-[300px] truncate">{err.error || 'Unknown error'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{formatDate(err.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
