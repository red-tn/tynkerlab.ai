'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  className?: string
}

interface LogoFullProps {
  size?: number
  className?: string
  showTagline?: boolean
}

/**
 * Steampunk Blue logo mark — flask/nodes/gears/sparkles design
 * with blue-steel, sky-blue neon, and violet accents.
 */
export function SteampunkBlueLogo({ size = 32, className }: LogoProps) {
  const reactId = useId()
  const id = `spb-${reactId.replace(/:/g, '')}`

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
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
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
      <circle cx="23" cy="14" r="1.8" fill="#1d4ed8" />
      <circle cx="41" cy="14" r="1.8" fill="#1d4ed8" />

      {/* Internal network lines */}
      <path d="M22 42L32 34L42 42" stroke="#2563eb" strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round" />
      <path d="M27 38L32 34L37 38" stroke="#2563eb" strokeWidth="0.8" strokeOpacity="0.25" strokeLinecap="round" />
      <path d="M32 34V42" stroke="#2563eb" strokeWidth="0.8" strokeOpacity="0.2" />

      {/* Colored node circles */}
      {/* Center node — sky-blue neon */}
      <circle cx="32" cy="28" r="3" fill="#38bdf8" />
      <circle cx="32" cy="28" r="1" fill="white" />
      {/* Left indigo node */}
      <circle cx="24" cy="38" r="2.5" fill="#818cf8" />
      <circle cx="24" cy="38" r="0.8" fill="white" />
      {/* Right blue node */}
      <circle cx="40" cy="36" r="2.8" fill="#2563eb" />
      <circle cx="40" cy="36" r="0.9" fill="white" />
      {/* Bottom sky-blue node */}
      <circle cx="32" cy="46" r="2.5" fill="#38bdf8" />
      <circle cx="32" cy="46" r="0.8" fill="white" />
      {/* Bottom-right indigo */}
      <circle cx="40" cy="46" r="2.2" fill="#818cf8" />
      <circle cx="40" cy="46" r="0.7" fill="white" />
      {/* Bottom-left violet */}
      <circle cx="22" cy="46" r="1.8" fill="#8b5cf6" />
      <circle cx="22" cy="46" r="0.6" fill="white" />

      {/* Gear shapes (left side) — blue-steel */}
      <path
        d="M17 36L15.5 34.8L16.5 33L18.5 33.5L19.5 32L18.5 30.5L19.5 29L21 30L22 28.5L21.5 27L23 26.5L23.5 28L25 28L25.5 26.5L27 27L26 28.5L26.5 30L28 30.5L27 32"
        stroke="#2563eb"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />
      <circle cx="21.5" cy="30" r="1.2" fill="#2563eb" opacity="0.9" />
      {/* Small sky-blue gear */}
      <path
        d="M23 33.5L24.5 33L25.5 34L25 35.5L23.5 35.5Z"
        fill="#38bdf8"
        opacity="0.8"
      />

      {/* Indigo diagonal line (right side) */}
      <line x1="43" y1="33" x2="47" y2="37" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="44" y1="35" x2="47" y2="35" stroke="#818cf8" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

      {/* Sparkle particles above flask */}
      {/* Star 1 — blue-steel */}
      <path d="M28 9L28.5 7.5L30 7L28.5 6.5L28 5L27.5 6.5L26 7L27.5 7.5Z" fill="#2563eb" opacity="0.8" />
      {/* Star 2 — sky-blue neon */}
      <path d="M34 7L34.4 5.8L35.5 5.5L34.4 5.2L34 4L33.6 5.2L32.5 5.5L33.6 5.8Z" fill="#38bdf8" opacity="0.9" />
      {/* Star 3 — indigo */}
      <path d="M37 10L37.3 9L38.2 8.7L37.3 8.4L37 7.5L36.7 8.4L35.8 8.7L36.7 9Z" fill="#818cf8" opacity="0.7" />
      {/* Tiny dot sparkles */}
      <circle cx="31" cy="10" r="0.6" fill="#8b5cf6" opacity="0.6" />
      <circle cx="25" cy="6" r="0.5" fill="#38bdf8" opacity="0.5" />
      <circle cx="39" cy="6" r="0.4" fill="#2563eb" opacity="0.5" />
    </svg>
  )
}

/**
 * Full Steampunk Blue logo — flask mark + "tynkerlab.ai" wordmark.
 * Blue "tynkerlab" + sky-to-violet ".ai"
 */
export function SteampunkBlueLogoFull({ size = 32, className, showTagline = false }: LogoFullProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <SteampunkBlueLogo size={size} />
      <div className="flex flex-col">
        <span className="font-bold tracking-tight leading-none" style={{ fontSize: size * 0.55 }}>
          <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
            tynkerlab
          </span>
          <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
            .ai
          </span>
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
