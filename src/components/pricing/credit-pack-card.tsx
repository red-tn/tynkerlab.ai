'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Coins } from 'lucide-react'
import type { CreditPack } from '@/types/stripe'

interface CreditPackCardProps {
  pack: CreditPack
  onSelect: (pack: CreditPack) => void
  loading?: boolean
}

export function CreditPackCard({ pack, onSelect, loading }: CreditPackCardProps) {
  const pricePerCredit = (pack.price / pack.credits * 100).toFixed(1)

  return (
    <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{pack.name}</h3>
        {pack.savings && (
          <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
            {pack.savings}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Coins className="h-5 w-5 text-primary-400" />
        <span className="text-2xl font-bold text-white">{pack.credits.toLocaleString()}</span>
        <span className="text-sm text-gray-500">credits</span>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        {pricePerCredit}c per credit
      </p>

      <Button
        onClick={() => onSelect(pack)}
        disabled={loading}
        variant="secondary"
        className="w-full mt-auto"
      >
        Buy for ${pack.price}
      </Button>
    </div>
  )
}
