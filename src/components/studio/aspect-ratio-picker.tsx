'use client'

import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/info-tooltip'

const ASPECT_RATIOS = [
  { label: 'Auto', value: 'auto', width: 1, height: 1 },
  { label: '1:1', value: '1:1', width: 1, height: 1 },
  { label: '4:3', value: '4:3', width: 4, height: 3 },
  { label: '3:4', value: '3:4', width: 3, height: 4 },
  { label: '16:9', value: '16:9', width: 16, height: 9 },
  { label: '9:16', value: '9:16', width: 9, height: 16 },
  { label: '3:2', value: '3:2', width: 3, height: 2 },
  { label: '2:3', value: '2:3', width: 2, height: 3 },
  { label: '5:4', value: '5:4', width: 5, height: 4 },
  { label: '4:5', value: '4:5', width: 4, height: 5 },
  { label: '21:9', value: '21:9', width: 21, height: 9 },
]

interface AspectRatioPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function AspectRatioPicker({ value, onChange, disabled }: AspectRatioPickerProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
        Aspect Ratio
        <InfoTooltip text="The shape of your output. 1:1 for social posts, 16:9 for widescreen, 9:16 for mobile/stories." />
      </label>
      <div className="grid grid-cols-4 gap-2">
        {ASPECT_RATIOS.map((ratio) => {
          const maxDim = 24
          const scale = maxDim / Math.max(ratio.width, ratio.height)
          const w = Math.round(ratio.width * scale)
          const h = Math.round(ratio.height * scale)
          return (
            <button
              key={ratio.value}
              type="button"
              onClick={() => !disabled && onChange(ratio.value)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
                value === ratio.value
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-borderBright hover:text-gray-300',
                'disabled:opacity-50'
              )}
            >
              <div className={cn('border rounded-sm', value === ratio.value ? 'border-primary-400' : 'border-gray-600')} style={{ width: w, height: h }} />
              <span className="text-[10px] font-mono">{ratio.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
