'use client'

import { cn } from '@/lib/utils'
import { SeedInput } from '@/components/studio/seed-input'

interface UGCSettingsProps {
  resolution: '480p' | '720p'
  onResolutionChange: (res: '480p' | '720p') => void
  duration: number
  onDurationChange: (dur: number) => void
  textPrompt: string
  onTextPromptChange: (prompt: string) => void
  seed: string
  onSeedChange: (seed: string) => void
  disabled?: boolean
}

const DURATION_OPTIONS = [
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
]

export function UGCSettings({
  resolution, onResolutionChange,
  duration, onDurationChange,
  textPrompt, onTextPromptChange,
  seed, onSeedChange,
  disabled,
}: UGCSettingsProps) {
  return (
    <div className="space-y-4">
      {/* Resolution Picker */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Resolution</label>
        <div className="flex gap-2">
          {(['480p', '720p'] as const).map((res) => (
            <button
              key={res}
              onClick={() => onResolutionChange(res)}
              disabled={disabled}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                resolution === res
                  ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                  : 'bg-nyx-surface border-nyx-border text-gray-400 hover:border-nyx-borderBright',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {res}
              <span className="block text-[10px] text-gray-500 mt-0.5">
                {res === '480p' ? '2 cr/s' : '4 cr/s'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selector */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Duration</label>
        <div className="grid grid-cols-3 gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDurationChange(opt.value)}
              disabled={disabled}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                duration === opt.value
                  ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                  : 'bg-nyx-surface border-nyx-border text-gray-400 hover:border-nyx-borderBright',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Prompt */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Expression / Pose Guidance <span className="text-gray-600">(optional)</span></label>
        <textarea
          value={textPrompt}
          onChange={(e) => onTextPromptChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g. smiling, looking at camera, slight head nod..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none disabled:opacity-50"
        />
      </div>

      {/* Seed */}
      <SeedInput value={seed} onChange={onSeedChange} disabled={disabled} />
    </div>
  )
}
