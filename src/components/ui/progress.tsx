'use client'

import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Progress({ value, max = 100, className, showLabel, size = 'md' }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-primary-400 font-mono">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-nyx-border overflow-hidden',
          { 'h-1.5': size === 'sm', 'h-2.5': size === 'md', 'h-4': size === 'lg' }
        )}
      >
        <div
          className="h-full rounded-full gradient-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
