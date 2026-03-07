'use client'

import { cn } from '@/lib/utils'
import { SeedInput } from '@/components/studio/seed-input'
import { Music, Sparkles } from 'lucide-react'

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
  audioDuration?: number
}

const DURATION_OPTIONS = [
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
]

const EXPRESSION_PRESETS = [
  { label: 'Friendly smile', prompt: 'smiling warmly, looking at camera, relaxed expression, gentle head nod' },
  { label: 'Professional', prompt: 'professional expression, confident, looking directly at camera, minimal head movement' },
  { label: 'Energetic', prompt: 'enthusiastic expression, wide eyes, animated gestures, nodding, expressive' },
  { label: 'Thoughtful', prompt: 'thoughtful expression, slight head tilt, contemplative, occasional nod' },
  { label: 'Excited', prompt: 'excited and happy, big smile, eyes bright, animated head movement' },
  { label: 'Calm narrator', prompt: 'calm and composed, gentle smile, steady gaze, minimal movement, narrator style' },
]

export function UGCSettings({
  resolution, onResolutionChange,
  duration, onDurationChange,
  textPrompt, onTextPromptChange,
  seed, onSeedChange,
  disabled,
  audioDuration,
}: UGCSettingsProps) {
  const isMatchAudio = duration === -1
  const hasAudio = (audioDuration ?? 0) > 0

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
          {/* Match Audio option */}
          <button
            onClick={() => onDurationChange(-1)}
            disabled={disabled || !hasAudio}
            className={cn(
              'col-span-3 px-3 py-2 rounded-lg text-sm font-medium transition-all border flex items-center justify-center gap-2',
              isMatchAudio
                ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                : 'bg-nyx-surface border-nyx-border text-gray-400 hover:border-nyx-borderBright',
              (disabled || !hasAudio) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Music className="h-3.5 w-3.5" />
            Match Audio Length
            {hasAudio && (
              <span className="text-[10px] text-gray-500">({Math.ceil(audioDuration!)}s)</span>
            )}
          </button>
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDurationChange(opt.value)}
              disabled={disabled}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                !isMatchAudio && duration === opt.value
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

      {/* Text Prompt with Presets */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Expression / Pose Guidance <span className="text-gray-600">(optional)</span></label>
        {/* Quick presets */}
        <div className="flex gap-1.5 flex-wrap">
          {EXPRESSION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onTextPromptChange(preset.prompt)}
              disabled={disabled}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all border',
                textPrompt === preset.prompt
                  ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                  : 'bg-white/5 border-nyx-border text-gray-400 hover:text-white hover:border-nyx-borderBright',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Sparkles className="h-2.5 w-2.5" />
              {preset.label}
            </button>
          ))}
        </div>
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
