'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Sparkles, Check, X, Loader2, Coins } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'

interface PromptInputProps {
  prompt: string
  onPromptChange: (value: string) => void
  negativePrompt: string
  onNegativePromptChange: (value: string) => void
  maxLength?: number
  disabled?: boolean
  generationType?: 'image' | 'video' | 'tts'
  userId?: string
}

export function PromptInput({
  prompt, onPromptChange, negativePrompt, onNegativePromptChange,
  maxLength = 5000, disabled, generationType = 'image', userId,
}: PromptInputProps) {
  const [showNegative, setShowNegative] = useState(false)
  const [enhanceMode, setEnhanceMode] = useState<'conservative' | 'aggressive'>('conservative')
  const [enhancing, setEnhancing] = useState(false)
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null)
  const [enhanceError, setEnhanceError] = useState<string | null>(null)

  const canEnhance = prompt.trim().length > 0 && !disabled && !enhancing

  const handleEnhance = async () => {
    if (!canEnhance) return
    setEnhancing(true)
    setEnhanceError(null)
    setEnhancedPrompt(null)

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode: enhanceMode,
          generationType,
          userId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Enhancement failed')
      setEnhancedPrompt(data.enhanced)
    } catch (err: any) {
      setEnhanceError(err.message || 'Failed to enhance prompt')
    } finally {
      setEnhancing(false)
    }
  }

  const acceptEnhancement = () => {
    if (enhancedPrompt) {
      onPromptChange(enhancedPrompt)
      setEnhancedPrompt(null)
    }
  }

  const rejectEnhancement = () => {
    setEnhancedPrompt(null)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">Prompt</label>

          {/* AI Enhance controls */}
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex items-center rounded-md bg-nyx-surface border border-nyx-border overflow-hidden text-[10px]">
              <button
                type="button"
                onClick={() => setEnhanceMode('conservative')}
                className={cn(
                  'px-2 py-1 transition-colors',
                  enhanceMode === 'conservative'
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                Subtle
              </button>
              <button
                type="button"
                onClick={() => setEnhanceMode('aggressive')}
                className={cn(
                  'px-2 py-1 transition-colors',
                  enhanceMode === 'aggressive'
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                Creative
              </button>
            </div>

            {/* Enhance button */}
            <button
              type="button"
              onClick={handleEnhance}
              disabled={!canEnhance}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                canEnhance
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30 hover:bg-primary-500/20 hover:shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                  : 'bg-nyx-surface text-gray-600 border border-nyx-border cursor-not-allowed'
              )}
            >
              {enhancing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              AI Enhance
              <span className="flex items-center gap-0.5 text-amber-400">
                <Coins className="h-3 w-3" />
                <span className="text-[10px] font-bold">2</span>
              </span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe what you want to create..."
            maxLength={maxLength}
            disabled={disabled}
            rows={4}
            className={cn(
              'w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white',
              'placeholder:text-gray-500 resize-none',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
              'transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          <span className="absolute bottom-2 right-3 text-xs text-gray-600">
            {prompt.length}/{maxLength}
          </span>
        </div>

        {/* Enhancement error */}
        {enhanceError && (
          <p className="text-xs text-error">{enhanceError}</p>
        )}

        {/* Enhancement diff view */}
        {enhancedPrompt && (
          <div className="rounded-lg border border-primary-500/30 bg-primary-500/5 p-3 space-y-3 animate-slide-down">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Enhanced Prompt
              </span>
              <span className="text-[10px] text-gray-500 capitalize">{enhanceMode} mode</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{enhancedPrompt}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={acceptEnhancement}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors"
              >
                <Check className="h-3 w-3" /> Accept
              </button>
              <button
                type="button"
                onClick={rejectEnhancement}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 transition-colors"
              >
                <X className="h-3 w-3" /> Reject
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowNegative(!showNegative)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        {showNegative ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Negative Prompt
        <InfoTooltip text="Describe what you DON'T want. E.g., 'blurry, low quality, watermark, text'." />
      </button>
      {showNegative && (
        <textarea
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          placeholder="What to exclude from the generation..."
          disabled={disabled}
          rows={2}
          className={cn(
            'w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white',
            'placeholder:text-gray-500 resize-none animate-slide-down',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
            'disabled:opacity-50'
          )}
        />
      )}
    </div>
  )
}
