'use client'

import { useState, type ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfoTooltipProps {
  text: string
  className?: string
}

export function InfoTooltip({ text, className }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <Info className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300 cursor-help transition-colors" />
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-gray-200 bg-nyx-surface border border-nyx-border rounded-lg shadow-xl w-56 leading-relaxed animate-fade-in">
          {text}
        </div>
      )}
    </div>
  )
}
