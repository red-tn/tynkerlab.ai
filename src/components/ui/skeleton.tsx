'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-nyx-border',
        {
          'h-4 w-full rounded': variant === 'text',
          'rounded-full': variant === 'circular',
          'rounded-lg': variant === 'rectangular',
        },
        className
      )}
    >
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          backgroundImage:
            'linear-gradient(110deg, transparent 25%, rgba(139,92,246,0.08) 37%, rgba(6,182,212,0.12) 50%, rgba(139,92,246,0.08) 63%, transparent 75%)',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   SkeletonCard — Matches the generation card layout
   (image area with natural aspect ratio + text lines below)
   ──────────────────────────────────────────────────────────── */

interface SkeletonCardProps {
  className?: string
  /** Tailwind aspect-ratio class, e.g. "aspect-square" or "aspect-[3/4]" */
  aspect?: string
}

export function SkeletonCard({ className, aspect = 'aspect-[4/3]' }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-nyx-border bg-nyx-surface/80 overflow-hidden',
        className
      )}
    >
      {/* Image placeholder */}
      <Skeleton
        variant="rectangular"
        className={cn('w-full rounded-none', aspect)}
      />
      {/* Text lines */}
      <div className="p-3 space-y-2.5">
        <Skeleton className="h-3.5 w-[85%] rounded" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   SkeletonGrid — A masonry-style grid of SkeletonCards
   ──────────────────────────────────────────────────────────── */

interface SkeletonGridProps {
  /** Number of skeleton cards to render (default: 8) */
  count?: number
  className?: string
}

const ASPECT_CYCLE = [
  'aspect-[3/4]',
  'aspect-square',
  'aspect-[4/3]',
  'aspect-[3/4]',
  'aspect-[4/3]',
  'aspect-square',
  'aspect-[3/4]',
  'aspect-[4/3]',
]

export function SkeletonGrid({ count = 8, className }: SkeletonGridProps) {
  return (
    <div
      className={cn(
        'columns-2 lg:columns-3 gap-4 [column-fill:_balance]',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard
          key={i}
          aspect={ASPECT_CYCLE[i % ASPECT_CYCLE.length]}
          className="break-inside-avoid mb-4"
        />
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   SkeletonStudioPanel — Matches studio control panel layout
   (label + input pairs stacked vertically)
   ──────────────────────────────────────────────────────────── */

interface SkeletonStudioPanelProps {
  /** Number of label+input pairs (default: 5) */
  rows?: number
  className?: string
}

export function SkeletonStudioPanel({ rows = 5, className }: SkeletonStudioPanelProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-nyx-border bg-nyx-surface/80 p-5 space-y-5',
        className
      )}
    >
      {/* Panel header */}
      <div className="flex items-center gap-2">
        <Skeleton variant="rectangular" className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-32 rounded" />
      </div>

      {/* Label + input rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton
            variant="rectangular"
            className={cn(
              'w-full rounded-lg',
              i === 0 ? 'h-10' : i === 1 ? 'h-24' : 'h-10'
            )}
          />
        </div>
      ))}

      {/* Action button placeholder */}
      <Skeleton
        variant="rectangular"
        className="h-11 w-full rounded-lg"
      />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   SkeletonStats — Row of stat cards (admin dashboard style)
   ──────────────────────────────────────────────────────────── */

interface SkeletonStatsProps {
  /** Number of stat cards (default: 4) */
  count?: number
  className?: string
}

export function SkeletonStats({ count = 4, className }: SkeletonStatsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-nyx-border bg-nyx-surface/80 p-4"
        >
          <div className="flex items-center gap-3">
            {/* Icon placeholder */}
            <Skeleton
              variant="rectangular"
              className="h-10 w-10 shrink-0 rounded-lg"
            />
            <div className="flex-1 space-y-2">
              {/* Label */}
              <Skeleton className="h-2.5 w-16 rounded" />
              {/* Value */}
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
