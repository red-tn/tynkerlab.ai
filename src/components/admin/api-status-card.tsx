'use client'

import { cn } from '@/lib/utils'

interface ApiStatusCardProps {
  title: string
  value: string | number
  unit?: string
  status: 'healthy' | 'warning' | 'critical'
}

const STATUS_COLORS = {
  healthy: 'border-green-500/30 bg-green-500/5',
  warning: 'border-yellow-500/30 bg-yellow-500/5',
  critical: 'border-red-500/30 bg-red-500/5',
}

const DOT_COLORS = {
  healthy: 'bg-green-400',
  warning: 'bg-yellow-400',
  critical: 'bg-red-400',
}

export function ApiStatusCard({ title, value, unit, status }: ApiStatusCardProps) {
  return (
    <div className={cn('rounded-xl border p-4', STATUS_COLORS[status])}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('h-2 w-2 rounded-full animate-pulse', DOT_COLORS[status])} />
        <span className="text-xs text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-white font-mono">{value}</span>
        {unit && <span className="text-sm text-gray-500 mb-0.5">{unit}</span>}
      </div>
    </div>
  )
}
