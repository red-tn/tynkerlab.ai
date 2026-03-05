'use client'

import { useState, useEffect, useMemo } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Search, Image, Video, ToggleLeft, ToggleRight } from 'lucide-react'

interface ModelEntry {
  id: string
  displayName: string
  type: 'image' | 'video'
  category: string
  categoryLabel: string
  credits: number
  togetherPrice: string
  enabled: boolean
  defaultEnabled: boolean
  registered: boolean
}

interface ModelsData {
  registered: ModelEntry[]
  unregistered: ModelEntry[]
  togetherModelCount: number
}

export default function AdminModelsPage() {
  const [data, setData] = useState<ModelsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | 'image' | 'video'>('')
  const [statusFilter, setStatusFilter] = useState<'' | 'enabled' | 'disabled'>('')

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await adminFetch('/api/admin/models')
      if (res.ok) setData(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const toggleModel = async (modelId: string, enabled: boolean) => {
    setTogglingId(modelId)
    try {
      const res = await adminFetch('/api/admin/models', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, enabled }),
      })
      if (res.ok) await fetchData(true)
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingId(null)
    }
  }

  const filteredRegistered = useMemo(() => {
    if (!data) return []
    let models = [...data.registered]
    if (search) {
      const q = search.toLowerCase()
      models = models.filter(m => m.displayName.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.categoryLabel.toLowerCase().includes(q))
    }
    if (typeFilter) models = models.filter(m => m.type === typeFilter)
    if (statusFilter === 'enabled') models = models.filter(m => m.enabled)
    if (statusFilter === 'disabled') models = models.filter(m => !m.enabled)
    return models
  }, [data, search, typeFilter, statusFilter])

  const filteredUnregistered = useMemo(() => {
    if (!data) return []
    let models = [...data.unregistered]
    if (search) {
      const q = search.toLowerCase()
      models = models.filter(m => m.displayName.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
    }
    if (typeFilter) models = models.filter(m => m.type === typeFilter)
    return models
  }, [data, search, typeFilter])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Model Management</h1>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-nyx-surface animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const enabledCount = data?.registered.filter(m => m.enabled).length || 0
  const totalRegistered = data?.registered.length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Model Management</h1>
          <p className="text-sm text-gray-400 mt-1">
            {enabledCount} of {totalRegistered} registered models enabled
            {data?.togetherModelCount ? ` — ${data.togetherModelCount} image/video models available on Together.ai` : ''}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-nyx-surface border border-nyx-border hover:border-nyx-borderBright transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh from API
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-nyx-bg border border-nyx-border text-sm text-white placeholder:text-gray-600 focus:border-primary-500/50 focus:outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as any)}
          className="px-2 py-1.5 rounded-lg bg-nyx-bg border border-nyx-border text-xs text-white"
        >
          <option value="">All Types</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="px-2 py-1.5 rounded-lg bg-nyx-bg border border-nyx-border text-xs text-white"
        >
          <option value="">All Status</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Registered Models */}
      <div className="rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-nyx-border">
          <h3 className="text-sm font-semibold text-white">Registered Models ({filteredRegistered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-nyx-border">
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Model</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Type</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Provider</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Credits</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Price</th>
                <th className="text-center px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistered.map(model => {
                const isToggling = togglingId === model.id
                return (
                  <tr key={model.id} className="border-b border-nyx-border/50 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-medium text-white">{model.displayName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{model.id}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        {model.type === 'image' ? <Image className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                        {model.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-300">{model.categoryLabel}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-300 font-mono">{model.credits}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{model.togetherPrice}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => toggleModel(model.id, !model.enabled)}
                        disabled={isToggling}
                        className="inline-flex items-center gap-1.5 disabled:opacity-50"
                        title={model.enabled ? 'Disable model' : 'Enable model'}
                      >
                        {model.enabled ? (
                          <ToggleRight className="h-6 w-6 text-green-400" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-600" />
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredRegistered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No models match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unregistered / Available Models */}
      {filteredUnregistered.length > 0 && (
        <div className="rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-nyx-border">
            <h3 className="text-sm font-semibold text-white">
              Available on Together.ai — Not Registered ({filteredUnregistered.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">These models exist on Together.ai but aren&apos;t in the app&apos;s model registry yet. They need to be added to the codebase to be used.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-nyx-border">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Model</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Type</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Provider</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Pricing</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnregistered.map(model => (
                  <tr key={model.id} className="border-b border-nyx-border/50 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5">
                      <p className="text-sm font-medium text-gray-300">{model.displayName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{model.id}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        {model.type === 'image' ? <Image className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                        {model.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{model.categoryLabel}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{model.togetherPrice}</td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge variant="outline" className="text-[10px] text-gray-500">Not Registered</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
