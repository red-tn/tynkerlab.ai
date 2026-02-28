'use client'

import { useState, useEffect } from 'react'
import type { Prompt } from '@/types/database'
import { ALL_MODELS } from '@/lib/together/models'
import { ModelCategoryIcon } from '@/components/studio/model-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { ImageDropZone } from '@/components/ui/image-drop-zone'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Star, StarOff,
  X, ImageIcon, Video, Copy, ExternalLink, Sparkles, Globe
} from 'lucide-react'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'photography', label: 'Photography' },
  { value: 'art', label: 'Art' },
  { value: 'anime', label: 'Anime' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'nature', label: 'Nature' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'abstract', label: 'Abstract' },
]

const MODEL_TYPES = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
]

const MODEL_OPTIONS = ALL_MODELS.filter(m => m.enabled).map(m => ({
  value: m.id,
  label: m.displayName,
  category: m.category,
  categoryLabel: m.categoryLabel,
}))

interface PromptForm {
  title: string
  promptText: string
  category: string
  modelType: string
  modelUsed: string
  previewImageUrl: string
  isFeatured: boolean
  isPublished: boolean
}

const EMPTY_FORM: PromptForm = {
  title: '',
  promptText: '',
  category: 'general',
  modelType: 'image',
  modelUsed: '',
  previewImageUrl: '',
  isFeatured: false,
  isPublished: true,
}

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PromptForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [flyout, setFlyout] = useState<Prompt | null>(null)
  const [filter, setFilter] = useState<'all' | 'featured' | 'image' | 'video'>('all')

  const fetchPrompts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/prompts?limit=100')
      if (res.ok) {
        const data = await res.json()
        setPrompts(data.prompts)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPrompts() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        promptText: form.promptText,
        category: form.category,
        modelType: form.modelType,
        isPublished: form.isPublished,
        isFeatured: form.isFeatured,
      }
      if (form.modelUsed) payload.modelUsed = form.modelUsed
      if (form.previewImageUrl) payload.previewImageUrl = form.previewImageUrl

      let res: Response
      if (editingId) {
        res = await fetch('/api/admin/prompts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      } else {
        res = await fetch('/api/admin/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Save failed:', err)
        alert(`Save failed: ${err.error || 'Unknown error'}`)
        return
      }

      setShowDialog(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      fetchPrompts()
    } catch (err) {
      console.error(err)
      alert('Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prompt?')) return
    try {
      await fetch(`/api/admin/prompts?id=${id}`, { method: 'DELETE' })
      if (flyout?.$id === id) setFlyout(null)
      fetchPrompts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingId(prompt.$id)
    setForm({
      title: prompt.title,
      promptText: prompt.promptText,
      category: prompt.category,
      modelType: prompt.modelType,
      modelUsed: prompt.modelUsed || '',
      previewImageUrl: prompt.previewImageUrl || '',
      isFeatured: prompt.isFeatured,
      isPublished: prompt.isPublished,
    })
    setShowDialog(true)
  }

  const toggleFeatured = async (prompt: Prompt) => {
    try {
      await fetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prompt.$id, isFeatured: !prompt.isFeatured }),
      })
      fetchPrompts()
    } catch (err) {
      console.error(err)
    }
  }

  const togglePublished = async (prompt: Prompt) => {
    try {
      await fetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prompt.$id, isPublished: !prompt.isPublished }),
      })
      fetchPrompts()
    } catch (err) {
      console.error(err)
    }
  }

  const getModelInfo = (modelId: string | null) => {
    if (!modelId) return null
    return ALL_MODELS.find(m => m.id === modelId)
  }

  const filtered = prompts.filter(p => {
    if (filter === 'featured') return p.isFeatured
    if (filter === 'image') return p.modelType === 'image'
    if (filter === 'video') return p.modelType === 'video'
    return true
  })

  return (
    <div className="flex gap-0 h-[calc(100vh-4rem)]">
      {/* Main content */}
      <div className={`flex-1 overflow-y-auto p-6 transition-all ${flyout ? 'pr-0' : ''}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Prompts</h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage curated prompts for the gallery &middot; {prompts.length} total &middot; {prompts.filter(p => p.isFeatured).length} featured
              </p>
            </div>
            <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowDialog(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Prompt
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2">
            {(['all', 'featured', 'image', 'video'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-500/10 text-primary-400 ring-1 ring-primary-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {f === 'all' ? 'All' : f === 'featured' ? `Featured (${prompts.filter(p => p.isFeatured).length})` : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Prompts grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading prompts...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No prompts found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((prompt) => {
                const model = getModelInfo(prompt.modelUsed)
                return (
                  <div
                    key={prompt.$id}
                    onClick={() => setFlyout(flyout?.$id === prompt.$id ? null : prompt)}
                    className={`group relative rounded-xl border bg-nyx-surface overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/5 ${
                      flyout?.$id === prompt.$id
                        ? 'border-primary-500/50 ring-1 ring-primary-500/20'
                        : 'border-nyx-border hover:border-nyx-border-bright'
                    }`}
                  >
                    {/* Preview image */}
                    <div className="aspect-video bg-nyx-bg relative overflow-hidden">
                      {prompt.previewImageUrl ? (
                        prompt.modelType === 'video' ? (
                          <video src={prompt.previewImageUrl} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={prompt.previewImageUrl} alt={prompt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        )
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          {prompt.modelType === 'video' ? (
                            <Video className="h-8 w-8 text-gray-700" />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-gray-700" />
                          )}
                        </div>
                      )}
                      {/* Overlay badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        {prompt.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-500/90 text-[10px] font-bold text-black flex items-center gap-1">
                            <Star className="h-2.5 w-2.5" /> FEATURED
                          </span>
                        )}
                        {!prompt.isPublished && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-700/90 text-[10px] font-medium text-gray-300">DRAFT</span>
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant={prompt.modelType === 'video' ? 'info' : 'default'} className="text-[10px]">
                          {prompt.modelType}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white truncate mb-1">{prompt.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{prompt.promptText}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {model && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-nyx-bg rounded-md px-1.5 py-0.5">
                              <ModelCategoryIcon category={model.category} className="h-3 w-3" />
                              {model.displayName}
                            </span>
                          )}
                          <Badge variant="outline" className="text-[10px]">{prompt.category}</Badge>
                        </div>
                        <span className="text-[10px] text-gray-600">{prompt.usageCount || 0} uses</span>
                      </div>
                    </div>

                    {/* Quick actions (on hover) */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePublished(prompt) }}
                        className="p-1.5 rounded-lg bg-nyx-bg/80 backdrop-blur-sm hover:bg-success/20 text-gray-400 hover:text-success transition-colors"
                        title={prompt.isPublished ? 'Unpublish' : 'Publish to Gallery'}
                      >
                        {prompt.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFeatured(prompt) }}
                        className="p-1.5 rounded-lg bg-nyx-bg/80 backdrop-blur-sm hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400 transition-colors"
                        title={prompt.isFeatured ? 'Unfeature' : 'Feature'}
                      >
                        {prompt.isFeatured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(prompt) }}
                        className="p-1.5 rounded-lg bg-nyx-bg/80 backdrop-blur-sm hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(prompt.$id) }}
                        className="p-1.5 rounded-lg bg-nyx-bg/80 backdrop-blur-sm hover:bg-error/10 text-gray-400 hover:text-error transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Flyout detail panel */}
      {flyout && (
        <div className="w-96 border-l border-nyx-border bg-nyx-surface overflow-y-auto shrink-0 animate-slide-in-right">
          <div className="sticky top-0 bg-nyx-surface border-b border-nyx-border px-4 py-3 flex items-center justify-between z-10">
            <h3 className="text-sm font-semibold text-white">Prompt Details</h3>
            <button onClick={() => setFlyout(null)} className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Preview */}
          <div className="aspect-video bg-nyx-bg relative overflow-hidden">
            {flyout.previewImageUrl ? (
              flyout.modelType === 'video' ? (
                <video src={flyout.previewImageUrl} className="w-full h-full object-cover" controls muted />
              ) : (
                <img src={flyout.previewImageUrl} alt={flyout.title} className="w-full h-full object-cover" />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600">
                <ImageIcon className="h-12 w-12" />
              </div>
            )}
          </div>

          <div className="p-4 space-y-5">
            {/* Title + badges */}
            <div>
              <h2 className="text-lg font-bold text-white mb-2">{flyout.title}</h2>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={flyout.modelType === 'video' ? 'info' : 'default'}>{flyout.modelType}</Badge>
                <Badge variant="outline">{flyout.category}</Badge>
                {flyout.isFeatured && <Badge variant="warning">Featured</Badge>}
                {flyout.isPublished ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="default">Draft</Badge>
                )}
              </div>
            </div>

            {/* Engine / Model */}
            {(() => {
              const model = getModelInfo(flyout.modelUsed)
              if (!model) return null
              return (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">Engine</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-nyx-bg border border-nyx-border">
                    <ModelCategoryIcon category={model.category} className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium text-white">{model.displayName}</p>
                      <p className="text-[10px] text-gray-500">{model.categoryLabel} &middot; {model.credits} credits</p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Prompt text */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Prompt</label>
                <button
                  onClick={() => navigator.clipboard.writeText(flyout.promptText)}
                  className="text-[10px] text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <div className="p-3 rounded-lg bg-nyx-bg border border-nyx-border text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto">
                {flyout.promptText}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-nyx-bg border border-nyx-border text-center">
                <p className="text-lg font-bold text-white">{flyout.usageCount || 0}</p>
                <p className="text-[10px] text-gray-500">Total Uses</p>
              </div>
              <div className="p-3 rounded-lg bg-nyx-bg border border-nyx-border text-center">
                <p className="text-lg font-bold text-white">{flyout.sortOrder || 0}</p>
                <p className="text-[10px] text-gray-500">Sort Order</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => handleEdit(flyout)}>
                <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => toggleFeatured(flyout)}>
                {flyout.isFeatured ? <StarOff className="h-3.5 w-3.5 mr-1.5" /> : <Star className="h-3.5 w-3.5 mr-1.5" />}
                {flyout.isFeatured ? 'Unfeature' : 'Feature'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => togglePublished(flyout)}
              >
                {flyout.isPublished ? <EyeOff className="h-3.5 w-3.5 mr-1.5" /> : <Globe className="h-3.5 w-3.5 mr-1.5" />}
                {flyout.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
              {flyout.isPublished && (
                <a
                  href="/prompts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-nyx-border bg-nyx-surface text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Gallery
                </a>
              )}
            </div>
            <Button
              variant="ghost"
              className="w-full text-error hover:bg-error/10"
              onClick={() => handleDelete(flyout.$id)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Prompt
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      {showDialog && (
        <Dialog open onClose={() => setShowDialog(false)} title={editingId ? 'Edit Prompt' : 'Add Prompt'} size="lg">
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Prompt title" />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Prompt Text</label>
              <textarea
                value={form.promptText}
                onChange={(e) => setForm({ ...form, promptText: e.target.value })}
                placeholder="The full prompt text..."
                rows={4}
                className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORIES} />
              <Select label="Content Type" value={form.modelType} onChange={(e) => setForm({ ...form, modelType: e.target.value })} options={MODEL_TYPES} />
            </div>

            {/* Model selector */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">AI Model Used</label>
              <select
                value={form.modelUsed}
                onChange={(e) => setForm({ ...form, modelUsed: e.target.value })}
                className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="">Select model (optional)</option>
                {Object.entries(
                  MODEL_OPTIONS.reduce((acc, m) => {
                    if (!acc[m.categoryLabel]) acc[m.categoryLabel] = []
                    acc[m.categoryLabel].push(m)
                    return acc
                  }, {} as Record<string, typeof MODEL_OPTIONS>)
                ).map(([group, models]) => (
                  <optgroup key={group} label={group}>
                    {models.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Preview image — drag & drop or click to upload */}
            <ImageDropZone
              label="Preview Image/Video"
              value={form.previewImageUrl}
              onChange={(url) => setForm({ ...form, previewImageUrl: url })}
            />

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Toggle checked={form.isPublished} onChange={(checked) => setForm({ ...form, isPublished: checked })} />
                <span className="text-sm text-gray-300">Published</span>
              </div>
              <div className="flex items-center gap-3">
                <Toggle checked={form.isFeatured} onChange={(checked) => setForm({ ...form, isFeatured: checked })} />
                <span className="text-sm text-gray-300 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-400" /> Featured
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving} disabled={!form.title || !form.promptText}>
                <Sparkles className="h-4 w-4 mr-1.5" />
                {editingId ? 'Update Prompt' : 'Create Prompt'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
