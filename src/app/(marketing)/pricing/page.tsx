'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { TIERS, CREDIT_PACKS } from '@/lib/stripe/products'
import { PricingToggle } from '@/components/pricing/pricing-toggle'
import { PricingCard } from '@/components/pricing/pricing-card'
import { CreditPackCard } from '@/components/pricing/credit-pack-card'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import type { TierConfig, CreditPack } from '@/types/stripe'

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, profile } = useAuth()
  const router = useRouter()

  const handleTierSelect = async (tier: TierConfig) => {
    if (tier.monthlyPrice === 0) {
      router.push('/signup')
      return
    }

    if (!user) {
      router.push('/login?redirect=/pricing')
      return
    }

    setLoading(true)
    try {
      const priceId = annual ? tier.annualPriceId : tier.monthlyPriceId
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.$id,
          userEmail: user.email,
          mode: 'subscription',
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePackSelect = async (pack: CreditPack) => {
    if (!user) {
      router.push('/login?redirect=/pricing')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: pack.priceId,
          userId: user.$id,
          userEmail: user.email,
          mode: 'payment',
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Start free, scale as you grow. Every plan includes access to all AI models.
          </p>
        </div>

        {/* Toggle */}
        <div className="mb-12">
          <PricingToggle annual={annual} onToggle={setAnnual} />
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              annual={annual}
              onSelect={handleTierSelect}
              currentTier={profile?.subscriptionTier}
              loading={loading}
            />
          ))}
        </div>

        {/* Credit Packs */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Need More Credits?</h2>
          <p className="text-gray-400">Purchase credit packs anytime — they never expire.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {CREDIT_PACKS.map((pack) => (
            <CreditPackCard
              key={pack.id}
              pack={pack}
              onSelect={handlePackSelect}
              loading={loading}
            />
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">FAQ</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="group rounded-lg border border-nyx-border bg-nyx-surface">
                <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                  {q}
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-400">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

const FAQ_ITEMS = [
  {
    q: 'What are credits?',
    a: 'Credits are the currency used to generate images and videos. Different AI models cost different amounts of credits depending on their quality and compute requirements.',
  },
  {
    q: 'Do unused credits roll over?',
    a: 'Monthly subscription credits reset each billing cycle. Credit pack purchases never expire and remain in your account until used.',
  },
  {
    q: 'Can I switch plans?',
    a: 'Yes! You can upgrade or downgrade your plan anytime. Upgrades take effect immediately, and downgrades apply at the end of your current billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards through Stripe, including Visa, Mastercard, American Express, and more.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'If a generation fails, credits are automatically refunded to your account. For subscription refunds, please contact our support team.',
  },
]
