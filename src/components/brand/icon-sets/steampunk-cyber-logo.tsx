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
 * Steampunk x Cyberpunk logo mark — Victorian laboratory flask with brass frame,
 * rivets, glowing cyan liquid, gear mechanism stopper, circuit traces, and steam wisps.
 */
export function SteampunkLogo({ size = 32, className }: LogoProps) {
  const reactId = useId()
  const id = `sp-logo-${reactId.replace(/:/g, '')}`

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
        <linearGradient id={`${id}-brass`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={`${id}-neon`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id={`${id}-liquid`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="65%" r="40%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-copper`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Outer brass circle frame */}
      <circle cx="32" cy="32" r="29" stroke={`url(#${id}-brass)`} strokeWidth="2.5" fill="none" />

      {/* Background glow */}
      <circle cx="32" cy="36" r="22" fill={`url(#${id}-glow)`} />

      {/* Decorative rivets on the outer frame */}
      <circle cx="32" cy="3.5" r="1.5" fill="#b45309" />
      <circle cx="32" cy="60.5" r="1.5" fill="#b45309" />
      <circle cx="3.5" cy="32" r="1.5" fill="#b45309" />
      <circle cx="60.5" cy="32" r="1.5" fill="#b45309" />
      <circle cx="11" cy="11" r="1.2" fill="#b45309" fillOpacity="0.7" />
      <circle cx="53" cy="11" r="1.2" fill="#b45309" fillOpacity="0.7" />
      <circle cx="11" cy="53" r="1.2" fill="#b45309" fillOpacity="0.7" />
      <circle cx="53" cy="53" r="1.2" fill="#b45309" fillOpacity="0.7" />

      {/* Flask body - brass frame */}
      <path
        d="M24 20V28L18 44C17 47 19 50 22 50H42C45 50 47 47 46 44L40 28V20"
        stroke={`url(#${id}-brass)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Flask liquid fill */}
      <path
        d="M19.5 42L22 35L26 38L32 34L38 38L42 35L44.5 42C45.5 45 43.5 48.5 41 48.5H23C20.5 48.5 18.5 45 19.5 42Z"
        fill={`url(#${id}-liquid)`}
      />

      {/* Liquid surface wave - neon */}
      <path
        d="M21 37C24 34 28 39 32 36C36 33 40 38 43 35"
        stroke="#06b6d4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.7"
        fill="none"
      />

      {/* Flask top rim - brass */}
      <line x1="22" y1="20" x2="42" y2="20" stroke={`url(#${id}-brass)`} strokeWidth="2.5" strokeLinecap="round" />

      {/* Brass frame bands on flask */}
      <path d="M20 38H44" stroke="#d97706" strokeWidth="0.8" strokeOpacity="0.3" />
      <path d="M22 32H42" stroke="#d97706" strokeWidth="0.6" strokeOpacity="0.2" />

      {/* Rivets on flask body */}
      <circle cx="20.5" cy="38" r="1" fill="#b45309" fillOpacity="0.6" />
      <circle cx="43.5" cy="38" r="1" fill="#b45309" fillOpacity="0.6" />
      <circle cx="22" cy="48" r="0.8" fill="#b45309" fillOpacity="0.5" />
      <circle cx="42" cy="48" r="0.8" fill="#b45309" fillOpacity="0.5" />

      {/* Gear mechanism stopper/cap */}
      <rect x="26" y="15" width="12" height="5" rx="1" stroke={`url(#${id}-brass)`} strokeWidth="1.8" fill="none" />

      {/* Gear on stopper */}
      <circle cx="32" cy="14" r="3.5" stroke="#d97706" strokeWidth="1.2" fill="none" />
      <circle cx="32" cy="14" r="1.2" fill="#d97706" />
      {/* Gear teeth */}
      <line x1="32" y1="10" x2="32" y2="10.5" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="17.5" x2="32" y2="18" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="14" x2="28.5" y2="14" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="35.5" y1="14" x2="36" y2="14" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="29.5" y1="11.5" x2="29.8" y2="11.8" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
      <line x1="34.2" y1="16.2" x2="34.5" y2="16.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
      <line x1="29.5" y1="16.5" x2="29.8" y2="16.2" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
      <line x1="34.2" y1="11.8" x2="34.5" y2="11.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />

      {/* Neon circuit traces running down the glass */}
      <path
        d="M26 24L28 24L28 27L30 27L30 30"
        stroke="#06b6d4"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.6"
      />
      <path
        d="M38 24L36 24L36 26L34 26L34 29"
        stroke="#8b5cf6"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.5"
      />
      {/* Circuit node dots */}
      <circle cx="28" cy="24" r="0.8" fill="#06b6d4" fillOpacity="0.7" />
      <circle cx="30" cy="30" r="0.8" fill="#06b6d4" fillOpacity="0.5" />
      <circle cx="36" cy="24" r="0.8" fill="#8b5cf6" fillOpacity="0.6" />
      <circle cx="34" cy="29" r="0.8" fill="#8b5cf6" fillOpacity="0.4" />

      {/* Glowing bubbles in liquid */}
      <circle cx="27" cy="43" r="1.8" fill="#06b6d4" fillOpacity="0.5" />
      <circle cx="37" cy="45" r="1.3" fill="#06b6d4" fillOpacity="0.4" />
      <circle cx="32" cy="41" r="1" fill="#8b5cf6" fillOpacity="0.4" />
      <circle cx="25" cy="46" r="0.7" fill="#06b6d4" fillOpacity="0.3" />
      <circle cx="39" cy="42" r="0.8" fill="#8b5cf6" fillOpacity="0.3" />

      {/* AI spark / star inside flask */}
      <path
        d="M32 28L33.5 32L37.5 33L33.5 34L32 38L30.5 34L26.5 33L30.5 32Z"
        fill="#06b6d4"
        fillOpacity="0.8"
      />

      {/* Steam wisps from the top */}
      <path
        d="M28 10C28 8 29 6.5 28.5 4.5C28 2.5 27 1"
        stroke="#06b6d4"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.4"
      />
      <path
        d="M36 10C36 8.5 37 7 36.5 5C36 3 35.5 2"
        stroke="#8b5cf6"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.3"
      />
      <path
        d="M32 10.5C32 9 32.8 7.5 32.3 6"
        stroke="#06b6d4"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.25"
      />

      {/* Small decorative gears on outer frame */}
      {/* Top-right gear */}
      <circle cx="48" cy="16" r="2.5" stroke="#d97706" strokeWidth="0.8" fill="none" strokeOpacity="0.4" />
      <circle cx="48" cy="16" r="0.7" fill="#d97706" fillOpacity="0.4" />
      <line x1="48" y1="13.2" x2="48" y2="13.5" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="48" y1="18.5" x2="48" y2="18.8" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" strokeOpacity="0.4" />

      {/* Bottom-left gear */}
      <circle cx="16" cy="48" r="2" stroke="#d97706" strokeWidth="0.7" fill="none" strokeOpacity="0.4" />
      <circle cx="16" cy="48" r="0.6" fill="#d97706" fillOpacity="0.4" />
      <line x1="16" y1="45.7" x2="16" y2="46" stroke="#d97706" strokeWidth="0.5" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="16" y1="50" x2="16" y2="50.3" stroke="#d97706" strokeWidth="0.5" strokeLinecap="round" strokeOpacity="0.4" />
    </svg>
  )
}

/**
 * Full Steampunk x Cyberpunk logo — brass flask mark + "Tynkerlab.ai" wordmark.
 * Brass/amber gradient for "Tynker", neutral for "lab", cyan-to-violet for ".ai".
 */
export function SteampunkLogoFull({ size = 32, className, showTagline = false }: LogoFullProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <SteampunkLogo size={size} />
      <div className="flex flex-col">
        <span className="font-bold tracking-tight leading-none" style={{ fontSize: size * 0.55 }}>
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            Tynker
          </span>
          <span className="text-gray-200">lab</span>
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            .ai
          </span>
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
