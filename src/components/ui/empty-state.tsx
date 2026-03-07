'use client'

import { type ElementType } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Image as ImageIcon,
  Film,
  Sparkles,
  Search,
  AlertTriangle,
  Layers,
  Palette,
  type LucideProps,
} from 'lucide-react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Variant configuration
// ---------------------------------------------------------------------------

type EmptyStateVariant = 'default' | 'gallery' | 'search' | 'error'

interface VariantConfig {
  /** Gradient glow behind the illustration */
  glow: string
  /** Border tint on the stacked cards */
  cardBorder: string
  /** Floating accent icons with their styles */
  accents: {
    icon: ElementType<LucideProps>
    position: string
    bg: string
    border: string
    text: string
    duration: string
    delay: string
  }[]
}

const VARIANT_CONFIG: Record<EmptyStateVariant, VariantConfig> = {
  default: {
    glow: 'from-violet-500/20 via-primary-500/10 to-cyan-500/10',
    cardBorder: 'border-violet-500/10',
    accents: [
      {
        icon: Sparkles,
        position: '-top-2 -right-3',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        text: 'text-violet-400',
        duration: '3s',
        delay: '0s',
      },
      {
        icon: Layers,
        position: '-bottom-1 -left-3',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-400',
        duration: '3.5s',
        delay: '0.5s',
      },
      {
        icon: Palette,
        position: 'top-0 -left-4',
        bg: 'bg-primary-500/10',
        border: 'border-primary-500/20',
        text: 'text-primary-400',
        duration: '4s',
        delay: '1s',
      },
    ],
  },
  gallery: {
    glow: 'from-cyan-500/20 via-accent-500/10 to-violet-500/10',
    cardBorder: 'border-cyan-500/10',
    accents: [
      {
        icon: ImageIcon,
        position: '-top-2 -right-3',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        text: 'text-violet-400',
        duration: '3s',
        delay: '0s',
      },
      {
        icon: Film,
        position: '-bottom-1 -left-3',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-400',
        duration: '3.5s',
        delay: '0.5s',
      },
      {
        icon: Sparkles,
        position: 'top-0 -left-4',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        duration: '4s',
        delay: '1s',
      },
    ],
  },
  search: {
    glow: 'from-amber-500/20 via-yellow-500/10 to-orange-500/10',
    cardBorder: 'border-amber-500/10',
    accents: [
      {
        icon: Search,
        position: '-top-2 -right-3',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        duration: '3s',
        delay: '0s',
      },
      {
        icon: Sparkles,
        position: '-bottom-1 -left-3',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
        duration: '3.5s',
        delay: '0.5s',
      },
      {
        icon: Layers,
        position: 'top-0 -left-4',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-400',
        duration: '4s',
        delay: '1s',
      },
    ],
  },
  error: {
    glow: 'from-red-500/20 via-rose-500/10 to-red-500/5',
    cardBorder: 'border-red-500/10',
    accents: [
      {
        icon: AlertTriangle,
        position: '-top-2 -right-3',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
        duration: '3s',
        delay: '0s',
      },
      {
        icon: Sparkles,
        position: '-bottom-1 -left-3',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        text: 'text-rose-400',
        duration: '3.5s',
        delay: '0.5s',
      },
      {
        icon: AlertTriangle,
        position: 'top-0 -left-4',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-400',
        duration: '4s',
        delay: '1s',
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface EmptyStateProps {
  /** Main lucide icon displayed in the center of the illustration */
  icon: ElementType<LucideProps>
  /** Heading text */
  title: string
  /** Subtitle / description text */
  description: string
  /** Optional CTA button label */
  actionLabel?: string
  /** Optional link href for the CTA (renders as a Next.js Link) */
  actionHref?: string
  /** Optional click handler for the CTA */
  onAction?: () => void
  /** Visual variant that changes gradient colors and floating icons */
  variant?: EmptyStateVariant
  /** Additional class names on the wrapper */
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant]

  const actionButton = actionLabel ? (
    actionHref ? (
      <Link href={actionHref}>
        <Button variant={variant === 'error' ? 'danger' : 'secondary'} className="mt-5">
          {actionLabel}
        </Button>
      </Link>
    ) : onAction ? (
      <Button
        variant={variant === 'error' ? 'danger' : 'secondary'}
        onClick={onAction}
        className="mt-5"
      >
        {actionLabel}
      </Button>
    ) : null
  ) : null

  return (
    <div className={cn('flex flex-col items-center justify-center py-24', className)}>
      {/* Gradient illustration */}
      <div className="relative mb-6">
        {/* Blurred gradient glow */}
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-br blur-2xl scale-150 opacity-80',
            config.glow
          )}
        />

        {/* Stacked / rotated card shapes */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div
            className={cn(
              'absolute inset-0 rounded-2xl bg-white/[0.03] backdrop-blur-sm border rotate-6',
              config.cardBorder
            )}
          />
          <div
            className={cn(
              'absolute inset-0 rounded-2xl bg-white/[0.03] backdrop-blur-sm border -rotate-3',
              config.cardBorder
            )}
          />
          <div className="relative flex items-center justify-center w-full h-full rounded-2xl bg-nyx-surface border border-nyx-border">
            <Icon className="h-10 w-10 text-gray-600" />
          </div>
        </div>

        {/* Floating accent icons */}
        {config.accents.map((accent, i) => {
          const AccentIcon = accent.icon
          return (
            <div
              key={i}
              className={cn(
                'absolute p-1.5 rounded-lg border animate-bounce',
                accent.position,
                accent.bg,
                accent.border
              )}
              style={{
                animationDuration: accent.duration,
                animationDelay: accent.delay,
              }}
            >
              <AccentIcon className={cn('h-3.5 w-3.5', accent.text)} />
            </div>
          )
        })}
      </div>

      {/* Text content */}
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">{description}</p>

      {/* CTA button */}
      {actionButton}
    </div>
  )
}
