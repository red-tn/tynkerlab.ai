'use client'

import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/info-tooltip'

const CAMERA_LABELS: Record<string, string> = {
  horizontal_left: 'Pan Left',
  horizontal_right: 'Pan Right',
  vertical_up: 'Tilt Up',
  vertical_down: 'Tilt Down',
  zoom_in: 'Zoom In',
  zoom_out: 'Zoom Out',
  crane_up: 'Crane Up',
  quickly_zoom_in: 'Quick Zoom In',
  quickly_zoom_out: 'Quick Zoom Out',
  smooth_zoom_in: 'Smooth Zoom',
  camera_rotation: 'Rotate',
  robo_arm: 'Robot Arm',
  super_dolly_out: 'Dolly Out',
  whip_pan: 'Whip Pan',
  hitchcock: 'Hitchcock',
  left_follow: 'Follow Left',
  right_follow: 'Follow Right',
  pan_left: 'Slow Pan L',
  pan_right: 'Slow Pan R',
  fix_bg: 'Fix Background',
}

interface CameraMotionPickerProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  disabled?: boolean
}

export function CameraMotionPicker({ value, onChange, options, disabled }: CameraMotionPickerProps) {
  if (!options || options.length === 0) return null

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
        Camera Motion
        <InfoTooltip text="Add cinematic camera movement to your video. Select 'None' for default AI-controlled motion." />
      </label>
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => !disabled && onChange('')}
          disabled={disabled}
          className={cn(
            'py-1.5 px-2 rounded-md text-[11px] font-medium border transition-all truncate',
            !value
              ? 'border-primary-500 bg-primary-500/10 text-white'
              : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-borderBright',
            'disabled:opacity-50'
          )}
        >
          None
        </button>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => !disabled && onChange(opt)}
            disabled={disabled}
            className={cn(
              'py-1.5 px-2 rounded-md text-[11px] font-medium border transition-all truncate',
              value === opt
                ? 'border-primary-500 bg-primary-500/10 text-white'
                : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-borderBright',
              'disabled:opacity-50'
            )}
          >
            {CAMERA_LABELS[opt] || opt}
          </button>
        ))}
      </div>
    </div>
  )
}
