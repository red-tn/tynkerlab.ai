'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import type { Generation, PromptCategory } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog } from '@/components/ui/dialog'
import { Lightbox } from '@/components/ui/lightbox'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Image as ImageIcon, Video, Download, ChevronLeft, ChevronRight, BookOpen, Send, Trash2, Info } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { downloadFile } from '@/lib/download'
import { adminFetch } from '@/lib/admin-fetch'
import { getModelById } from '@/lib/together/models'
import { ModelCategoryIcon } from '@/components/studio/model-icons'

const CATEGORIES: { value: PromptCategory; label: string }[] = [
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

const PAGE_SIZE = 12

export default function GalleryPage() {
  const { user, profile } = useAuth()
  const { addToast } = useToast()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'avatar'>('all')

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Detail dialog state
  const [detailGen, setDetailGen] = useState<Generation | null>(null)
  const [lightboxGen, setLightboxGen] = useState<Generation | null>(null)

  // Post/Submit to Inspirations state
  const [inspirationGen, setInspirationGen] = useState<Generation | null>(null)
  const [inspirationTitle, setInspirationTitle] = useState('')
  const [inspirationCategory, setInspirationCategory] = useState<PromptCategory>('general')
  const [inspirationPrompt, setInspirationPrompt] = useState('')
  const [publishAs, setPublishAs] = useState<'curated' | 'community'>('curated')
  const [postingInspiration, setPostingInspiration] = useState(false)
  const [submitMode, setSubmitMode] = useState<'admin' | 'user'>('admin')
  const isAdmin = profile?.role === 'admin'

  const fetchGenerations = async () => {
    if (!user) return
    setLoading(true)
    try {
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('generations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (filter === 'image') {
        query = query.ilike('type', '%image%')
      } else if (filter === 'video') {
        query = query.ilike('type', '%video%')
      } else if (filter === 'avatar') {
        query = query.eq('type', 'ugc-avatar')
      }

      const { data, count, error } = await query
      if (error) throw error
      setGenerations((data || []) as Generation[])
      setTotal(count || 0)
    } catch (err) {
      console.error('Failed to fetch generations:', err)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchGenerations() }, [user, page, filter])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleDownload = (gen: Generation) => {
    if (!gen.output_url) return
    const ext = gen.type.includes('video') || gen.type === 'ugc-avatar' ? 'mp4' : 'png'
    downloadFile(gen.output_url, `tynkerlab-${gen.id}.${ext}`)
  }

  const handleDelete = async (gen: Generation) => {
    if (!user) return
    setDeletingId(gen.id)
    try {
      const res = await fetch(`/api/generations?id=${gen.id}&userId=${user.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        addToast(err.error || 'Failed to delete', 'error')
        return
      }
      addToast('Generation deleted')
      setConfirmDeleteId(null)
      await fetchGenerations()
    } catch {
      addToast('Failed to delete', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const openInspirationDialog = (gen: Generation, mode: 'admin' | 'user') => {
    setInspirationGen(gen)
    setInspirationTitle('')
    setInspirationCategory('general')
    setInspirationPrompt(gen.prompt || '')
    setPublishAs('curated')
    setSubmitMode(mode)
  }

  const handlePostInspiration = async () => {
    if (!inspirationGen || !inspirationTitle.trim()) return
    setPostingInspiration(true)
    try {
      if (submitMode === 'admin') {
        const promptText = inspirationPrompt.trim() || inspirationGen.prompt
        const modelType = inspirationGen.type.includes('video') || inspirationGen.type === 'ugc-avatar' ? 'video' : 'image'

        if (publishAs === 'community') {
          const res = await adminFetch('/api/admin/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: inspirationTitle.trim(),
              promptText,
              category: inspirationCategory,
              modelType,
              modelUsed: inspirationGen.model,
              previewImageUrl: inspirationGen.output_url,
              isPublished: true,
              submissionStatus: 'approved',
              submittedBy: user?.id,
              submitterName: profile?.full_name || 'Anonymous',
              createdBy: profile?.full_name || 'Anonymous',
            }),
          })
          if (!res.ok) throw new Error('Failed to post')
          addToast('Posted as Community inspiration!', 'success')
        } else {
          const res = await adminFetch('/api/admin/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: inspirationTitle.trim(),
              promptText,
              category: inspirationCategory,
              modelType,
              modelUsed: inspirationGen.model,
              previewImageUrl: inspirationGen.output_url,
              isPublished: true,
              createdBy: 'Tynkerlab.ai Team',
            }),
          })
          if (!res.ok) throw new Error('Failed to post')
          addToast('Posted as Curated inspiration!', 'success')
        }
      } else {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: inspirationTitle.trim(),
            promptText: inspirationGen.prompt,
            category: inspirationCategory,
            modelType: inspirationGen.type.includes('video') || inspirationGen.type === 'ugc-avatar' ? 'video' : 'image',
            modelUsed: inspirationGen.model,
            previewImageUrl: inspirationGen.output_url,
            userId: user?.id,
            userName: profile?.full_name || user?.user_metadata?.full_name || 'Anonymous',
          }),
        })
        if (!res.ok) throw new Error('Failed to submit')
        addToast('Submitted for review!', 'success')
      }
      setInspirationGen(null)
    } catch (err: any) {
      addToast(err.message || 'Failed', 'error')
    } finally {
      setPostingInspiration(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gallery</h1>
          <p className="text-sm text-gray-400 mt-1">{total} generation{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'image', 'video', 'avatar'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-primary-500/10 text-white border border-primary-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : generations.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No generations yet</h3>
          <p className="text-sm text-gray-600 mt-2">Start creating in the Studio</p>
          <Button variant="secondary" onClick={() => window.location.href = '/studio/text-to-image'} className="mt-4">
            Go to Studio
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generations.map((gen) => (
              <div key={gen.id} className="group relative rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden cursor-pointer" onClick={() => setLightboxGen(gen)}>
                {gen.type.includes('video') || gen.type === 'ugc-avatar' ? (
                  <video src={gen.output_url || ''} className="w-full aspect-square object-cover" muted loop playsInline autoPlay onMouseEnter={e => (e.target as HTMLVideoElement).play()} onMouseLeave={e => { if (window.innerWidth >= 768) (e.target as HTMLVideoElement).pause() }} />
                ) : (
                  <img src={gen.output_url || ''} alt={gen.prompt} className="w-full aspect-square object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs text-white line-clamp-2 mb-2">{gen.prompt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {gen.type.includes('video') || gen.type === 'ugc-avatar' ? (
                          <Video className="h-3 w-3 text-accent-400" />
                        ) : (
                          <ImageIcon className="h-3 w-3 text-primary-400" />
                        )}
                        <span className="text-[10px] text-gray-400">{formatDate(gen.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setDetailGen(gen) }} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="View details">
                          <Info className="h-3 w-3 text-white" />
                        </button>
                        {isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); openInspirationDialog(gen, 'admin') }} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Post to Inspirations">
                            <BookOpen className="h-3 w-3 text-primary-400" />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); openInspirationDialog(gen, 'user') }} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Submit to Inspirations">
                          <Send className="h-3 w-3 text-accent-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDownload(gen) }} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Download">
                          <Download className="h-3 w-3 text-white" />
                        </button>
                        {confirmDeleteId === gen.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(gen) }}
                              disabled={deletingId === gen.id}
                              className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                            >
                              {deletingId === gen.id ? '...' : 'Delete'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null) }}
                              className="px-1.5 py-0.5 text-[10px] text-gray-400 hover:text-white rounded transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(gen.id) }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant={gen.type === 'ugc-avatar' ? 'warning' : gen.type.includes('video') ? 'info' : 'default'} className="absolute top-2 right-2 text-[10px]">
                  {gen.type === 'ugc-avatar' ? 'Avatar' : gen.type.includes('video') ? 'Video' : 'Image'}
                </Badge>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-400">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightboxGen && lightboxGen.output_url && (() => {
        const currentIndex = generations.findIndex(g => g.id === lightboxGen.id)
        return (
          <Lightbox
            url={lightboxGen.output_url}
            type={lightboxGen.type.includes('video') || lightboxGen.type === 'ugc-avatar' ? 'video' : 'image'}
            alt={lightboxGen.prompt || ''}
            onClose={() => setLightboxGen(null)}
            onPrev={currentIndex > 0 ? () => setLightboxGen(generations[currentIndex - 1]) : undefined}
            onNext={currentIndex < generations.length - 1 ? () => setLightboxGen(generations[currentIndex + 1]) : undefined}
          />
        )
      })()}

      {/* Generation Detail Dialog */}
      {detailGen && (() => {
        const modelInfo = getModelById(detailGen.model)
        return (
          <Dialog open onClose={() => setDetailGen(null)} title="Generation Details" size="lg">
            <div className="space-y-4">
              {/* Preview */}
              <div className="rounded-lg overflow-hidden border border-nyx-border bg-black">
                {detailGen.type.includes('video') || detailGen.type === 'ugc-avatar' ? (
                  <video src={detailGen.output_url || ''} className="w-full max-h-[400px] object-contain" controls muted autoPlay loop playsInline />
                ) : (
                  <img src={detailGen.output_url || ''} alt={detailGen.prompt || ''} className="w-full max-h-[400px] object-contain" />
                )}
              </div>

              {/* Model info */}
              {modelInfo && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-nyx-surface border border-nyx-border">
                  <ModelCategoryIcon category={modelInfo.category} className="h-4 w-4" />
                  <span className="text-sm font-medium text-white">{modelInfo.displayName}</span>
                  <span className="text-xs text-gray-500">&middot;</span>
                  <span className="text-xs text-gray-400">{modelInfo.categoryLabel}</span>
                </div>
              )}

              {/* Prompt */}
              {detailGen.prompt && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Prompt</label>
                  <p className="text-sm text-gray-300 bg-nyx-bg border border-nyx-border rounded-lg p-3 whitespace-pre-wrap">{detailGen.prompt}</p>
                </div>
              )}

              {/* Metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Type</p>
                  <p className="text-sm text-white font-medium mt-0.5">{detailGen.type}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Credits</p>
                  <p className="text-sm text-white font-medium mt-0.5">{detailGen.credits_used}</p>
                </div>
                {detailGen.width && detailGen.height && (
                  <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Resolution</p>
                    <p className="text-sm text-white font-medium mt-0.5">{detailGen.width}&times;{detailGen.height}</p>
                  </div>
                )}
                {detailGen.aspect_ratio && (
                  <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Aspect Ratio</p>
                    <p className="text-sm text-white font-medium mt-0.5">{detailGen.aspect_ratio}</p>
                  </div>
                )}
                {detailGen.seed != null && (
                  <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Seed</p>
                    <p className="text-sm text-white font-medium mt-0.5">{detailGen.seed}</p>
                  </div>
                )}
                {detailGen.steps != null && (
                  <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Steps</p>
                    <p className="text-sm text-white font-medium mt-0.5">{detailGen.steps}</p>
                  </div>
                )}
                {detailGen.duration_seconds != null && (
                  <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Duration</p>
                    <p className="text-sm text-white font-medium mt-0.5">{detailGen.duration_seconds}s</p>
                  </div>
                )}
                <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Created</p>
                  <p className="text-sm text-white font-medium mt-0.5">{formatDate(detailGen.created_at)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setDetailGen(null)}>Close</Button>
                <Button variant="primary" onClick={() => handleDownload(detailGen)}>
                  <Download className="h-4 w-4 mr-1.5" /> Download
                </Button>
              </div>
            </div>
          </Dialog>
        )
      })()}

      {/* Post/Submit to Inspirations Dialog */}
      {inspirationGen && (() => {
        const modelInfo = getModelById(inspirationGen.model)
        return (
          <Dialog open onClose={() => setInspirationGen(null)} title={submitMode === 'admin' ? 'Post to Inspirations' : 'Submit to Inspirations'} size="md">
            <div className="space-y-4">
              {/* Preview */}
              <div className="rounded-lg overflow-hidden border border-nyx-border">
                {inspirationGen.type.includes('video') || inspirationGen.type === 'ugc-avatar' ? (
                  <video
                    src={inspirationGen.output_url || ''}
                    className="w-full aspect-video object-cover"
                    controls
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={inspirationGen.output_url || ''}
                    alt={inspirationGen.prompt}
                    className="w-full aspect-video object-cover"
                  />
                )}
              </div>

              {/* Model info */}
              {modelInfo && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-nyx-surface border border-nyx-border">
                  <ModelCategoryIcon category={modelInfo.category} className="h-4 w-4 text-primary-400" />
                  <span className="text-sm font-medium text-white">{modelInfo.displayName}</span>
                  <span className="text-xs text-gray-500">&middot;</span>
                  <span className="text-xs text-gray-400">{modelInfo.categoryLabel}</span>
                  {inspirationGen.width && inspirationGen.height && (
                    <>
                      <span className="text-xs text-gray-500">&middot;</span>
                      <span className="text-xs text-gray-400">{inspirationGen.width} &times; {inspirationGen.height}</span>
                    </>
                  )}
                </div>
              )}

              {/* Admin: Curated / Community toggle */}
              {submitMode === 'admin' && (
                <div className="flex rounded-lg border border-nyx-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPublishAs('curated')}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm font-medium transition-colors',
                      publishAs === 'curated'
                        ? 'bg-primary-500/20 text-primary-300 border-r border-primary-500/30'
                        : 'bg-nyx-surface text-gray-400 hover:text-white border-r border-nyx-border'
                    )}
                  >
                    Public (Curated)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPublishAs('community')}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm font-medium transition-colors',
                      publishAs === 'community'
                        ? 'bg-accent-500/20 text-accent-300'
                        : 'bg-nyx-surface text-gray-400 hover:text-white'
                    )}
                  >
                    Community
                  </button>
                </div>
              )}

              {submitMode === 'user' && (
                <p className="text-xs text-gray-400 bg-primary-500/5 border border-primary-500/20 rounded-lg p-3">
                  Submissions are reviewed before publishing. Your name will appear as the creator.
                </p>
              )}

              {/* Title */}
              <Input
                label="Title"
                value={inspirationTitle}
                onChange={(e) => setInspirationTitle(e.target.value)}
                placeholder="Give this creation a title..."
              />

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <select
                  value={inspirationCategory}
                  onChange={(e) => setInspirationCategory(e.target.value as PromptCategory)}
                  className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Prompt */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Prompt</label>
                {submitMode === 'admin' ? (
                  <textarea
                    value={inspirationPrompt}
                    onChange={(e) => setInspirationPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                    placeholder="Edit the prompt..."
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-sm text-gray-300 line-clamp-4">{inspirationGen.prompt}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setInspirationGen(null)}>Cancel</Button>
                <Button
                  variant="primary"
                  onClick={handlePostInspiration}
                  loading={postingInspiration}
                  disabled={!inspirationTitle.trim()}
                >
                  {submitMode === 'admin' ? 'Post' : 'Submit'}
                </Button>
              </div>
            </div>
          </Dialog>
        )
      })()}
    </div>
  )
}
