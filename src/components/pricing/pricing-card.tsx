'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import type { TierConfig } from '@/types/stripe'

interface PricingCardProps {
  tier: TierConfig
  annual: boolean
  onSelect: (tier: TierConfig) => void
  currentTier?: string
  loading?: boolean
}

export function PricingCard({ tier, annual, onSelect, currentTier, loading }: PricingCardProps) {
  const price = annual ? tier.annualPrice / 12 : tier.monthlyPrice
  const isCurrent = currentTier === tier.id

  return (
    <div className={cn(
      'relative rounded-2xl border p-6 flex flex-col',
      tier.highlighted
        ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/10'
        : 'border-nyx-border bg-nyx-surface',
    )}>
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="default" className="gradient-primary text-white px-3 py-1 text-xs font-semibold shadow-lg">
            {tier.badge}
          </Badge>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">{tier.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{tier.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-bold text-white">
            ${price === 0 ? '0' : price.toFixed(0)}
          </span>
          <span className="text-gray-500 text-sm mb-1">/month</span>
        </div>
        {annual && tier.annualPrice > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            ${tier.annualPrice}/year billed annually
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className="h-4 w-4 text-primary-400 shrink-0 mt-0.5" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={() => onSelect(tier)}
        disabled={isCurrent || loading}
        variant={tier.highlighted ? 'primary' : 'secondary'}
        className="w-full"
        size="lg"
      >
        {isCurrent ? 'Current Plan' : tier.monthlyPrice === 0 ? 'Get Started' : 'Subscribe'}
      </Button>
    </div>
  )
}
