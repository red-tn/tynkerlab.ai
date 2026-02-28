'use client'

import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'info'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-primary-500/10 text-primary-400 border border-primary-500/20': variant === 'default',
          'border border-nyx-border text-gray-400': variant === 'outline',
          'bg-success/10 text-success border border-success/20': variant === 'success',
          'bg-warning/10 text-warning border border-warning/20': variant === 'warning',
          'bg-error/10 text-error border border-error/20': variant === 'error',
          'bg-info/10 text-info border border-info/20': variant === 'info',
        },
        className
      )}
      {...props}
    />
  )
}
