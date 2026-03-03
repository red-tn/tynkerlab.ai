'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  className?: string
}

/**
 * Tynkerlab.ai logo mark — creative lab flask with colorful nodes,
 * gears, network lines, and sparkle particles.
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
        <linearGradient id={`${id}-flask`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
      </defs>

      {/* Flask body */}
      <path
        d="M25 14V24L14 48C13 51 15 54 18 54H46C49 54 51 51 50 48L39 24V14"
        stroke={`url(#${id}-flask)`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Flask top rim with dots */}
      <line x1="23" y1="14" x2="41" y2="14" stroke={`url(#${id}-flask)`} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="23" cy="14" r="1.8" fill="#4338ca" />
      <circle cx="41" cy="14" r="1.8" fill="#4338ca" />

      {/* Internal network lines */}
      <path d="M22 42L32 34L42 42" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round" />
      <path d="M27 38L32 34L37 38" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.25" strokeLinecap="round" />
      <path d="M32 34V42" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.2" />

      {/* Colored node circles */}
      {/* Center node */}
      <circle cx="32" cy="28" r="3" fill="#22d3ee" />
      <circle cx="32" cy="28" r="1" fill="white" />
      {/* Left pink node */}
      <circle cx="24" cy="38" r="2.5" fill="#ec4899" />
      <circle cx="24" cy="38" r="0.8" fill="white" />
      {/* Right orange node */}
      <circle cx="40" cy="36" r="2.8" fill="#f97316" />
      <circle cx="40" cy="36" r="0.9" fill="white" />
      {/* Bottom cyan node */}
      <circle cx="32" cy="46" r="2.5" fill="#22d3ee" />
      <circle cx="32" cy="46" r="0.8" fill="white" />
      {/* Bottom-right pink */}
      <circle cx="40" cy="46" r="2.2" fill="#ec4899" />
      <circle cx="40" cy="46" r="0.7" fill="white" />
      {/* Bottom-left purple */}
      <circle cx="22" cy="46" r="1.8" fill="#6366f1" />
      <circle cx="22" cy="46" r="0.6" fill="white" />

      {/* Gear shapes (left side) */}
      <path
        d="M17 36L15.5 34.8L16.5 33L18.5 33.5L19.5 32L18.5 30.5L19.5 29L21 30L22 28.5L21.5 27L23 26.5L23.5 28L25 28L25.5 26.5L27 27L26 28.5L26.5 30L28 30.5L27 32"
        stroke="#f97316"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />
      <circle cx="21.5" cy="30" r="1.2" fill="#f97316" opacity="0.9" />
      {/* Small cyan gear */}
      <path
        d="M23 33.5L24.5 33L25.5 34L25 35.5L23.5 35.5Z"
        fill="#22d3ee"
        opacity="0.8"
      />

      {/* Pink diagonal line (right side) */}
      <line x1="43" y1="33" x2="47" y2="37" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="44" y1="35" x2="47" y2="35" stroke="#ec4899" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

      {/* Sparkle particles above flask */}
      {/* Star 1 - orange */}
      <path d="M28 9L28.5 7.5L30 7L28.5 6.5L28 5L27.5 6.5L26 7L27.5 7.5Z" fill="#f97316" opacity="0.8" />
      {/* Star 2 - cyan */}
      <path d="M34 7L34.4 5.8L35.5 5.5L34.4 5.2L34 4L33.6 5.2L32.5 5.5L33.6 5.8Z" fill="#22d3ee" opacity="0.9" />
      {/* Star 3 - pink */}
      <path d="M37 10L37.3 9L38.2 8.7L37.3 8.4L37 7.5L36.7 8.4L35.8 8.7L36.7 9Z" fill="#ec4899" opacity="0.7" />
      {/* Tiny dot sparkles */}
      <circle cx="31" cy="10" r="0.6" fill="#a78bfa" opacity="0.6" />
      <circle cx="25" cy="6" r="0.5" fill="#22d3ee" opacity="0.5" />
      <circle cx="39" cy="6" r="0.4" fill="#f97316" opacity="0.5" />
    </svg>
  )
}
