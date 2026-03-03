'use client'

import { Logo } from './logo'
import { cn } from '@/lib/utils'

interface LogoFullProps {
  size?: number
  className?: string
  showTagline?: boolean
}

/**
 * Full Tynkerlab.ai logo — lab flask mark + "tynkerlab.ai" wordmark + optional tagline.
 * Matches the brand lockup: white "tynkerlab" + cyan ".ai"
 */
export function LogoFull({ size = 32, className, showTagline = false }: LogoFullProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Logo size={size} />
      <div className="flex flex-col">
        <span className="font-bold tracking-tight leading-none" style={{ fontSize: size * 0.55 }}>
          <span className="text-white">tynkerlab</span>
          <span className="text-cyan-400">.ai</span>
        </span>
        {showTagline && (
          <span
            className="text-gray-400 leading-none mt-0.5"
            style={{ fontSize: size * 0.22 }}
          >
            Create Beyond Imagination
          </span>
        )}
      </div>
    </div>
  )
}
