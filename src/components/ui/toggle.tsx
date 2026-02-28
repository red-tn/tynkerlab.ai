'use client'

import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Toggle({ checked, onChange, label, description, disabled, className }: ToggleProps) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'gradient-primary' : 'bg-nyx-border'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 mt-0.5',
            checked ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <span className="text-sm font-medium text-gray-200">{label}</span>}
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      )}
    </label>
  )
}
