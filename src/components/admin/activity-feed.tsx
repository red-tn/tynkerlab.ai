'use client'

import { formatDate } from '@/lib/utils'
import { User, Image, Video, CreditCard, Coins } from 'lucide-react'

export type ActivityItem = {
  id: string
  type: 'signup' | 'generation' | 'subscription' | 'credits'
  message: string
  timestamp: string
}

const ICONS: Record<ActivityItem['type'], typeof User> = {
  signup: User,
  generation: Image,
  subscription: CreditCard,
  credits: Coins,
}

const COLORS: Record<ActivityItem['type'], string> = {
  signup: 'text-green-400',
  generation: 'text-primary-400',
  subscription: 'text-accent-400',
  credits: 'text-yellow-400',
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
        <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {items.map((item) => {
          const Icon = ICONS[item.type]
          const color = COLORS[item.type]
          return (
            <div key={item.id} className="flex items-start gap-3 text-sm">
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-gray-300 truncate">{item.message}</p>
                <p className="text-xs text-gray-600">{formatDate(item.timestamp)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
