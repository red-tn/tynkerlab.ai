import type { TierConfig, CreditPack } from '@/types/stripe'

export const TIERS: TierConfig[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with AI generation',
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyPriceId: '',
    annualPriceId: '',
    credits: 50,
    features: [
      '50 credits / month',
      'All image models',
      'Standard resolution',
      'Text-to-Speech (Kokoro)',
      'AI Prompt Enhancement',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Creator',
    description: 'For serious creators who want more',
    monthlyPrice: 20,
    annualPrice: 120,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID || '',
    credits: 2000,
    features: [
      '2,000 credits / month',
      'All image & video models',
      'Max resolution',
      'All TTS voices',
      'AI Prompt Enhancement',
      'Priority generation',
      'No watermark',
      'Priority support',
    ],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'enterprise',
    name: 'Pro Creator',
    description: 'For high-volume creators who never want to stop',
    monthlyPrice: 99,
    annualPrice: 588,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || '',
    credits: 15000,
    features: [
      '15,000 credits / month',
      'All image & video models',
      'Max resolution',
      'All TTS voices',
      'AI Prompt Enhancement',
      'Priority generation',
      'No watermark',
      'API access',
      'Custom voice catalog',
      'Unlimited downloads',
      'Dedicated support',
    ],
  },
]

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'pack-100',
    name: 'Starter',
    credits: 100,
    price: 5,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PACK_100_PRICE_ID || '',
  },
  {
    id: 'pack-500',
    name: 'Creator',
    credits: 500,
    price: 20,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PACK_500_PRICE_ID || '',
    savings: 'Save 20%',
  },
  {
    id: 'pack-2000',
    name: 'Professional',
    credits: 2000,
    price: 60,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PACK_2000_PRICE_ID || '',
    savings: 'Save 40%',
  },
  {
    id: 'pack-5000',
    name: 'Studio',
    credits: 5000,
    price: 125,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PACK_5000_PRICE_ID || '',
    savings: 'Save 50%',
  },
]

export function getTierByPriceId(priceId: string): TierConfig | undefined {
  return TIERS.find(t => t.monthlyPriceId === priceId || t.annualPriceId === priceId)
}

export function getPackByPriceId(priceId: string): CreditPack | undefined {
  return CREDIT_PACKS.find(p => p.priceId === priceId)
}

export function getTierDisplayName(tierId?: string): string {
  const tier = TIERS.find(t => t.id === tierId)
  return tier?.name || 'Free'
}
