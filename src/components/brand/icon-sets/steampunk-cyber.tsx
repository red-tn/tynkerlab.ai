'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface IconProps {
  size?: number
  className?: string
}

/**
 * Steampunk x Cyberpunk: Brass clockwork camera with glowing cyan lens.
 * Gear teeth on the body, small steam wisps, neon circuit lines on the frame.
 */
export function SteampunkTextToImageIcon({ size = 24, className }: IconProps) {
  const reactId = useId()
  const id = `sp-tti-${reactId.replace(/:/g, '')}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={`${id}-brass`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${id}-neon`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <radialGradient id={`${id}-lens`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* Camera body - brass */}
      <rect x="4" y="7" width="16" height="12" rx="2" stroke={`url(#${id}-brass)`} strokeWidth="1.5" />

      {/* Viewfinder bump on top */}
      <path d="M8 7V5.5C8 4.67 8.67 4 9.5 4H14.5C15.33 4 16 4.67 16 5.5V7" stroke={`url(#${id}-brass)`} strokeWidth="1.3" strokeLinecap="round" />

      {/* Gear teeth on top-left of body */}
      <rect x="4.5" y="8.5" width="1.2" height="1.8" rx="0.3" fill="#d97706" fillOpacity="0.7" />
      <rect x="4.5" y="11.2" width="1.2" height="1.8" rx="0.3" fill="#d97706" fillOpacity="0.7" />
      <rect x="4.5" y="13.9" width="1.2" height="1.8" rx="0.3" fill="#d97706" fillOpacity="0.7" />

      {/* Lens - outer ring (brass) */}
      <circle cx="12" cy="13" r="4" stroke={`url(#${id}-brass)`} strokeWidth="1.4" />

      {/* Lens - inner glow (cyan) */}
      <circle cx="12" cy="13" r="2.5" fill={`url(#${id}-lens)`} />

      {/* Lens center highlight */}
      <circle cx="11.3" cy="12.3" r="0.7" fill="#06b6d4" fillOpacity="0.8" />

      {/* Circuit traces on body - neon */}
      <path d="M17 9H18.5V11" stroke="#06b6d4" strokeWidth="0.6" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M17 16H18.5V14.5" stroke="#8b5cf6" strokeWidth="0.6" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Rivet dots */}
      <circle cx="6.5" cy="17.5" r="0.5" fill="#b45309" />
      <circle cx="17.5" cy="17.5" r="0.5" fill="#b45309" />

      {/* Small gear on viewfinder */}
      <circle cx="10" cy="5" r="1.2" stroke="#d97706" strokeWidth="0.7" fill="none" />
      <line x1="10" y1="3.5" x2="10" y2="3.8" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="10" y1="6.2" x2="10" y2="6.5" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="8.5" y1="5" x2="8.8" y2="5" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="11.2" y1="5" x2="11.5" y2="5" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />

      {/* Steam wisp from top */}
      <path d="M14.5 3.5C14.5 2.8 15 2.5 15.3 2C15.6 1.5 15.2 1" stroke="#06b6d4" strokeWidth="0.5" strokeLinecap="round" fill="none" strokeOpacity="0.5" />
      <path d="M15.8 3.2C15.8 2.6 16.2 2.3 16.4 1.9" stroke="#06b6d4" strokeWidth="0.4" strokeLinecap="round" fill="none" strokeOpacity="0.35" />

      {/* Flash/shutter button - neon accent */}
      <circle cx="18" cy="9" r="0.8" fill="#ec4899" fillOpacity="0.6" />
    </svg>
  )
}

/**
 * Steampunk x Cyberpunk: Two overlapping brass photo plates connected by a chain of gears.
 * Electric spark between them (magenta/cyan). Circuit traces along edges.
 */
export function SteampunkImageToImageIcon({ size = 24, className }: IconProps) {
  const reactId = useId()
  const id = `sp-iti-${reactId.replace(/:/g, '')}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={`${id}-brass`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${id}-neon`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id={`${id}-spark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Source plate (back) - brass */}
      <rect x="1" y="3" width="10" height="8" rx="1.5" stroke={`url(#${id}-brass)`} strokeWidth="1.3" />

      {/* Scene in source plate */}
      <path d="M2 9L4 6.5L5.5 7.5L8.5 5" stroke={`url(#${id}-brass)`} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />

      {/* Circuit traces on source plate edges */}
      <path d="M1.5 5H2.5L3 5.5" stroke="#06b6d4" strokeWidth="0.5" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Rivets on source plate */}
      <circle cx="2.5" cy="4.2" r="0.4" fill="#b45309" />
      <circle cx="9.5" cy="4.2" r="0.4" fill="#b45309" />

      {/* Result plate (front) - brass */}
      <rect x="13" y="13" width="10" height="8" rx="1.5" stroke={`url(#${id}-brass)`} strokeWidth="1.3" />

      {/* Enhanced scene in result plate */}
      <path d="M14 19L16 16.5L17.5 17.5L20.5 15" stroke={`url(#${id}-brass)`} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21" cy="15" r="0.8" fill="#06b6d4" fillOpacity="0.5" />

      {/* Circuit traces on result plate */}
      <path d="M22.5 15.5V16.5L22 17" stroke="#8b5cf6" strokeWidth="0.5" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Rivets on result plate */}
      <circle cx="14.5" cy="14.2" r="0.4" fill="#b45309" />
      <circle cx="21.5" cy="14.2" r="0.4" fill="#b45309" />

      {/* Gear chain connecting the plates */}
      {/* Gear 1 (top-right area) */}
      <circle cx="9" cy="13" r="2" stroke={`url(#${id}-brass)`} strokeWidth="1" fill="none" />
      <circle cx="9" cy="13" r="0.6" fill="#d97706" />
      {/* Gear 1 teeth */}
      <line x1="9" y1="10.7" x2="9" y2="11" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="9" y1="15" x2="9" y2="15.3" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="6.7" y1="13" x2="7" y2="13" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="11" y1="13" x2="11.3" y2="13" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="7.6" y1="11.6" x2="7.8" y2="11.8" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="10.2" y1="14.2" x2="10.4" y2="14.4" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />

      {/* Gear 2 (smaller, meshing) */}
      <circle cx="13" cy="11.5" r="1.3" stroke={`url(#${id}-brass)`} strokeWidth="0.8" fill="none" />
      <circle cx="13" cy="11.5" r="0.4" fill="#d97706" />
      {/* Gear 2 teeth */}
      <line x1="13" y1="9.9" x2="13" y2="10.2" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="13" y1="12.8" x2="13" y2="13.1" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="11.4" y1="11.5" x2="11.7" y2="11.5" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="14.3" y1="11.5" x2="14.6" y2="11.5" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />

      {/* Electric spark between plates */}
      <path d="M11 9L12 7.5L13.5 9L14.5 7" stroke={`url(#${id}-spark)`} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Spark particles */}
      <circle cx="11.5" cy="6.5" r="0.4" fill="#ec4899" fillOpacity="0.7" />
      <circle cx="14" cy="6" r="0.3" fill="#06b6d4" fillOpacity="0.6" />

      {/* Neon glow accent */}
      <circle cx="15.5" cy="9" r="0.5" fill="#06b6d4" fillOpacity="0.4" />
    </svg>
  )
}

/**
 * Steampunk x Cyberpunk: Victorian projector/kinetoscope with brass body,
 * spinning gear mechanism, holographic cyan beam. Film strip with gear sprockets.
 */
export function SteampunkTextToVideoIcon({ size = 24, className }: IconProps) {
  const reactId = useId()
  const id = `sp-ttv-${reactId.replace(/:/g, '')}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={`${id}-brass`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`${id}-neon`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Projector body - brass box */}
      <rect x="2" y="8" width="10" height="10" rx="1.5" stroke={`url(#${id}-brass)`} strokeWidth="1.4" />

      {/* Brass frame details */}
      <line x1="2" y1="11" x2="12" y2="11" stroke="#d97706" strokeWidth="0.5" strokeOpacity="0.4" />

      {/* Rivets on body */}
      <circle cx="3.5" cy="9.3" r="0.4" fill="#b45309" />
      <circle cx="10.5" cy="9.3" r="0.4" fill="#b45309" />
      <circle cx="3.5" cy="16.7" r="0.4" fill="#b45309" />
      <circle cx="10.5" cy="16.7" r="0.4" fill="#b45309" />

      {/* Lens / projection aperture */}
      <circle cx="12" cy="14" r="1.8" stroke={`url(#${id}-brass)`} strokeWidth="1.2" />
      <circle cx="12" cy="14" r="0.8" fill="#06b6d4" fillOpacity="0.7" />

      {/* Holographic beam projecting outward */}
      <path d="M13.8 14L22 10V18Z" fill={`url(#${id}-beam)`} />

      {/* Beam scan lines */}
      <line x1="15" y1="12.5" x2="20" y2="11" stroke="#06b6d4" strokeWidth="0.3" strokeOpacity="0.4" />
      <line x1="15" y1="14" x2="21" y2="14" stroke="#06b6d4" strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="15" y1="15.5" x2="20" y2="17" stroke="#06b6d4" strokeWidth="0.3" strokeOpacity="0.4" />

      {/* Film reel / gear on top of projector */}
      <circle cx="5" cy="5.5" r="2.5" stroke={`url(#${id}-brass)`} strokeWidth="1" fill="none" />
      <circle cx="5" cy="5.5" r="0.7" fill="#d97706" />
      {/* Gear teeth on reel */}
      <line x1="5" y1="2.7" x2="5" y2="3" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="5" y1="8" x2="5" y2="8.3" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="2.2" y1="5.5" x2="2.5" y2="5.5" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="7.5" y1="5.5" x2="7.8" y2="5.5" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="3.2" y1="3.7" x2="3.5" y2="3.9" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="6.5" y1="7.1" x2="6.8" y2="7.3" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="3.2" y1="7.3" x2="3.5" y2="7.1" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="6.5" y1="3.9" x2="6.8" y2="3.7" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />

      {/* Film strip connecting reel to body */}
      <path d="M7.3 6.5L9 8" stroke={`url(#${id}-brass)`} strokeWidth="0.8" strokeLinecap="round" />

      {/* Film sprocket holes */}
      <rect x="7.8" y="7" width="0.6" height="0.6" rx="0.1" fill="#d97706" fillOpacity="0.5" />

      {/* Circuit traces on body */}
      <path d="M3 13H4.5L5 13.5V15" stroke="#06b6d4" strokeWidth="0.5" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M3 15.5H4L4.5 16" stroke="#8b5cf6" strokeWidth="0.5" strokeLinecap="round" strokeOpacity="0.5" />

      {/* Legs / stand */}
      <line x1="4" y1="18" x2="3" y2="20.5" stroke={`url(#${id}-brass)`} strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="18" x2="11" y2="20.5" stroke={`url(#${id}-brass)`} strokeWidth="1" strokeLinecap="round" />

      {/* Steam wisp from top */}
      <path d="M9 7C9 6 9.5 5.5 9.3 4.8" stroke="#06b6d4" strokeWidth="0.4" strokeLinecap="round" fill="none" strokeOpacity="0.4" />
    </svg>
  )
}

/**
 * Steampunk x Cyberpunk: Brass mechanical eye (steampunk monocle) with gear iris,
 * connected to a small film reel via copper pipes. Neon glow from the eye pupil.
 */
export function SteampunkImageToVideoIcon({ size = 24, className }: IconProps) {
  const reactId = useId()
  const id = `sp-itv-${reactId.replace(/:/g, '')}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={`${id}-brass`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id={`${id}-pupil`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
          <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </radialGradient>
        <linearGradient id={`${id}-copper`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Monocle outer ring - brass */}
      <circle cx="8.5" cy="11" r="6" stroke={`url(#${id}-brass)`} strokeWidth="1.5" />

      {/* Monocle inner ring */}
      <circle cx="8.5" cy="11" r="4.2" stroke="#d97706" strokeWidth="0.6" strokeOpacity="0.5" />

      {/* Gear iris blades */}
      <path d="M8.5 6.8L9.3 8L7.7 8Z" fill="#d97706" fillOpacity="0.4" />
      <path d="M12.7 11L11.5 11.8L11.5 10.2Z" fill="#d97706" fillOpacity="0.4" />
      <path d="M8.5 15.2L7.7 14L9.3 14Z" fill="#d97706" fillOpacity="0.4" />
      <path d="M4.3 11L5.5 10.2L5.5 11.8Z" fill="#d97706" fillOpacity="0.4" />

      {/* Pupil - neon glow */}
      <circle cx="8.5" cy="11" r="2.2" fill={`url(#${id}-pupil)`} />
      <circle cx="8.5" cy="11" r="1" fill="#06b6d4" fillOpacity="0.9" />

      {/* Eye highlight */}
      <circle cx="7.5" cy="10" r="0.5" fill="white" fillOpacity="0.5" />

      {/* Gear teeth on outer monocle */}
      <line x1="8.5" y1="4.5" x2="8.5" y2="5" stroke="#d97706" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="8.5" y1="17" x2="8.5" y2="17.5" stroke="#d97706" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="2" y1="11" x2="2.5" y2="11" stroke="#d97706" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="14.5" y1="11" x2="15" y2="11" stroke="#d97706" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="4.3" y1="6.8" x2="4.6" y2="7.1" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="12.4" y1="14.9" x2="12.7" y2="15.2" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="4.3" y1="15.2" x2="4.6" y2="14.9" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="12.4" y1="7.1" x2="12.7" y2="6.8" stroke="#d97706" strokeWidth="0.7" strokeLinecap="round" />

      {/* Copper pipe connecting eye to reel */}
      <path d="M14.5 11H16V8.5H18" stroke={`url(#${id}-copper)`} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Pipe joint ring */}
      <circle cx="16" cy="9.8" r="0.5" stroke="#b45309" strokeWidth="0.5" fill="none" />

      {/* Film reel */}
      <circle cx="20" cy="7" r="2.8" stroke={`url(#${id}-brass)`} strokeWidth="1" fill="none" />
      <circle cx="20" cy="7" r="0.8" fill="#d97706" />

      {/* Reel spokes */}
      <line x1="20" y1="4.5" x2="20" y2="5.5" stroke="#d97706" strokeWidth="0.5" />
      <line x1="20" y1="8.5" x2="20" y2="9.5" stroke="#d97706" strokeWidth="0.5" />
      <line x1="17.5" y1="7" x2="18.5" y2="7" stroke="#d97706" strokeWidth="0.5" />
      <line x1="21.5" y1="7" x2="22.5" y2="7" stroke="#d97706" strokeWidth="0.5" />

      {/* Lower copper pipe to second reel */}
      <path d="M14.5 12H16.5V15H18" stroke={`url(#${id}-copper)`} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Second film reel (smaller) */}
      <circle cx="20" cy="16.5" r="2.3" stroke={`url(#${id}-brass)`} strokeWidth="0.9" fill="none" />
      <circle cx="20" cy="16.5" r="0.6" fill="#d97706" />

      {/* Film strip between reels */}
      <line x1="22" y1="9" x2="22" y2="14.5" stroke="#d97706" strokeWidth="0.5" strokeOpacity="0.5" />
      {/* Sprocket holes on film */}
      <rect x="21.6" y="10" width="0.5" height="0.5" rx="0.1" fill="#d97706" fillOpacity="0.4" />
      <rect x="21.6" y="11.5" width="0.5" height="0.5" rx="0.1" fill="#d97706" fillOpacity="0.4" />
      <rect x="21.6" y="13" width="0.5" height="0.5" rx="0.1" fill="#d97706" fillOpacity="0.4" />

      {/* Neon circuit trace on monocle frame */}
      <path d="M3.5 7.5L3 6.5" stroke="#06b6d4" strokeWidth="0.5" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M3 14L2.5 15.5" stroke="#8b5cf6" strokeWidth="0.5" strokeLinecap="round" strokeOpacity="0.5" />

      {/* Monocle chain/handle */}
      <path d="M5 16.5L3.5 19.5" stroke={`url(#${id}-brass)`} strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="3.5" cy="20" r="0.4" fill="#d97706" />
    </svg>
  )
}

/**
 * Steampunk x Cyberpunk: Brass gramophone/megaphone with gear mechanisms at the base.
 * Sound waves rendered as concentric neon arcs (cyan). Circuit board pattern on the horn.
 */
export function SteampunkTextToSpeechIcon({ size = 24, className }: IconProps) {
  const reactId = useId()
  const id = `sp-tts-${reactId.replace(/:/g, '')}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={`${id}-brass`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${id}-neon`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Gramophone horn - brass flare */}
      <path
        d="M4 11L8 9V15L4 13Z"
        stroke={`url(#${id}-brass)`}
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Horn bell / flare outward */}
      <path
        d="M4 11C2 9.5 1 8 1 7"
        stroke={`url(#${id}-brass)`}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 13C2 14.5 1 16 1 17"
        stroke={`url(#${id}-brass)`}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M1 7C1 6.5 1.5 6 2 6"
        stroke={`url(#${id}-brass)`}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M1 17C1 17.5 1.5 18 2 18"
        stroke={`url(#${id}-brass)`}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Circuit pattern on horn surface */}
      <path d="M3 10L2.5 9.5L2 9.5" stroke="#06b6d4" strokeWidth="0.4" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M3 14L2.5 14.5L2 14.5" stroke="#8b5cf6" strokeWidth="0.4" strokeLinecap="round" strokeOpacity="0.5" />
      <circle cx="2.8" cy="12" r="0.3" fill="#06b6d4" fillOpacity="0.5" />

      {/* Neck / tube from horn to base mechanism */}
      <path d="M8 12H10" stroke={`url(#${id}-brass)`} strokeWidth="1.5" strokeLinecap="round" />

      {/* Base mechanism box */}
      <rect x="10" y="9" width="4" height="6" rx="1" stroke={`url(#${id}-brass)`} strokeWidth="1.2" />

      {/* Gear on base mechanism */}
      <circle cx="12" cy="12" r="1.8" stroke="#d97706" strokeWidth="0.8" fill="none" />
      <circle cx="12" cy="12" r="0.5" fill="#d97706" />
      {/* Gear teeth */}
      <line x1="12" y1="9.9" x2="12" y2="10.2" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="12" y1="13.8" x2="12" y2="14.1" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="9.9" y1="12" x2="10.2" y2="12" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="13.8" y1="12" x2="14.1" y2="12" stroke="#d97706" strokeWidth="0.6" strokeLinecap="round" />

      {/* Rivets on mechanism */}
      <circle cx="11" cy="9.8" r="0.3" fill="#b45309" />
      <circle cx="13" cy="9.8" r="0.3" fill="#b45309" />

      {/* Stand / legs */}
      <line x1="10.5" y1="15" x2="10" y2="17.5" stroke={`url(#${id}-brass)`} strokeWidth="0.9" strokeLinecap="round" />
      <line x1="13.5" y1="15" x2="14" y2="17.5" stroke={`url(#${id}-brass)`} strokeWidth="0.9" strokeLinecap="round" />
      <line x1="9.5" y1="17.5" x2="14.5" y2="17.5" stroke={`url(#${id}-brass)`} strokeWidth="0.8" strokeLinecap="round" />

      {/* Small secondary gear */}
      <circle cx="12" cy="17" r="0.8" stroke="#d97706" strokeWidth="0.5" fill="none" />
      <circle cx="12" cy="17" r="0.25" fill="#d97706" />

      {/* Sound waves - neon cyan arcs */}
      <path d="M15 10C16 10.8 16 13.2 15 14" stroke="#06b6d4" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M17 8.5C18.5 10 18.5 14 17 15.5" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.7" />
      <path d="M19 7C21 9.5 21 14.5 19 17" stroke="#06b6d4" strokeWidth="0.8" strokeLinecap="round" fill="none" strokeOpacity="0.45" />
      <path d="M21 5.5C23.5 8.5 23.5 15.5 21 18.5" stroke="#06b6d4" strokeWidth="0.6" strokeLinecap="round" fill="none" strokeOpacity="0.25" />

      {/* Neon accents on wave tips */}
      <circle cx="16" cy="9" r="0.3" fill="#8b5cf6" fillOpacity="0.5" />
      <circle cx="18" cy="7.5" r="0.3" fill="#ec4899" fillOpacity="0.4" />

      {/* Steam wisp */}
      <path d="M11 8.5C11 7.8 11.5 7.3 11.3 6.5" stroke="#06b6d4" strokeWidth="0.4" strokeLinecap="round" fill="none" strokeOpacity="0.35" />
    </svg>
  )
}
