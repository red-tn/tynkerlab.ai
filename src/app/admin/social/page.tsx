'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download, ImageIcon, Video, ChevronLeft, ChevronRight,
  Share2, Loader2, Check, Copy, X, Grid3X3, Smartphone, Monitor
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface MediaItem {
  $id: string
  $createdAt: string
  outputUrl?: string
  previewImageUrl?: string
  prompt?: string
  promptText?: string
  type?: string
  modelType?: string
  model?: string
  modelUsed?: string
}

const PLATFORMS = [
  { id: 'instagram-post', label: 'Instagram Post', w: 1080, h: 1080, group: 'Instagram', ratio: '1:1' },
  { id: 'instagram-story', label: 'Story / Reels', w: 1080, h: 1920, group: 'Instagram', ratio: '9:16' },
  { id: 'instagram-landscape', label: 'Landscape', w: 1080, h: 566, group: 'Instagram', ratio: '1.91:1' },
  { id: 'twitter-post', label: 'X Post', w: 1200, h: 675, group: 'X / Twitter', ratio: '16:9' },
  { id: 'twitter-header', label: 'Header', w: 1500, h: 500, group: 'X / Twitter', ratio: '3:1' },
  { id: 'facebook-post', label: 'Post', w: 1200, h: 630, group: 'Facebook', ratio: '1.91:1' },
  { id: 'facebook-cover', label: 'Cover Photo', w: 820, h: 312, group: 'Facebook', ratio: '2.63:1' },
  { id: 'tiktok', label: 'TikTok / Reels', w: 1080, h: 1920, group: 'Video', ratio: '9:16' },
  { id: 'youtube-thumb', label: 'YouTube Thumb', w: 1280, h: 720, group: 'YouTube', ratio: '16:9' },
  { id: 'linkedin', label: 'LinkedIn Post', w: 1200, h: 627, group: 'LinkedIn', ratio: '1.91:1' },
  { id: 'pinterest', label: 'Pinterest Pin', w: 1000, h: 1500, group: 'Pinterest', ratio: '2:3' },
  { id: 'original', label: 'Original', w: 0, h: 0, group: 'Other', ratio: 'original' },
]

const PAGE_SIZE = 20

export default function AdminSocialPage() {
  const [tab, setTab] = useState<'generations' | 'prompts'>('generations')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')

  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0])
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'generations') {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: PAGE_SIZE.toString(),
          ...(filter !== 'all' ? { type: filter } : {}),
        })
        const res = await fetch(`/api/admin/social/generations?${params}`)
        if (res.ok) {
          const data = await res.json()
          setItems(data.generations)
          setTotal(data.total)
        }
      } else {
        const res = await fetch(`/api/admin/prompts?limit=100`)
        if (res.ok) {
          const data = await res.json()
          let prompts = data.prompts.filter((p: any) => p.previewImageUrl)
          if (filter === 'image') prompts = prompts.filter((p: any) => p.modelType === 'image')
          if (filter === 'video') prompts = prompts.filter((p: any) => p.modelType === 'video')
          setItems(prompts)
          setTotal(prompts.length)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [tab, page, filter])

  useEffect(() => { fetchItems() }, [fetchItems])

  const getImageUrl = (item: MediaItem): string | null => {
    return item.outputUrl || item.previewImageUrl || null
  }

  const getPromptText = (item: MediaItem): string => {
    return item.prompt || item.promptText || ''
  }

  const getItemType = (item: MediaItem): string => {
    return item.type || item.modelType || 'image'
  }

  const itemIsVideo = (item: MediaItem) => getItemType(item).includes('video')

  const handleDownload = async (platform: typeof PLATFORMS[number]) => {
    if (!selected) return
    const imageUrl = getImageUrl(selected)
    if (!imageUrl) return

    if (itemIsVideo(selected) || platform.id === 'original') {
      setDownloading(true)
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tynkerlab-${platform.id}-${Date.now()}.${itemIsVideo(selected) ? 'mp4' : 'png'}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch {
        window.open(imageUrl, '_blank')
      } finally {
        setDownloading(false)
      }
      return
    }

    setDownloading(true)
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = imageUrl

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
      })

      const canvas = canvasRef.current!
      canvas.width = platform.w
      canvas.height = platform.h
      const ctx = canvas.getContext('2d')!
      const scale = Math.max(platform.w / img.width, platform.h / img.height)
      const sw = platform.w / scale
      const sh = platform.h / scale
      const sx = (img.width - sw) / 2
      const sy = (img.height - sh) / 2
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, platform.w, platform.h)

      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tynkerlab-${platform.id}-${platform.w}x${platform.h}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setDownloading(false)
      }, 'image/png')
    } catch {
      setDownloading(false)
      window.open(imageUrl, '_blank')
    }
  }

  const handleCopyPrompt = () => {
    if (!selected) return
    navigator.clipboard.writeText(getPromptText(selected))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <canvas ref={canvasRef} className="hidden" />

      <div>
        <h1 className="text-2xl font-bold text-white">Social Media</h1>
        <p className="text-sm text-gray-400 mt-1">Download generations sized for any platform</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Source tabs */}
        <div className="flex items-center gap-1 bg-nyx-bg rounded-lg p-1 w-full sm:w-auto">
          <button
            onClick={() => { setTab('generations'); setPage(0) }}
            className={cn(
              'flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              tab === 'generations' ? 'bg-nyx-surface text-white shadow-sm' : 'text-gray-400 hover:text-white'
            )}
          >
            <Grid3X3 className="h-3.5 w-3.5 inline mr-1" />
            Generations
          </button>
          <button
            onClick={() => { setTab('prompts'); setPage(0) }}
            className={cn(
              'flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              tab === 'prompts' ? 'bg-nyx-surface text-white shadow-sm' : 'text-gray-400 hover:text-white'
            )}
          >
            <Share2 className="h-3.5 w-3.5 inline mr-1" />
            Inspirations
          </button>
        </div>

        {/* Type filter */}
        <div className="flex gap-1">
          {(['all', 'image', 'video'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0) }}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                filter === f
                  ? 'bg-primary-500/10 text-primary-400 ring-1 ring-primary-500/20'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              )}
            >
              {f === 'all' ? 'All' : f === 'image' ? 'Images' : 'Videos'}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-500 sm:ml-auto">{total} items</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-nyx-surface animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="h-10 w-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No content found</p>
          <p className="text-xs text-gray-600 mt-1">Generate some images first</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => {
            const url = getImageUrl(item)
            const isVid = itemIsVideo(item)
            return (
              <button
                key={item.$id}
                type="button"
                onClick={() => setSelected(item)}
                className={cn(
                  'group relative rounded-lg border bg-nyx-surface overflow-hidden text-left transition-all',
                  selected?.$id === item.$id
                    ? 'border-primary-500/50 ring-1 ring-primary-500/20'
                    : 'border-nyx-border hover:border-nyx-border-bright'
                )}
              >
                <div className="aspect-square bg-nyx-bg relative overflow-hidden">
                  {url ? (
                    isVid ? (
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                        onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0 }}
                      />
                    ) : (
                      <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-6 w-6 text-gray-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-1.5 left-1.5 right-1.5">
                      <p className="text-[9px] text-gray-300 line-clamp-2">{getPromptText(item)}</p>
                    </div>
                  </div>
                  <Badge
                    variant={isVid ? 'info' : 'default'}
                    className="absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5"
                  >
                    {isVid ? 'Video' : 'Image'}
                  </Badge>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {tab === 'generations' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-gray-400">{page + 1} / {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Download Modal — Custom fullscreen-on-mobile overlay */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelected(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full sm:max-w-2xl lg:max-w-3xl max-h-[90vh] bg-nyx-bg border border-nyx-border rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-nyx-border shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-white">Download for Social Media</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Select a platform size, then download</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Preview */}
                <div className="sm:w-48 md:w-56 shrink-0">
                  <div className="rounded-lg overflow-hidden border border-nyx-border bg-nyx-surface">
                    {itemIsVideo(selected) ? (
                      <video
                        src={getImageUrl(selected) || ''}
                        className="w-full aspect-square object-cover"
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={getImageUrl(selected) || ''}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                    )}
                  </div>
                  {/* Prompt */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-500 font-medium uppercase">Prompt</span>
                      <button
                        onClick={handleCopyPrompt}
                        className="text-[10px] text-primary-400 hover:text-primary-300 flex items-center gap-0.5 transition-colors"
                      >
                        {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-3 bg-nyx-surface rounded-md p-2 border border-nyx-border leading-relaxed">
                      {getPromptText(selected) || 'No prompt'}
                    </p>
                  </div>
                </div>

                {/* Platform Grid */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => setSelectedPlatform(platform)}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg border text-left transition-all',
                          selectedPlatform.id === platform.id
                            ? 'border-primary-500/50 bg-primary-500/10'
                            : 'border-nyx-border hover:border-nyx-border-bright hover:bg-white/[.02]'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-white font-medium truncate">{platform.label}</p>
                          <p className="text-[9px] text-gray-500">
                            {platform.id === 'original' ? 'No resize' : `${platform.w}x${platform.h}`}
                          </p>
                        </div>
                        {selectedPlatform.id === platform.id && (
                          <Check className="h-3 w-3 text-primary-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-nyx-border shrink-0 space-y-3">
              <Button
                variant="primary"
                className="w-full"
                loading={downloading}
                onClick={() => handleDownload(selectedPlatform)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download {selectedPlatform.label}
                {selectedPlatform.id !== 'original' && (
                  <span className="ml-1 text-xs opacity-60">({selectedPlatform.w}x{selectedPlatform.h})</span>
                )}
              </Button>

              {/* Quick download row */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[10px] text-gray-600 shrink-0">Quick:</span>
                {PLATFORMS.filter(p => ['instagram-post', 'instagram-story', 'twitter-post', 'youtube-thumb', 'original'].includes(p.id)).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleDownload(p)}
                    disabled={downloading}
                    className="shrink-0 px-2 py-1 rounded-md text-[10px] font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-nyx-border transition-colors disabled:opacity-50"
                  >
                    {p.label.replace(' Post', '').replace(' Thumb', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
