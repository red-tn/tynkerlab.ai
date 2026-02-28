'use client'

import { cn } from '@/lib/utils'

interface PricingToggleProps {
  annual: boolean
  onToggle: (annual: boolean) => void
}

export function PricingToggle({ annual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={cn('text-sm font-medium', !annual ? 'text-white' : 'text-gray-500')}>
        Monthly
      </span>
      <button
        onClick={() => onToggle(!annual)}
        className={cn(
          'relative w-14 h-7 rounded-full transition-colors duration-300',
          annual ? 'bg-primary-500' : 'bg-nyx-border'
        )}
      >
        <div className={cn(
          'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300',
          annual ? 'translate-x-7' : 'translate-x-0.5'
        )} />
      </button>
      <span className={cn('text-sm font-medium', annual ? 'text-white' : 'text-gray-500')}>
        Annual
      </span>
      {annual && (
        <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
          Save 50%
        </span>
      )}
    </div>
  )
}
