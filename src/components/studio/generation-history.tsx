'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/lib/utils'
import { Clock, ImageIcon, Video } from 'lucide-react'

interface HistoryItem {
  id: string
  type: string
  prompt: string
  outputUrl: string | null
  status: string
  createdAt: string
}

interface GenerationHistoryProps {
  items: HistoryItem[]
  onSelect?: (item: HistoryItem) => void
  className?: string
}

export function GenerationHistory({ items, onSelect, className }: GenerationHistoryProps) {
  if (items.length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-medium text-gray-400">Recent</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect?.(item)}
            className="w-full flex items-center gap-3 p-2 rounded-lg bg-nyx-surface border border-nyx-border hover:border-nyx-borderBright transition-colors text-left"
          >
            <div className="h-12 w-12 rounded-lg bg-nyx-border shrink-0 overflow-hidden flex items-center justify-center">
              {item.outputUrl ? (
                item.type.includes('video') ? (
                  <video src={item.outputUrl} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={item.outputUrl} alt="" className="w-full h-full object-cover" />
                )
              ) : item.type.includes('video') ? (
                <Video className="h-5 w-5 text-gray-600" />
              ) : (
                <ImageIcon className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-300 truncate">{item.prompt || 'No prompt'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={item.status === 'completed' ? 'success' : item.status === 'failed' ? 'error' : 'outline'} className="text-[10px]">{item.status}</Badge>
                <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />{formatRelativeDate(item.createdAt)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
