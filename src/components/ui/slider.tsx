'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showValue?: boolean
  formatValue?: (value: number) => string
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue, formatValue, value, ...props }, ref) => {
    const displayValue = formatValue
      ? formatValue(Number(value))
      : String(value)

    return (
      <div className="space-y-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
            {showValue && <span className="text-sm text-primary-400 font-mono">{displayValue}</span>}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          className={cn(
            'w-full h-2 rounded-full appearance-none cursor-pointer',
            'bg-nyx-border',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:gradient-primary',
            '[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(124,58,237,0.5)]',
            '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-400',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = 'Slider'
export { Slider, type SliderProps }
