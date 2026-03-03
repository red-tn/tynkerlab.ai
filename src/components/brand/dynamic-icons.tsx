'use client'

import { useBrand } from '@/hooks/use-brand'

/**
 * Dynamic brand icon wrappers that read from the active icon set.
 * Drop-in replacements for the static Logo, LogoFull, and studio icon imports.
 */

export function Logo({ size, className }: { size?: number; className?: string }) {
  const icons = useBrand((s) => s.getIcons())
  return <icons.Logo size={size} className={className} />
}

export function LogoFull({ size, className, showTagline }: { size?: number; className?: string; showTagline?: boolean }) {
  const icons = useBrand((s) => s.getIcons())
  return <icons.LogoFull size={size} className={className} showTagline={showTagline} />
}

export function TextToImageIcon({ size, className }: { size?: number; className?: string }) {
  const icons = useBrand((s) => s.getIcons())
  return <icons.TextToImageIcon size={size} className={className} />
}

export function ImageToImageIcon({ size, className }: { size?: number; className?: string }) {
  const icons = useBrand((s) => s.getIcons())
  return <icons.ImageToImageIcon size={size} className={className} />
}

export function TextToVideoIcon({ size, className }: { size?: number; className?: string }) {
  const icons = useBrand((s) => s.getIcons())
  return <icons.TextToVideoIcon size={size} className={className} />
}

export function ImageToVideoIcon({ size, className }: { size?: number; className?: string }) {
  const icons = useBrand((s) => s.getIcons())
  return <icons.ImageToVideoIcon size={size} className={className} />
}

export function TextToSpeechIcon({ size, className }: { size?: number; className?: string }) {
  const icons = useBrand((s) => s.getIcons())
  return <icons.TextToSpeechIcon size={size} className={className} />
}
