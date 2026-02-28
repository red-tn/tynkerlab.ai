'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
}

export function StatsCard({ title, value, change, changeLabel, icon: Icon, iconColor = 'text-primary-400' }: StatsCardProps) {
  const TrendIcon = change && change > 0 ? TrendingUp : change && change < 0 ? TrendingDown : Minus
  const trendColor = change && change > 0 ? 'text-green-400' : change && change < 0 ? 'text-red-400' : 'text-gray-500'

  return (
    <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{title}</span>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <div className="text-2xl font-bold text-white font-mono">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs', trendColor)}>
          <TrendIcon className="h-3 w-3" />
          <span>{change > 0 ? '+' : ''}{change}%</span>
          {changeLabel && <span className="text-gray-600 ml-1">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
