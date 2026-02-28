'use client'

import { Button } from '@/components/ui/button'
import { Download, RefreshCw, Sparkles, AlertCircle, Film } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GenerationResultProps {
  state: 'idle' | 'generating' | 'polling' | 'completed' | 'failed'
  result: { url: string; type: 'image' | 'video' } | null
  error: string | null
  progress: string
  progressPercent?: number
  progressNote?: string
  onRetry?: () => void
  onCancel?: () => void
}

export function GenerationResult({ state, result, error, progress, progressPercent = 0, progressNote, onRetry, onCancel }: GenerationResultProps) {
  const handleDownload = async () => {
    if (!result?.url) return
    try {
      const response = await fetch(result.url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tynkerlab-${Date.now()}.${result.type === 'video' ? 'mp4' : 'png'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(result.url, '_blank')
    }
  }

  if (state === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-xl border-2 border-dashed border-nyx-border text-center p-8">
        <Sparkles className="h-12 w-12 text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-400">Ready to Create</h3>
        <p className="text-sm text-gray-600 mt-2 max-w-sm">Select a model, enter your prompt, and click Generate to create your masterpiece</p>
      </div>
    )
  }

  if (state === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-xl border border-nyx-border bg-nyx-surface p-8">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-nyx-border border-t-primary-500 animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary-400 animate-pulse" />
        </div>
        <p className="text-sm text-gray-300 mt-6">{progress || 'Generating...'}</p>
        {onCancel && (
          <button onClick={onCancel} className="mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2">
            Cancel generation
          </button>
        )}
      </div>
    )
  }

  if (state === 'polling') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-xl border border-primary-500/20 bg-gradient-to-b from-primary-500/5 to-nyx-surface p-8">
        {/* Animated icon */}
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-full bg-primary-500/10 flex items-center justify-center">
            <Film className="h-8 w-8 text-primary-400 animate-pulse" />
          </div>
          {/* Orbiting dot */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2.5 h-2.5 rounded-full bg-primary-400 shadow-lg shadow-primary-500/50" />
          </div>
        </div>

        {/* Status text */}
        <p className="text-base font-semibold text-white mb-1">{progress || 'Processing...'}</p>

        {/* Progress bar */}
        <div className="w-full max-w-xs mt-4 mb-2">
          <div className="h-2 rounded-full bg-nyx-border/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-1000 ease-out"
              style={{ width: `${Math.max(progressPercent, 5)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-gray-500">Progress</span>
            <span className="text-[10px] font-mono text-primary-400">{progressPercent}%</span>
          </div>
        </div>

        {/* Friendly note */}
        {progressNote && (
          <p className={cn(
            'text-xs text-gray-400 mt-3 text-center max-w-[280px] transition-opacity duration-500',
            'animate-fade-in'
          )}>
            {progressNote}
          </p>
        )}

        {/* Fun animated dots */}
        <div className="flex gap-1.5 mt-5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary-400/50 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
            />
          ))}
        </div>
        {onCancel && (
          <button onClick={onCancel} className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2">
            Cancel & refund credits
          </button>
        )}
      </div>
    )
  }

  if (state === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-xl border border-error/20 bg-error/5 p-8">
        <AlertCircle className="h-12 w-12 text-error mb-4" />
        <h3 className="text-lg font-medium text-white">Generation Failed</h3>
        <p className="text-sm text-gray-400 mt-2 text-center max-w-sm">{error || 'An unexpected error occurred'}</p>
        {onRetry && <Button variant="secondary" onClick={onRetry} className="mt-4"><RefreshCw className="h-4 w-4 mr-2" /> Try Again</Button>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-nyx-border overflow-hidden bg-nyx-surface">
        {result?.type === 'video' ? (
          <video src={result.url} controls autoPlay loop className="w-full max-h-[500px] object-contain bg-black" />
        ) : result?.url ? (
          <img src={result.url} alt="Generated image" className="w-full max-h-[500px] object-contain" />
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={handleDownload} className="flex-1"><Download className="h-4 w-4 mr-2" /> Download</Button>
        {onRetry && <Button variant="secondary" onClick={onRetry}><RefreshCw className="h-4 w-4" /></Button>}
      </div>
    </div>
  )
}
