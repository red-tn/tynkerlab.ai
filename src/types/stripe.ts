export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

export interface TierConfig {
  id: SubscriptionTier
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  monthlyPriceId: string
  annualPriceId: string
  credits: number
  features: string[]
  highlighted?: boolean
  badge?: string
}

export interface CreditPack {
  id: string
  name: string
  credits: number
  price: number
  priceId: string
  savings?: string
}

export interface CheckoutSession {
  sessionId: string
  url: string
}
