'use client'

import { useMemo } from 'react'
import { Select, type SelectOption } from '@/components/ui/select'
import { InfoTooltip } from '@/components/ui/info-tooltip'

const ALL_RESOLUTIONS: SelectOption[] = [
  { value: '512x512', label: '512 × 512' },
  { value: '768x768', label: '768 × 768' },
  { value: '1024x1024', label: '1024 × 1024' },
  { value: '1280x720', label: '1280 × 720 (720p)' },
  { value: '1920x1080', label: '1920 × 1080 (1080p)' },
  { value: '1024x768', label: '1024 × 768' },
  { value: '768x1024', label: '768 × 1024' },
  { value: '1280x1280', label: '1280 × 1280' },
  { value: '1536x1536', label: '1536 × 1536' },
]

interface ResolutionDef {
  w: number
  h: number
  label?: string
}

const ASPECT_RESOLUTIONS: Record<string, ResolutionDef[]> = {
  '1:1': [
    { w: 512, h: 512 },
    { w: 768, h: 768 },
    { w: 1024, h: 1024 },
    { w: 1280, h: 1280 },
    { w: 1536, h: 1536 },
  ],
  '16:9': [
    { w: 1024, h: 576 },
    { w: 1280, h: 720, label: '720p' },
    { w: 1536, h: 864 },
    { w: 1920, h: 1080, label: '1080p' },
  ],
  '9:16': [
    { w: 576, h: 1024 },
    { w: 720, h: 1280 },
    { w: 864, h: 1536 },
  ],
  '4:3': [
    { w: 768, h: 576 },
    { w: 1024, h: 768 },
    { w: 1280, h: 960 },
  ],
  '3:4': [
    { w: 576, h: 768 },
    { w: 768, h: 1024 },
    { w: 960, h: 1280 },
  ],
  '3:2': [
    { w: 768, h: 512 },
    { w: 1024, h: 684 },
    { w: 1536, h: 1024 },
  ],
  '2:3': [
    { w: 512, h: 768 },
    { w: 684, h: 1024 },
    { w: 1024, h: 1536 },
  ],
  '5:4': [
    { w: 640, h: 512 },
    { w: 1024, h: 820 },
    { w: 1280, h: 1024 },
  ],
  '4:5': [
    { w: 512, h: 640 },
    { w: 820, h: 1024 },
    { w: 1024, h: 1280 },
  ],
  '21:9': [
    { w: 1280, h: 548 },
    { w: 1536, h: 660 },
    { w: 1920, h: 822 },
  ],
}

function getResolutionsForAspect(aspectRatio: string): SelectOption[] {
  const defs = ASPECT_RESOLUTIONS[aspectRatio]
  if (!defs) return ALL_RESOLUTIONS
  return defs.map(({ w, h, label }) => ({
    value: `${w}x${h}`,
    label: `${w} × ${h}${label ? ` (${label})` : ''}`,
  }))
}

export function findClosestResolution(current: string, aspectRatio: string): string {
  const options = getResolutionsForAspect(aspectRatio)
  if (options.some(o => o.value === current)) return current
  // Pick the resolution closest in total pixel count to the current one
  const [cw, ch] = current.split('x').map(Number)
  const currentPixels = (cw || 1024) * (ch || 1024)
  let best = options[0].value
  let bestDiff = Infinity
  for (const opt of options) {
    const [ow, oh] = opt.value.split('x').map(Number)
    const diff = Math.abs(ow * oh - currentPixels)
    if (diff < bestDiff) {
      bestDiff = diff
      best = opt.value
    }
  }
  return best
}

interface ResolutionPickerProps {
  value: string
  onChange: (value: string) => void
  aspectRatio?: string
  disabled?: boolean
}

export function ResolutionPicker({ value, onChange, aspectRatio, disabled }: ResolutionPickerProps) {
  const options = useMemo(
    () => getResolutionsForAspect(aspectRatio || 'auto'),
    [aspectRatio]
  )

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
        Resolution
        <InfoTooltip text="Higher resolution = more detail but uses more processing time. 1024×1024 is recommended for most use cases." />
      </label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
        disabled={disabled}
      />
    </div>
  )
}
