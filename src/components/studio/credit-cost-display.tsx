'use client'

import { cn } from '@/lib/utils'
import { Coins, AlertTriangle } from 'lucide-react'

interface CreditCostDisplayProps {
  cost: number
  balance: number
  className?: string
}

export function CreditCostDisplay({ cost, balance, className }: CreditCostDisplayProps) {
  const hasEnough = balance >= cost
  const remaining = balance - cost

  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-lg border',
      hasEnough ? 'border-nyx-border bg-nyx-surface' : 'border-error/30 bg-error/5',
      className
    )}>
      <div className="flex items-center gap-2">
        <Coins className={cn('h-5 w-5', hasEnough ? 'text-primary-400' : 'text-error')} />
        <div>
          <span className={cn('text-sm font-medium', hasEnough ? 'text-white' : 'text-error')}>{cost} credits</span>
          <span className="text-xs text-gray-500 ml-2">({balance} available)</span>
        </div>
      </div>
      {!hasEnough && (
        <div className="flex items-center gap-1.5 text-error">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">Need {Math.abs(remaining)} more</span>
        </div>
      )}
    </div>
  )
}
