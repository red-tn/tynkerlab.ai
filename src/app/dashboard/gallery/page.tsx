'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/client'
import { Query } from 'appwrite'
import type { Generation, PromptCategory } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Image as ImageIcon, Video, Download, ChevronLeft, ChevronRight, BookOpen, Send, Trash2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

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
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Post/Submit to Inspirations state
  const [inspirationGen, setInspirationGen] = useState<Generation | null>(null)
  const [inspirationTitle, setInspirationTitle] = useState('')
  const [inspirationCategory, setInspirationCategory] = useState<PromptCategory>('general')
  const [postingInspiration, setPostingInspiration] = useState(false)
  const [submitMode, setSubmitMode] = useState<'admin' | 'user'>('admin')
  const isAdmin = profile?.role === 'admin'

  const fetchGenerations = async () => {
    if (!user) return
    setLoading(true)
    try {
      const queries = [
        Query.equal('userId', user.$id),
        Query.equal('status', 'completed'),
        Query.orderDesc('$createdAt'),
        Query.limit(PAGE_SIZE),
        Query.offset(page * PAGE_SIZE),
      ]

      if (filter === 'image') {
        queries.push(Query.contains('type', 'image'))
      } else if (filter === 'video') {
        queries.push(Query.contains('type', 'video'))
      }

      const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, queries)
      setGenerations(result.documents as unknown as Generation[])
      setTotal(result.total)
    } catch (err) {
      console.error('Failed to fetch generations:', err)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchGenerations() }, [user, page, filter])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleDownload = async (gen: Generation) => {
    if (!gen.outputUrl) return
    try {
      const response = await fetch(gen.outputUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tynkerlab-${gen.$id}.${gen.type.includes('video') ? 'mp4' : 'png'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(gen.outputUrl, '_blank')
    }
  }

  const handleDelete = async (gen: Generation) => {
    if (!user) return
    setDeletingId(gen.$id)
    try {
      const res = await fetch(`/api/generations?id=${gen.$id}&userId=${user.$id}`, { method: 'DELETE' })
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
    setSubmitMode(mode)
  }

  const handlePostInspiration = async () => {
    if (!inspirationGen || !inspirationTitle.trim()) return
    setPostingInspiration(true)
    try {
      if (submitMode === 'admin') {
        const res = await fetch('/api/admin/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: inspirationTitle.trim(),
            promptText: inspirationGen.prompt,
            category: inspirationCategory,
            modelType: inspirationGen.type.includes('video') ? 'video' : 'image',
            modelUsed: inspirationGen.model,
            previewImageUrl: inspirationGen.outputUrl,
            isPublished: true,
            createdBy: 'Tynkerlab.ai Team',
          }),
        })
        if (!res.ok) throw new Error('Failed to post')
        addToast('Posted to Inspirations!', 'success')
      } else {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: inspirationTitle.trim(),
            promptText: inspirationGen.prompt,
            category: inspirationCategory,
            modelType: inspirationGen.type.includes('video') ? 'video' : 'image',
            modelUsed: inspirationGen.model,
            previewImageUrl: inspirationGen.outputUrl,
            userId: user?.$id,
            userName: profile?.fullName || user?.name || 'Anonymous',
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
          {(['all', 'image', 'video'] as const).map((f) => (
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
              <div key={gen.$id} className="group relative rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden">
                {gen.type.includes('video') ? (
                  <video src={gen.outputUrl || ''} className="w-full aspect-square object-cover" muted loop onMouseEnter={e => (e.target as HTMLVideoElement).play()} onMouseLeave={e => (e.target as HTMLVideoElement).pause()} />
                ) : (
                  <img src={gen.outputUrl || ''} alt={gen.prompt} className="w-full aspect-square object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs text-white line-clamp-2 mb-2">{gen.prompt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {gen.type.includes('video') ? (
                          <Video className="h-3 w-3 text-accent-400" />
                        ) : (
                          <ImageIcon className="h-3 w-3 text-primary-400" />
                        )}
                        <span className="text-[10px] text-gray-400">{formatDate(gen.$createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isAdmin && (
                          <button onClick={() => openInspirationDialog(gen, 'admin')} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Post to Inspirations">
                            <BookOpen className="h-3 w-3 text-primary-400" />
                          </button>
                        )}
                        <button onClick={() => openInspirationDialog(gen, 'user')} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Submit to Inspirations">
                          <Send className="h-3 w-3 text-accent-400" />
                        </button>
                        <button onClick={() => handleDownload(gen)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Download">
                          <Download className="h-3 w-3 text-white" />
                        </button>
                        {confirmDeleteId === gen.$id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(gen)}
                              disabled={deletingId === gen.$id}
                              className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                            >
                              {deletingId === gen.$id ? '...' : 'Delete'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 text-[10px] text-gray-400 hover:text-white rounded transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(gen.$id)}
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
                <Badge variant={gen.type.includes('video') ? 'info' : 'default'} className="absolute top-2 right-2 text-[10px]">
                  {gen.type.includes('video') ? 'Video' : 'Image'}
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

      {/* Post/Submit to Inspirations Dialog */}
      {inspirationGen && (
        <Dialog open onClose={() => setInspirationGen(null)} title={submitMode === 'admin' ? 'Post to Inspirations' : 'Submit to Inspirations'} size="md">
          <div className="space-y-4">
            {submitMode === 'user' && (
              <p className="text-xs text-gray-400 bg-primary-500/5 border border-primary-500/20 rounded-lg p-3">
                Submissions are reviewed before publishing. Your name will appear as the creator.
              </p>
            )}
            <Input
              label="Title"
              value={inspirationTitle}
              onChange={(e) => setInspirationTitle(e.target.value)}
              placeholder="Give this creation a title..."
            />
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
            <div className="p-3 rounded-lg bg-nyx-bg">
              <p className="text-xs text-gray-500 mb-1">Prompt</p>
              <p className="text-sm text-gray-300 line-clamp-3">{inspirationGen.prompt}</p>
            </div>
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
      )}
    </div>
  )
}
