'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'gradient-primary text-white hover:opacity-90 hover:shadow-lg hover:shadow-primary-500/25': variant === 'primary',
            'bg-nyx-surface text-gray-200 border border-nyx-border hover:bg-nyx-surfaceHover hover:border-nyx-borderBright': variant === 'secondary',
            'text-gray-300 hover:text-white hover:bg-white/5': variant === 'ghost',
            'bg-error/10 text-error border border-error/20 hover:bg-error/20': variant === 'danger',
          },
          {
            'h-8 px-3 text-sm gap-1.5': size === 'sm',
            'h-10 px-4 text-sm gap-2': size === 'md',
            'h-12 px-6 text-base gap-2.5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export { Button, type ButtonProps }
