'use client'

import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import type { VideoQuality } from '@/lib/together/models'
import { getVideoCreditsForQuality } from '@/lib/together/models'

const QUALITY_META: Record<VideoQuality, { label: string; desc: string }> = {
  '480p': { label: '480p', desc: 'SD' },
  '720p': { label: '720p', desc: 'HD' },
  '1080p': { label: '1080p', desc: 'Full HD' },
  '1440p': { label: '1440p', desc: 'QHD' },
  '4k': { label: '4K', desc: 'Ultra HD' },
}

interface VideoQualityPickerProps {
  value: VideoQuality
  onChange: (value: VideoQuality) => void
  options: VideoQuality[]
  modelId: string | null
  disabled?: boolean
  duration?: number
}

export function VideoQualityPicker({ value, onChange, options, modelId, disabled, duration }: VideoQualityPickerProps) {
  if (options.length <= 1) return null

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
        Quality
        <InfoTooltip text="Higher resolution costs more credits but produces sharper video." />
      </label>
      <div className="flex gap-2">
        {options.map((q) => {
          const meta = QUALITY_META[q]
          const credits = modelId ? getVideoCreditsForQuality(modelId, q, duration) : 0
          return (
            <button
              key={q}
              type="button"
              onClick={() => !disabled && onChange(q)}
              disabled={disabled}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-lg text-sm font-medium border transition-all',
                value === q
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-borderBright',
                'disabled:opacity-50'
              )}
            >
              <span>{meta.label}</span>
              <span className="text-[10px] text-gray-500">{meta.desc}</span>
              {modelId && options.length > 1 && (
                <span className={cn(
                  'text-[10px] font-mono mt-0.5',
                  value === q ? 'text-primary-400' : 'text-gray-600'
                )}>
                  {credits} cr
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
