'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, alt = '', fallback, size = 'md', className }: AvatarProps) {
  const initials = fallback
    ? fallback.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  const sizePx = { sm: 32, md: 40, lg: 48, xl: 64 }

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-nyx-surface border border-nyx-border flex items-center justify-center shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={sizePx[size]}
          height={sizePx[size]}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="font-medium gradient-text">{initials}</span>
      )}
    </div>
  )
}
