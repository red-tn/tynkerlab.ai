'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import type { Prompt } from '@/types/database'
import { ALL_MODELS } from '@/lib/together/models'
import { ModelCategoryIcon } from '@/components/studio/model-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ImageIcon, Video, Star, StarOff, Trash2,
  ExternalLink, Sparkles, ArrowUp, ArrowDown, Loader2
} from 'lucide-react'

export default function AdminHomepagePage() {
  const [featuredPrompts, setFeaturedPrompts] = useState<Prompt[]>([])
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  // Toggling / deleting state
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchPrompts = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/prompts?limit=100')
      if (res.ok) {
        const data = await res.json()
        setAllPrompts(data.prompts)
        setFeaturedPrompts(data.prompts.filter((p: Prompt) => p.is_featured && p.is_published))
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await fetchPrompts()
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [fetchPrompts])

  const toggleFeatured = async (prompt: Prompt) => {
    setTogglingId(prompt.id)
    try {
      const res = await adminFetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prompt.id, isFeatured: !prompt.is_featured }),
      })
      if (!res.ok) {
        const err = await res.json()
        console.error('Toggle featured failed:', err)
      }
      await fetchPrompts()
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingId(null)
    }
  }

  const deletePrompt = async (promptId: string) => {
    setDeletingId(promptId)
    try {
      const res = await adminFetch(`/api/admin/prompts?id=${promptId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        console.error('Delete failed:', err)
      }
      await fetchPrompts()
      setConfirmDeleteId(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const moveFeatured = async (prompt: Prompt, direction: 'up' | 'down') => {
    const idx = featuredPrompts.findIndex(p => p.id === prompt.id)
    if ((direction === 'up' && idx <= 0) || (direction === 'down' && idx >= featuredPrompts.length - 1)) return
    const newOrder = direction === 'up' ? prompt.sort_order + 1 : Math.max(0, prompt.sort_order - 1)
    try {
      await adminFetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prompt.id, sortOrder: newOrder }),
      })
      await fetchPrompts()
    } catch {}
  }

  const getModelInfo = (modelId: string | null) => {
    if (!modelId) return null
    return ALL_MODELS.find(m => m.id === modelId)
  }

  const nonFeatured = allPrompts.filter(p => !p.is_featured && p.is_published)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Homepage Editor</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage the featured gallery and tool showcase images on the landing page
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="sm">
            <ExternalLink className="h-4 w-4 mr-1.5" /> Preview Homepage
          </Button>
        </a>
      </div>

      {/* Featured Gallery Manager */}
      <div className="space-y-6">
          {/* Currently featured */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" /> Currently Featured
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-video rounded-xl bg-nyx-surface animate-pulse" />
                ))}
              </div>
            ) : featuredPrompts.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-nyx-border rounded-xl">
                <Sparkles className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 mb-1">No featured prompts yet.</p>
                <p className="text-sm text-gray-600">
                  Create prompts in the{' '}
                  <a href="/admin/prompts" className="text-primary-400 hover:text-primary-300 underline underline-offset-2">
                    Prompts manager
                  </a>{' '}
                  first, then return here to feature them.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {featuredPrompts.map((prompt) => {
                  const model = getModelInfo(prompt.model_used)
                  const isToggling = togglingId === prompt.id
                  const isDeleting = deletingId === prompt.id
                  const isConfirmingDelete = confirmDeleteId === prompt.id
                  return (
                    <div key={prompt.id} className="relative rounded-xl border border-yellow-500/20 bg-nyx-surface overflow-hidden group">
                      <div className="aspect-video bg-nyx-bg relative overflow-hidden">
                        {prompt.preview_image_url ? (
                          prompt.model_type === 'video' ? (
                            <video src={prompt.preview_image_url} className="w-full h-full object-cover" muted playsInline controls />
                          ) : (
                            <img src={prompt.preview_image_url} alt={prompt.title} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {prompt.model_type === 'video' ? <Video className="h-6 w-6 text-gray-700" /> : <ImageIcon className="h-6 w-6 text-gray-700" />}
                          </div>
                        )}
                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => moveFeatured(prompt, 'up')} className="p-1 rounded bg-black/70 text-white hover:bg-black/90">
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button onClick={() => moveFeatured(prompt, 'down')} className="p-1 rounded bg-black/70 text-white hover:bg-black/90">
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium text-white truncate">{prompt.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          {model && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                              <ModelCategoryIcon category={model.category} className="h-2.5 w-2.5" />
                              {model.displayName}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => deletePrompt(prompt.id)}
                                  disabled={isDeleting}
                                  className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                                >
                                  {isDeleting ? 'Deleting...' : 'Confirm'}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 text-[10px] text-gray-500 hover:text-white rounded transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => setConfirmDeleteId(prompt.id)}
                                  className="text-gray-600 hover:text-red-400 transition-colors"
                                  title="Delete prompt"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => toggleFeatured(prompt)}
                                  disabled={isToggling}
                                  className="text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
                                  title="Remove from featured"
                                >
                                  {isToggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <StarOff className="h-3.5 w-3.5" />}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Available prompts to feature */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">
              Available Prompts ({nonFeatured.length})
            </h2>
            {nonFeatured.length === 0 ? (
              <p className="text-sm text-gray-500">All published prompts are already featured, or there are no published prompts.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {nonFeatured.map((prompt) => {
                  const model = getModelInfo(prompt.model_used)
                  const isToggling = togglingId === prompt.id
                  const isDeleting = deletingId === prompt.id
                  const isConfirmingDelete = confirmDeleteId === prompt.id
                  return (
                    <div key={prompt.id} className="relative rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden group hover:border-nyx-border-bright transition-colors">
                      <div className="aspect-video bg-nyx-bg relative overflow-hidden">
                        {prompt.preview_image_url ? (
                          prompt.model_type === 'video' ? (
                            <video src={prompt.preview_image_url} className="w-full h-full object-cover" muted playsInline controls />
                          ) : (
                            <img src={prompt.preview_image_url} alt={prompt.title} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {prompt.model_type === 'video' ? <Video className="h-6 w-6 text-gray-700" /> : <ImageIcon className="h-6 w-6 text-gray-700" />}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium text-white truncate">{prompt.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="text-[9px]">{prompt.category}</Badge>
                          <div className="flex items-center gap-1.5">
                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => deletePrompt(prompt.id)}
                                  disabled={isDeleting}
                                  className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                                >
                                  {isDeleting ? '...' : 'Delete'}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 text-[10px] text-gray-500 hover:text-white rounded transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => setConfirmDeleteId(prompt.id)}
                                  className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Delete prompt"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => toggleFeatured(prompt)}
                                  disabled={isToggling}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors disabled:opacity-50"
                                  title="Add to featured"
                                >
                                  {isToggling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Star className="h-3 w-3" />}
                                  Feature
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
      </div>
    </div>
  )
}
