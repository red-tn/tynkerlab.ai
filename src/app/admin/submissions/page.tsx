'use client'

import { useState, useEffect } from 'react'
import type { Prompt } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Check, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

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
      const res = await fetch(`/api/admin/prompts?page=${page}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        // Filter to show pending submissions
        const pending = data.prompts.filter((p: Prompt) => p.submissionStatus === 'pending')
        setSubmissions(pending)
        setTotal(pending.length)
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

      const res = await fetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update')
      addToast(action === 'approve' ? 'Submission approved!' : 'Submission rejected', 'success')
      fetchSubmissions()
      if (preview?.$id === id) setPreview(null)
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
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-nyx-surface animate-pulse" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No pending submissions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => (
            <div key={sub.$id} className="bg-nyx-surface border border-nyx-border rounded-xl p-4 flex items-start gap-4">
              {sub.previewImageUrl && (
                <img src={sub.previewImageUrl} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{sub.title}</p>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{sub.promptText}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="text-[10px]">{sub.category}</Badge>
                  <span className="text-[10px] text-gray-500">by {sub.submitterName || 'Unknown'}</span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(sub.$createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreview(sub)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={actionLoading === sub.$id}
                  onClick={() => handleAction(sub.$id, 'approve')}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={actionLoading === sub.$id}
                  onClick={() => handleAction(sub.$id, 'reject')}
                >
                  <X className="h-4 w-4" />
                </Button>
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
            {preview.previewImageUrl && (
              <img src={preview.previewImageUrl} alt="" className="w-full max-h-64 object-contain rounded-lg" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">{preview.title}</h3>
              <p className="text-xs text-gray-500 mt-1">by {preview.submitterName || 'Unknown'}</p>
            </div>
            <div className="p-3 rounded-lg bg-nyx-bg">
              <p className="text-xs text-gray-500 mb-1">Prompt</p>
              <p className="text-sm text-gray-300">{preview.promptText}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">{preview.category}</Badge>
              <Badge variant="info">{preview.modelType}</Badge>
              {preview.modelUsed && <span className="text-xs text-gray-500">{preview.modelUsed}</span>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="danger" onClick={() => handleAction(preview.$id, 'reject')} loading={actionLoading === preview.$id}>
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button variant="primary" onClick={() => handleAction(preview.$id, 'approve')} loading={actionLoading === preview.$id}>
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
