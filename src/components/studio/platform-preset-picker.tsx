'use client'

import { cn } from '@/lib/utils'
import type { TemplatePlatformPreset } from '@/types/database'

interface PlatformPresetPickerProps {
  presets: TemplatePlatformPreset[]
  selected: string
  onSelect: (platform: string, aspectRatio: string) => void
  disabled?: boolean
}

export function PlatformPresetPicker({ presets, selected, onSelect, disabled }: PlatformPresetPickerProps) {
  if (presets.length === 0) return null

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-300">Platform</label>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.platform}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(preset.platform, preset.aspect_ratio)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              selected === preset.platform
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                : 'bg-white/5 text-gray-400 border border-nyx-border hover:border-nyx-borderBright hover:text-white',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {preset.label}
            <span className="ml-1 text-[10px] text-gray-500">{preset.aspect_ratio}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
