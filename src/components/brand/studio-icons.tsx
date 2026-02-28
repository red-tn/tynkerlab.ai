'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface IconProps {
  size?: number
  className?: string
}

/**
 * Text-to-Image: sparkle wand painting onto a canvas frame.
 * Gradient: violet -> blue
 */
export function TextToImageIcon({ size = 24, className }: IconProps) {
  const reactId = useId()
  const id = `tti-${reactId.replace(/:/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('shrink-0', className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {/* Wand */}
      <line x1="3" y1="19" x2="10" y2="12" stroke={`url(#${id}-g)`} strokeWidth="1.8" strokeLinecap="round" />
      {/* Sparkle at wand tip */}
      <path d="M10 12L11 10L12 12L11 14Z" fill="#06b6d4" />
      <path d="M10 12L8 11L10 10L12 11Z" fill="#7c3aed" fillOpacity="0.7" />
      {/* Spark particles */}
      <circle cx="7" cy="8" r="0.7" fill="#06b6d4" />
      <circle cx="5" cy="11" r="0.5" fill="#3b82f6" />
      {/* Image canvas */}
      <rect x="13" y="3" width="9" height="12" rx="2" stroke={`url(#${id}-g)`} strokeWidth="1.5" />
      {/* Mountain scene inside canvas */}
      <path d="M13 12L15.5 8L17 10L20 6.5" stroke={`url(#${id}-g)`} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sun */}
      <circle cx="20" cy="5.5" r="1" fill="#06b6d4" />
      {/* Canvas shadow line */}
      <line x1="14" y1="16" x2="21" y2="16" stroke={`url(#${id}-g)`} strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Image-to-Image: two layered frames with a transform spark between them.
 * Gradient: blue -> cyan
 */
export function ImageToImageIcon({ size = 24, className }: IconProps) {
  const reactId = useId()
  const id = `iti-${reactId.replace(/:/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('shrink-0', className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Source frame */}
      <rect x="1.5" y="3" width="10" height="10" rx="2" stroke={`url(#${id}-g)`} strokeWidth="1.5" />
      <path d="M1.5 10.5L4.5 7L6.5 8.5L11.5 5" stroke={`url(#${id}-g)`} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Result frame */}
      <rect x="12.5" y="11" width="10" height="10" rx="2" stroke={`url(#${id}-g)`} strokeWidth="1.5" />
      {/* Enhanced star in result */}
      <path d="M17.5 16L18.5 14L19.5 16L18.5 18Z" fill="#06b6d4" />
      <path d="M17.5 16L15.5 15L17.5 14L19.5 15Z" fill="#3b82f6" fillOpacity="0.6" />
      {/* Curved transform arrow */}
      <path d="M8 4C12 1.5 18 2 20 7" stroke={`url(#${id}-g)`} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M18.5 5.5L20 7L21.5 5.5" stroke={`url(#${id}-g)`} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sparkle on arrow */}
      <circle cx="14" cy="2.5" r="0.8" fill="#7c3aed" fillOpacity="0.7" />
    </svg>
  )
}

/**
 * Text-to-Video: script page morphing into a clapperboard/play.
 * Gradient: violet -> blue
 */
export function TextToVideoIcon({ size = 24, className }: IconProps) {
  const reactId = useId()
  const id = `ttv-${reactId.replace(/:/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('shrink-0', className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Script / text lines */}
      <rect x="1.5" y="4" width="8" height="16" rx="1.5" stroke={`url(#${id}-g)`} strokeWidth="1.3" />
      <line x1="3.5" y1="7" x2="7.5" y2="7" stroke={`url(#${id}-g)`} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3.5" y1="10" x2="7" y2="10" stroke={`url(#${id}-g)`} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3.5" y1="13" x2="6.5" y2="13" stroke={`url(#${id}-g)`} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3.5" y1="16" x2="5.5" y2="16" stroke={`url(#${id}-g)`} strokeWidth="1.2" strokeLinecap="round" />
      {/* Flow arrow */}
      <path d="M10.5 12L12.5 12" stroke={`url(#${id}-g)`} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11.5 10.5L13 12L11.5 13.5" stroke={`url(#${id}-g)`} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Video / clapperboard */}
      <rect x="14" y="6" width="9" height="12" rx="2" stroke={`url(#${id}-g)`} strokeWidth="1.5" />
      {/* Clapper top */}
      <line x1="14" y1="9.5" x2="23" y2="9.5" stroke={`url(#${id}-g)`} strokeWidth="1" />
      <line x1="16" y1="6" x2="17.5" y2="9.5" stroke={`url(#${id}-g)`} strokeWidth="0.8" />
      <line x1="19" y1="6" x2="20.5" y2="9.5" stroke={`url(#${id}-g)`} strokeWidth="0.8" />
      {/* Play triangle */}
      <path d="M17 12L21 14.5L17 17Z" fill="#06b6d4" fillOpacity="0.8" />
    </svg>
  )
}

/**
 * Image-to-Video: photo frame transforming with film strip into motion.
 * Gradient: cyan -> violet
 */
export function ImageToVideoIcon({ size = 24, className }: IconProps) {
  const reactId = useId()
  const id = `itv-${reactId.replace(/:/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('shrink-0', className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {/* Photo frame */}
      <rect x="1.5" y="5" width="9" height="12" rx="1.5" stroke={`url(#${id}-g)`} strokeWidth="1.5" />
      <path d="M1.5 14L4 10L5.5 11.5L8.5 8" stroke={`url(#${id}-g)`} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="7.5" r="1" fill="#06b6d4" fillOpacity="0.6" />
      {/* Motion lines */}
      <line x1="11.5" y1="9" x2="13" y2="9" stroke={`url(#${id}-g)`} strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="11" y1="12" x2="13" y2="12" stroke={`url(#${id}-g)`} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="11.5" y1="15" x2="13" y2="15" stroke={`url(#${id}-g)`} strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
      {/* Film / video circle */}
      <circle cx="18.5" cy="12" r="5" stroke={`url(#${id}-g)`} strokeWidth="1.5" />
      {/* Play triangle */}
      <path d="M16.8 9.8L21.5 12L16.8 14.2Z" fill={`url(#${id}-g)`} fillOpacity="0.8" />
      {/* Film sprocket dots */}
      <circle cx="18.5" cy="7.2" r="0.6" fill="#06b6d4" fillOpacity="0.5" />
      <circle cx="18.5" cy="16.8" r="0.6" fill="#7c3aed" fillOpacity="0.5" />
      <circle cx="23.3" cy="12" r="0.6" fill="#06b6d4" fillOpacity="0.4" />
    </svg>
  )
}

/**
 * Text-to-Speech: sound wave emanating from a mic/speaker with text input.
 * Gradient: violet -> cyan
 */
export function TextToSpeechIcon({ size = 24, className }: IconProps) {
  const reactId = useId()
  const id = `tts-${reactId.replace(/:/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('shrink-0', className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Text lines */}
      <line x1="2" y1="7" x2="7" y2="7" stroke={`url(#${id}-g)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="10.5" x2="6" y2="10.5" stroke={`url(#${id}-g)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="14" x2="5" y2="14" stroke={`url(#${id}-g)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="17.5" x2="4" y2="17.5" stroke={`url(#${id}-g)`} strokeWidth="1.5" strokeLinecap="round" />
      {/* Microphone body */}
      <rect x="11" y="6" width="4" height="7" rx="2" stroke={`url(#${id}-g)`} strokeWidth="1.5" />
      {/* Mic stand arc */}
      <path d="M10 13C10 16 11.5 17 13 17C14.5 17 16 16 16 13" stroke={`url(#${id}-g)`} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <line x1="13" y1="17" x2="13" y2="19.5" stroke={`url(#${id}-g)`} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="11" y1="19.5" x2="15" y2="19.5" stroke={`url(#${id}-g)`} strokeWidth="1.3" strokeLinecap="round" />
      {/* Sound waves */}
      <path d="M18 8.5C19 9.5 19 12.5 18 13.5" stroke="#06b6d4" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M20 7C21.5 9 21.5 13 20 15" stroke="#06b6d4" strokeWidth="1.2" strokeLinecap="round" fill="none" strokeOpacity="0.6" />
      <path d="M22 5.5C24 8.5 24 13.5 22 16.5" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" fill="none" strokeOpacity="0.3" />
    </svg>
  )
}
