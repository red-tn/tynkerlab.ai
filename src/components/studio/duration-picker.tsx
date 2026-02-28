'use client'

import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/info-tooltip'

const DURATIONS = [
  { label: '5s', value: '5' },
  { label: '8s', value: '8' },
  { label: '10s', value: '10' },
  { label: '15s', value: '15' },
]

interface DurationPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function DurationPicker({ value, onChange, disabled }: DurationPickerProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
        Duration
        <InfoTooltip text="Length of generated video. Longer = more credits and processing time." />
      </label>
      <div className="flex gap-2">
        {DURATIONS.map((dur) => (
          <button
            key={dur.value}
            type="button"
            onClick={() => !disabled && onChange(dur.value)}
            disabled={disabled}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
              value === dur.value
                ? 'border-primary-500 bg-primary-500/10 text-white'
                : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-borderBright',
              'disabled:opacity-50'
            )}
          >
            {dur.label}
          </button>
        ))}
      </div>
    </div>
  )
}
