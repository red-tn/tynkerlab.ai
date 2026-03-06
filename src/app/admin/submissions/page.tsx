'use client'

import { useState, useEffect } from 'react'
import type { Prompt } from '@/types/database'
import { adminFetch } from '@/lib/admin-fetch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Check, X, Eye, ChevronLeft, ChevronRight, ImageIcon, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminSubmissionsPage() {
  const { addToast } = useToast()
  const [submissions, setSubmissions] = useState<Prompt[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<Prompt | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const res = await adminFetch(`/api/admin/prompts?page=${page}&limit=20&submission_status=pending`)
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.prompts || [])
        setTotal(data.total ?? 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubmissions() }, [page])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      const updates: Record<string, any> = {
        id,
        submissionStatus: action === 'approve' ? 'approved' : 'rejected',
      }
      if (action === 'approve') {
        updates.isPublished = true
      }

      const res = await adminFetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update')
      addToast(action === 'approve' ? 'Submission approved!' : 'Submission rejected', 'success')
      fetchSubmissions()
      if (preview?.id === id) setPreview(null)
    } catch (err: any) {
      addToast(err.message || 'Failed', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Submissions</h1>
        <p className="text-sm text-gray-400">{total} pending submission{total !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={cn('break-inside-avoid mb-4 rounded-xl bg-nyx-surface animate-pulse', i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]')} />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No pending submissions</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
          {submissions.map(sub => (
            <div key={sub.id} className="break-inside-avoid mb-4 group relative rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden">
              {/* Image/video area */}
              <div className="bg-nyx-bg relative overflow-hidden">
                {sub.preview_image_url ? (
                  sub.model_type === 'video' ? (
                    <video src={sub.preview_image_url} className="w-full h-auto block" muted loop playsInline autoPlay />
                  ) : (
                    <img src={sub.preview_image_url} alt={sub.title} className="w-full h-auto block" />
                  )
                ) : (
                  <div className="aspect-square flex items-center justify-center">
                    {sub.model_type === 'video'
                      ? <Video className="h-10 w-10 text-gray-700" />
                      : <ImageIcon className="h-10 w-10 text-gray-700" />
                    }
                  </div>
                )}

                {/* Type badge */}
                <Badge variant={sub.model_type === 'video' ? 'info' : 'default'} className="absolute top-2 right-2 text-[9px] backdrop-blur-sm">
                  {sub.model_type}
                </Badge>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <p className="text-xs text-gray-200 line-clamp-4 mb-3 leading-relaxed">{sub.prompt_text}</p>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => setPreview(sub)} className="!p-1.5 !bg-white/10 hover:!bg-white/20">
                      <Eye className="h-3.5 w-3.5 text-white" />
                    </Button>
                    <Button variant="primary" size="sm" loading={actionLoading === sub.id} onClick={() => handleAction(sub.id, 'approve')} className="!p-1.5">
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="danger" size="sm" loading={actionLoading === sub.id} onClick={() => handleAction(sub.id, 'reject')} className="!p-1.5">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Card info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-white truncate">{sub.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="default" className="text-[9px]">{sub.category}</Badge>
                  <span className="text-[10px] text-gray-500">by {sub.submitter_name || 'Unknown'}</span>
                </div>
                <span className="text-[10px] text-gray-600 mt-1 block">
                  {new Date(sub.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-400">Page {page + 1} of {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Preview Dialog */}
      {preview && (
        <Dialog open onClose={() => setPreview(null)} title="Submission Preview" size="lg">
          <div className="space-y-4">
            {preview.preview_image_url && (
              preview.model_type === 'video' ? (
                <video src={preview.preview_image_url} className="w-full max-h-64 object-contain rounded-lg" controls muted />
              ) : (
                <img src={preview.preview_image_url} alt="" className="w-full max-h-64 object-contain rounded-lg" />
              )
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">{preview.title}</h3>
              <p className="text-xs text-gray-500 mt-1">by {preview.submitter_name || 'Unknown'}</p>
            </div>
            <div className="p-3 rounded-lg bg-nyx-bg">
              <p className="text-xs text-gray-500 mb-1">Prompt</p>
              <p className="text-sm text-gray-300">{preview.prompt_text}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">{preview.category}</Badge>
              <Badge variant="info">{preview.model_type}</Badge>
              {preview.model_used && <span className="text-xs text-gray-500">{preview.model_used}</span>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="danger" onClick={() => handleAction(preview.id, 'reject')} loading={actionLoading === preview.id}>
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button variant="primary" onClick={() => handleAction(preview.id, 'approve')} loading={actionLoading === preview.id}>
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
