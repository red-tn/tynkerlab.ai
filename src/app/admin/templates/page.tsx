'use client'

import { useState, useEffect } from 'react'
import type { Template, TemplatePromptVariable, TemplatePhotoSlot, TemplatePlatformPreset } from '@/types/database'
import { adminFetch } from '@/lib/admin-fetch'
import { TEMPLATE_CATEGORIES, PLATFORM_PRESETS, slugify } from '@/lib/templates'
import { ALL_MODELS } from '@/lib/together/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { ImageDropZone } from '@/components/ui/image-drop-zone'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Star, StarOff,
  X, ImageIcon, Film, Sparkles, Database, ChevronRight,
} from 'lucide-react'

const GENERATION_TYPES = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
]

const IMAGE_MODELS = ALL_MODELS.filter(m => m.enabled && m.type === 'image' && m.capabilities.includes('image-to-image')).map(m => ({
  value: m.id, label: `${m.displayName} (${m.credits} cr)`,
}))

const VIDEO_MODELS = ALL_MODELS.filter(m => m.enabled && m.type === 'video' && m.capabilities.includes('image-to-video')).map(m => ({
  value: m.id, label: `${m.displayName} (${m.credits} cr)`,
}))

interface TemplateForm {
  name: string
  slug: string
  description: string
  category: string
  generationType: string
  recommendedModel: string
  basePrompt: string
  promptVariables: TemplatePromptVariable[]
  photoSlots: TemplatePhotoSlot[]
  platformPresets: TemplatePlatformPreset[]
  defaultAspectRatio: string
  defaultPlatform: string
  tags: string
  previewImageUrl: string
  isFeatured: boolean
  isPublished: boolean
  sortOrder: number
}

const EMPTY_FORM: TemplateForm = {
  name: '',
  slug: '',
  description: '',
  category: 'product',
  generationType: 'image',
  recommendedModel: '',
  basePrompt: '',
  promptVariables: [],
  photoSlots: [{ key: 'product', label: 'Product Photo', description: 'Upload your product photo', required: true }],
  platformPresets: [{ platform: 'instagram_feed', aspect_ratio: '1:1', label: 'IG Feed' }],
  defaultAspectRatio: '1:1',
  defaultPlatform: 'instagram_feed',
  tags: '',
  previewImageUrl: '',
  isFeatured: false,
  isPublished: true,
  sortOrder: 0,
}

const EMPTY_VARIABLE: TemplatePromptVariable = { key: '', label: '', type: 'text', placeholder: '', required: true }
const EMPTY_PHOTO_SLOT: TemplatePhotoSlot = { key: '', label: '', description: '', required: true }

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TemplateForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [flyout, setFlyout] = useState<Template | null>(null)
  const [filter, setFilter] = useState<'all' | 'featured' | 'image' | 'video' | string>('all')

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/templates?limit=100')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await adminFetch('/api/admin/templates/seed', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        alert(`Seeded ${data.inserted} templates`)
        fetchTemplates()
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        alert(`Seed failed: ${err.error}`)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to seed templates')
    } finally {
      setSeeding(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        category: form.category,
        generationType: form.generationType,
        recommendedModel: form.recommendedModel,
        basePrompt: form.basePrompt,
        promptVariables: form.promptVariables,
        photoSlots: form.photoSlots,
        platformPresets: form.platformPresets,
        defaultAspectRatio: form.defaultAspectRatio,
        defaultPlatform: form.defaultPlatform,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        isPublished: form.isPublished,
        isFeatured: form.isFeatured,
        sortOrder: form.sortOrder,
      }
      if (form.previewImageUrl) payload.previewImageUrl = form.previewImageUrl

      let res: Response
      if (editingId) {
        res = await adminFetch('/api/admin/templates', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })
      } else {
        res = await adminFetch('/api/admin/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        alert(`Save failed: ${err.error}`)
        return
      }

      setShowDialog(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      fetchTemplates()
    } catch (err) {
      console.error(err)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return
    try {
      await adminFetch(`/api/admin/templates?id=${id}`, { method: 'DELETE' })
      setFlyout(null)
      fetchTemplates()
    } catch (err) {
      console.error(err)
    }
  }

  const togglePublished = async (t: Template) => {
    try {
      await adminFetch('/api/admin/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, isPublished: !t.is_published }),
      })
      fetchTemplates()
    } catch (err) {
      console.error(err)
    }
  }

  const toggleFeatured = async (t: Template) => {
    try {
      await adminFetch('/api/admin/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, isFeatured: !t.is_featured }),
      })
      fetchTemplates()
    } catch (err) {
      console.error(err)
    }
  }

  const openEdit = (t: Template) => {
    setEditingId(t.id)
    setForm({
      name: t.name,
      slug: t.slug,
      description: t.description,
      category: t.category,
      generationType: t.generation_type,
      recommendedModel: t.recommended_model,
      basePrompt: t.base_prompt,
      promptVariables: t.prompt_variables || [],
      photoSlots: t.photo_slots || [],
      platformPresets: t.platform_presets || [],
      defaultAspectRatio: t.default_aspect_ratio,
      defaultPlatform: t.default_platform,
      tags: (t.tags || []).join(', '),
      previewImageUrl: t.preview_image_url || '',
      isFeatured: t.is_featured,
      isPublished: t.is_published,
      sortOrder: t.sort_order,
    })
    setShowDialog(true)
  }

  const filtered = templates.filter(t => {
    if (filter === 'all') return true
    if (filter === 'featured') return t.is_featured
    if (filter === 'image') return t.generation_type === 'image'
    if (filter === 'video') return t.generation_type === 'video'
    return t.category === filter
  })

  const modelOptions = form.generationType === 'video' ? VIDEO_MODELS : IMAGE_MODELS

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Templates</h1>
          <p className="text-sm text-gray-400 mt-1">Pre-built AI workflows for social media content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleSeed} disabled={seeding}>
            <Database className="h-4 w-4 mr-1.5" />
            {seeding ? 'Seeding...' : 'Seed Templates'}
          </Button>
          <Button size="sm" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowDialog(true) }}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'featured', label: 'Featured' },
          { key: 'image', label: 'Image' },
          { key: 'video', label: 'Video' },
          ...TEMPLATE_CATEGORIES.map(c => ({ key: c.value, label: c.label })),
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                : 'bg-white/5 text-gray-400 border border-nyx-border hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading templates...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No templates found. Click &ldquo;Seed Templates&rdquo; to add starter templates.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div
              key={t.id}
              onClick={() => setFlyout(t)}
              className="group relative rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden hover:border-primary-500/30 transition-all cursor-pointer"
            >
              <div className="aspect-video bg-nyx-bg relative overflow-hidden">
                {t.preview_image_url ? (
                  <img src={t.preview_image_url} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {t.generation_type === 'video' ? <Film className="h-8 w-8 text-gray-700" /> : <ImageIcon className="h-8 w-8 text-gray-700" />}
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <Badge variant={t.generation_type === 'video' ? 'info' : 'default'} className="text-[10px]">
                    {t.generation_type}
                  </Badge>
                  <Badge className="text-[10px]">{t.category}</Badge>
                </div>
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(t) }} className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); togglePublished(t) }} className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80">
                    {t.is_published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleFeatured(t) }} className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80">
                    {t.is_featured ? <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id) }} className="p-1.5 rounded-lg bg-black/60 text-red-400 hover:bg-black/80">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white truncate">{t.name}</h3>
                  {!t.is_published && <Badge variant="default" className="text-[9px]">Draft</Badge>}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{t.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                  <span>{t.prompt_variables?.length || 0} vars</span>
                  <span>{t.photo_slots?.length || 0} photos</span>
                  <span>{t.usage_count} uses</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flyout */}
      {flyout && (
        <div className="fixed inset-y-0 right-0 w-96 bg-nyx-surface border-l border-nyx-border z-50 overflow-y-auto animate-slide-in-right shadow-2xl">
          <div className="p-4 border-b border-nyx-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white truncate">{flyout.name}</h2>
            <button onClick={() => setFlyout(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {flyout.preview_image_url && (
              <img src={flyout.preview_image_url} alt={flyout.name} className="w-full rounded-lg" />
            )}
            <div className="flex gap-2 flex-wrap">
              <Badge variant={flyout.generation_type === 'video' ? 'info' : 'default'}>{flyout.generation_type}</Badge>
              <Badge>{flyout.category}</Badge>
              {flyout.is_featured && <Badge className="gradient-primary text-white">Featured</Badge>}
              {!flyout.is_published && <Badge>Draft</Badge>}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-300">{flyout.description}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Base Prompt</p>
              <p className="text-sm text-gray-300 bg-nyx-bg rounded-lg p-3 font-mono text-xs">{flyout.base_prompt}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Recommended Model</p>
              <p className="text-sm text-gray-300">{flyout.recommended_model}</p>
            </div>
            {flyout.prompt_variables?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Variables ({flyout.prompt_variables.length})</p>
                <div className="space-y-1">
                  {flyout.prompt_variables.map(v => (
                    <div key={v.key} className="text-xs text-gray-400 flex gap-2">
                      <span className="text-primary-400 font-mono">{`{${v.key}}`}</span>
                      <span>{v.label} ({v.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {flyout.platform_presets?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Platforms</p>
                <div className="flex gap-1 flex-wrap">
                  {flyout.platform_presets.map(p => (
                    <span key={p.platform} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">{p.label} ({p.aspect_ratio})</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={() => { openEdit(flyout); setFlyout(null) }}>
                <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(flyout.id)}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <Dialog open={showDialog} onClose={() => { setShowDialog(false); setEditingId(null); setForm(EMPTY_FORM) }}>
          <div className="max-w-2xl mx-auto max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingId ? 'Edit Template' : 'Create Template'}
            </h2>
            <div className="space-y-4">
              {/* Basic info */}
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })} />
              <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={TEMPLATE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))} />
                <Select label="Type" value={form.generationType} onChange={(e) => setForm({ ...form, generationType: e.target.value, recommendedModel: '' })} options={GENERATION_TYPES} />
              </div>

              <Select
                label="Recommended Model"
                value={form.recommendedModel}
                onChange={(e) => setForm({ ...form, recommendedModel: e.target.value })}
                options={modelOptions}
                placeholder="Select model..."
              />

              {/* Base prompt */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Base Prompt</label>
                <textarea
                  value={form.basePrompt}
                  onChange={(e) => setForm({ ...form, basePrompt: e.target.value })}
                  placeholder="Use {placeholder} tokens for variables..."
                  className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[80px] font-mono"
                />
              </div>

              {/* Prompt Variables */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Prompt Variables</label>
                  <button
                    onClick={() => setForm({ ...form, promptVariables: [...form.promptVariables, { ...EMPTY_VARIABLE }] })}
                    className="text-xs text-primary-400 hover:text-primary-300"
                  >
                    + Add Variable
                  </button>
                </div>
                {form.promptVariables.map((v, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 items-end">
                    <Input
                      placeholder="Key (e.g. product_type)"
                      value={v.key}
                      onChange={(e) => {
                        const vars = [...form.promptVariables]
                        vars[i] = { ...vars[i], key: e.target.value }
                        setForm({ ...form, promptVariables: vars })
                      }}
                    />
                    <Input
                      placeholder="Label"
                      value={v.label}
                      onChange={(e) => {
                        const vars = [...form.promptVariables]
                        vars[i] = { ...vars[i], label: e.target.value }
                        setForm({ ...form, promptVariables: vars })
                      }}
                    />
                    <Select
                      value={v.type}
                      onChange={(e) => {
                        const vars = [...form.promptVariables]
                        vars[i] = { ...vars[i], type: e.target.value as 'text' | 'select' }
                        setForm({ ...form, promptVariables: vars })
                      }}
                      options={[{ value: 'text', label: 'Text' }, { value: 'select', label: 'Select' }]}
                    />
                    <button
                      onClick={() => {
                        const vars = form.promptVariables.filter((_, idx) => idx !== i)
                        setForm({ ...form, promptVariables: vars })
                      }}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Photo Slots */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Photo Slots</label>
                  <button
                    onClick={() => setForm({ ...form, photoSlots: [...form.photoSlots, { ...EMPTY_PHOTO_SLOT }] })}
                    className="text-xs text-primary-400 hover:text-primary-300"
                  >
                    + Add Slot
                  </button>
                </div>
                {form.photoSlots.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-end">
                    <Input
                      placeholder="Key"
                      value={s.key}
                      onChange={(e) => {
                        const slots = [...form.photoSlots]
                        slots[i] = { ...slots[i], key: e.target.value }
                        setForm({ ...form, photoSlots: slots })
                      }}
                    />
                    <Input
                      placeholder="Label"
                      value={s.label}
                      onChange={(e) => {
                        const slots = [...form.photoSlots]
                        slots[i] = { ...slots[i], label: e.target.value }
                        setForm({ ...form, photoSlots: slots })
                      }}
                    />
                    <button
                      onClick={() => {
                        const slots = form.photoSlots.filter((_, idx) => idx !== i)
                        setForm({ ...form, photoSlots: slots })
                      }}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Platform Presets */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Platform Presets</label>
                <div className="flex gap-2 flex-wrap">
                  {PLATFORM_PRESETS.map(p => {
                    const isActive = form.platformPresets.some(fp => fp.platform === p.platform)
                    return (
                      <button
                        key={p.platform}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            setForm({ ...form, platformPresets: form.platformPresets.filter(fp => fp.platform !== p.platform) })
                          } else {
                            setForm({ ...form, platformPresets: [...form.platformPresets, p] })
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                            : 'bg-white/5 text-gray-400 border border-nyx-border hover:text-white'
                        }`}
                      >
                        {p.label} ({p.aspect_ratio})
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Sort Order" type="number" value={String(form.sortOrder)} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
                <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>

              <ImageDropZone label="Preview Image" value={form.previewImageUrl} onChange={(url) => setForm({ ...form, previewImageUrl: url })} />

              <div className="flex gap-6">
                <Toggle label="Published" checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} />
                <Toggle label="Featured" checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-nyx-border">
              <Button variant="ghost" onClick={() => { setShowDialog(false); setEditingId(null); setForm(EMPTY_FORM) }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.basePrompt || !form.recommendedModel}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
