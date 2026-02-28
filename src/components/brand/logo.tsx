'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  className?: string
}

/**
 * Tynkerlab.ai logo mark — flask/beaker with AI spark.
 * Brand gradient: violet-to-cyan creative lab theme.
 */
export function Logo({ size = 32, className }: LogoProps) {
  const reactId = useId()
  const id = `tl-${reactId.replace(/:/g, '')}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id={`${id}-fill`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="32" cy="32" r="29" stroke={`url(#${id}-grad)`} strokeWidth="2.5" fill={`url(#${id}-fill)`} />

      {/* Flask body */}
      <path
        d="M24 20V28L18 44C17 47 19 50 22 50H42C45 50 47 47 46 44L40 28V20"
        stroke={`url(#${id}-grad)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Flask top rim */}
      <line x1="22" y1="20" x2="42" y2="20" stroke={`url(#${id}-grad)`} strokeWidth="2.5" strokeLinecap="round" />

      {/* Liquid level */}
      <path
        d="M20 40C23 37 28 42 32 39C36 36 41 41 44 38"
        stroke={`url(#${id}-grad)`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.6"
        fill="none"
      />

      {/* AI spark / star */}
      <path
        d="M32 28L33.5 32L37.5 33L33.5 34L32 38L30.5 34L26.5 33L30.5 32Z"
        fill="#06b6d4"
        fillOpacity="0.9"
      />

      {/* Small bubble */}
      <circle cx="27" cy="43" r="1.5" fill="#7c3aed" fillOpacity="0.5" />
      <circle cx="37" cy="45" r="1" fill="#3b82f6" fillOpacity="0.4" />
    </svg>
  )
}
