'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [settled, setSettled] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContentHeight(entry.contentRect.height)
        }
      })
      resizeObserver.observe(contentRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

  // After opening transition ends, allow overflow so dropdowns aren't clipped
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setSettled(true), 300)
      return () => clearTimeout(timer)
    } else {
      setSettled(false)
    }
  }, [isOpen])

  return (
    <div className={cn('rounded-lg border border-nyx-border bg-nyx-surface/50', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-gray-300',
          'hover:text-white transition-colors rounded-lg',
          isOpen && 'border-b border-nyx-border/50'
        )}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span>{title}</span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'transition-[max-height] duration-300 ease-in-out',
          settled ? 'overflow-visible' : 'overflow-hidden'
        )}
        style={{
          maxHeight: isOpen ? (settled ? 'none' : (contentHeight !== undefined ? contentHeight + 32 : 2000)) : 0,
        }}
      >
        <div ref={contentRef} className="px-3.5 py-3 space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}
