'use client'

import { useState, useEffect } from 'react'
import { ApiStatusCard } from '@/components/admin/api-status-card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface MonitoringData {
  totalRequests: number
  requestsPerHour: number
  errorCount: number
  errorRate: number
  avgLatency: number
  p95Latency: number
  modelStats: { model: string; count: number }[]
  recentErrors: { id: string; endpoint: string; model: string; error: string; statusCode: number; timestamp: string }[]
}

export default function AdminMonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/monitoring')
        if (res.ok) setData(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

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

  const d = data || { totalRequests: 0, requestsPerHour: 0, errorCount: 0, errorRate: 0, avgLatency: 0, p95Latency: 0, modelStats: [], recentErrors: [] }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">API Monitoring</h1>
        <p className="text-sm text-gray-400 mt-1">Real-time API health and performance metrics</p>
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

      {/* Recent Errors */}
      <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Errors</h3>
        {d.recentErrors.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No errors</p>
        ) : (
          <div className="space-y-3">
            {d.recentErrors.map((err) => (
              <div key={err.id} className="flex items-start gap-3 p-3 rounded-lg bg-nyx-bg text-sm">
                <Badge variant="error" className="shrink-0">{err.statusCode}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-300 truncate">{err.error || 'Unknown error'}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-600">
                    <span>{err.endpoint}</span>
                    <span>{err.model}</span>
                    <span>{formatDate(err.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
