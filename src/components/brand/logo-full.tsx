'use client'

import { Logo } from './logo'
import { cn } from '@/lib/utils'

interface LogoFullProps {
  size?: number
  className?: string
  showTagline?: boolean
}

/**
 * Full Tynkerlab.ai logo — lab flask mark + "Tynkerlab.ai" wordmark + optional tagline.
 */
export function LogoFull({ size = 32, className, showTagline = false }: LogoFullProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Logo size={size} />
      <div className="flex flex-col">
        <span className="font-bold tracking-tight leading-none" style={{ fontSize: size * 0.55 }}>
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Tynker</span>
          <span className="text-gray-200">lab</span>
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">.ai</span>
        </span>
        {showTagline && (
          <span
            className="text-gray-400 dark:text-gray-500 leading-none mt-0.5"
            style={{ fontSize: size * 0.25 }}
          >
            AI Creative Lab — Imagine, Generate, Create
          </span>
        )}
      </div>
    </div>
  )
}
