'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Prompt } from '@/types/database'
import { ALL_MODELS } from '@/lib/together/models'
import { ModelCategoryIcon } from '@/components/studio/model-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageDropZone } from '@/components/ui/image-drop-zone'
import {
  ImageIcon, Video, Star, StarOff, Trash2, X,
  ExternalLink, Settings2, Sparkles, ArrowUp, ArrowDown, Check, Loader2
} from 'lucide-react'

interface ToolCardConfig {
  key: string
  title: string
  imageUrl: string
  imageUrlAfter?: string
  prompt: string
}

const DEFAULT_TOOLS: ToolCardConfig[] = [
  { key: 'text-to-image', title: 'Text to Image', imageUrl: '', prompt: '' },
  { key: 'image-to-image', title: 'Image to Image', imageUrl: '', prompt: '' },
  { key: 'text-to-video', title: 'Text to Video', imageUrl: '', prompt: '' },
  { key: 'image-to-video', title: 'Image to Video', imageUrl: '', prompt: '' },
]

export default function AdminHomepagePage() {
  const [tools, setTools] = useState<ToolCardConfig[]>(DEFAULT_TOOLS)
  const [featuredPrompts, setFeaturedPrompts] = useState<Prompt[]>([])
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'tools' | 'gallery'>('gallery')

  // Auto-save state for tools
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialLoad = useRef(true)
  const dataLoaded = useRef(false)

  // Toggling / deleting state
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchPrompts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/prompts?limit=100')
      if (res.ok) {
        const data = await res.json()
        setAllPrompts(data.prompts)
        setFeaturedPrompts(data.prompts.filter((p: Prompt) => p.isFeatured && p.isPublished))
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

        const settingsRes = await fetch('/api/admin/settings?key=homepage_tools')
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          if (data.value) {
            try {
              const saved = JSON.parse(data.value)
              setTools(prev => prev.map(t => {
                const s = saved.find((s: ToolCardConfig) => s.key === t.key)
                return s ? { ...t, imageUrl: s.imageUrl, imageUrlAfter: s.imageUrlAfter || '', prompt: s.prompt || '' } : t
              }))
            } catch {}
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
        // Mark data as loaded, then allow auto-save after a tick
        dataLoaded.current = true
        setTimeout(() => { initialLoad.current = false }, 500)
      }
    }
    fetchData()
  }, [fetchPrompts])

  // Auto-save tools on change (debounced 800ms)
  useEffect(() => {
    if (initialLoad.current || !dataLoaded.current) return

    if (saveTimer.current) clearTimeout(saveTimer.current)
    setAutoSaveStatus('saving')

    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: 'homepage_tools',
            value: JSON.stringify(tools),
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Unknown error' }))
          console.error('Auto-save failed:', err)
          setAutoSaveStatus('error')
          setTimeout(() => setAutoSaveStatus('idle'), 3000)
          return
        }
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 1500)
      } catch (err) {
        console.error('Auto-save error:', err)
        setAutoSaveStatus('error')
        setTimeout(() => setAutoSaveStatus('idle'), 3000)
      }
    }, 800)

    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [tools])

  const toggleFeatured = async (prompt: Prompt) => {
    setTogglingId(prompt.$id)
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prompt.$id, isFeatured: !prompt.isFeatured }),
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
      const res = await fetch(`/api/admin/prompts?id=${promptId}`, { method: 'DELETE' })
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
    const idx = featuredPrompts.findIndex(p => p.$id === prompt.$id)
    if ((direction === 'up' && idx <= 0) || (direction === 'down' && idx >= featuredPrompts.length - 1)) return
    const newOrder = direction === 'up' ? prompt.sortOrder + 1 : Math.max(0, prompt.sortOrder - 1)
    try {
      await fetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prompt.$id, sortOrder: newOrder }),
      })
      await fetchPrompts()
    } catch {}
  }

  const getModelInfo = (modelId: string | null) => {
    if (!modelId) return null
    return ALL_MODELS.find(m => m.id === modelId)
  }

  const nonFeatured = allPrompts.filter(p => !p.isFeatured && p.isPublished)

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

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-nyx-bg rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('gallery')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'gallery' ? 'bg-nyx-surface text-white shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4 inline mr-1.5" />
          Featured Gallery ({featuredPrompts.length})
        </button>
        <button
          onClick={() => setTab('tools')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'tools' ? 'bg-nyx-surface text-white shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Settings2 className="h-4 w-4 inline mr-1.5" />
          Tool Showcase Images
        </button>
      </div>

      {/* Featured Gallery Manager */}
      {tab === 'gallery' && (
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
                  const model = getModelInfo(prompt.modelUsed)
                  const isToggling = togglingId === prompt.$id
                  const isDeleting = deletingId === prompt.$id
                  const isConfirmingDelete = confirmDeleteId === prompt.$id
                  return (
                    <div key={prompt.$id} className="relative rounded-xl border border-yellow-500/20 bg-nyx-surface overflow-hidden group">
                      <div className="aspect-video bg-nyx-bg relative overflow-hidden">
                        {prompt.previewImageUrl ? (
                          <img src={prompt.previewImageUrl} alt={prompt.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-6 w-6 text-gray-700" />
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
                                  onClick={() => deletePrompt(prompt.$id)}
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
                                  onClick={() => setConfirmDeleteId(prompt.$id)}
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
                  const model = getModelInfo(prompt.modelUsed)
                  const isToggling = togglingId === prompt.$id
                  const isDeleting = deletingId === prompt.$id
                  const isConfirmingDelete = confirmDeleteId === prompt.$id
                  return (
                    <div key={prompt.$id} className="relative rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden group hover:border-nyx-border-bright transition-colors">
                      <div className="aspect-video bg-nyx-bg relative overflow-hidden">
                        {prompt.previewImageUrl ? (
                          <img src={prompt.previewImageUrl} alt={prompt.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {prompt.modelType === 'video' ? <Video className="h-6 w-6 text-gray-700" /> : <ImageIcon className="h-6 w-6 text-gray-700" />}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium text-white truncate">{prompt.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="text-[9px]">{prompt.category}</Badge>
                          <div className="flex items-center gap-1">
                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => deletePrompt(prompt.$id)}
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
                                  onClick={() => setConfirmDeleteId(prompt.$id)}
                                  className="text-gray-600 hover:text-red-400 transition-colors"
                                  title="Delete prompt"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => toggleFeatured(prompt)}
                                  disabled={isToggling}
                                  className="text-gray-500 hover:text-yellow-400 transition-colors disabled:opacity-50"
                                  title="Add to featured"
                                >
                                  {isToggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
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
      )}

      {/* Tool Showcase Images */}
      {tab === 'tools' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Set custom images for the &ldquo;Five Powerful Tools&rdquo; section on the homepage. Leave blank to use the default icon-only cards.
            </p>
            {/* Auto-save indicator */}
            <div className="flex items-center gap-1.5 text-xs shrink-0 ml-4">
              {autoSaveStatus === 'saving' && (
                <><Loader2 className="h-3 w-3 animate-spin text-gray-500" /><span className="text-gray-500">Saving...</span></>
              )}
              {autoSaveStatus === 'saved' && (
                <><Check className="h-3 w-3 text-green-400" /><span className="text-green-400">Saved</span></>
              )}
              {autoSaveStatus === 'error' && (
                <><X className="h-3 w-3 text-red-400" /><span className="text-red-400">Save failed</span></>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, idx) => (
              <div key={tool.key} className="rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden">
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">{tool.title}</h3>
                  {tool.key === 'image-to-image' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <ImageDropZone
                        label="Before"
                        value={tool.imageUrl}
                        onChange={(url) => {
                          const updated = [...tools]
                          updated[idx] = { ...tool, imageUrl: url }
                          setTools(updated)
                        }}
                      />
                      <ImageDropZone
                        label="After"
                        value={tool.imageUrlAfter || ''}
                        onChange={(url) => {
                          const updated = [...tools]
                          updated[idx] = { ...tool, imageUrlAfter: url }
                          setTools(updated)
                        }}
                      />
                    </div>
                  ) : (
                    <ImageDropZone
                      label="Showcase Image"
                      value={tool.imageUrl}
                      onChange={(url) => {
                        const updated = [...tools]
                        updated[idx] = { ...tool, imageUrl: url }
                        setTools(updated)
                      }}
                    />
                  )}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-300">Prompt</label>
                    <textarea
                      value={tool.prompt}
                      onChange={(e) => {
                        const updated = [...tools]
                        updated[idx] = { ...tool, prompt: e.target.value }
                        setTools(updated)
                      }}
                      placeholder="Prompt used to generate this image..."
                      rows={2}
                      className="w-full rounded-lg bg-nyx-bg border border-nyx-border px-3 py-2 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
