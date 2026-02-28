'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelExtra?: React.ReactNode
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, labelExtra, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
            {label}
            {labelExtra}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg bg-nyx-surface border px-3 py-2 text-sm text-white placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
            'transition-colors duration-200',
            error ? 'border-error focus:ring-error/50' : 'border-nyx-border hover:border-nyx-borderBright',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export { Input, type InputProps }
