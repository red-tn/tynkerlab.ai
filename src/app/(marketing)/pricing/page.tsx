'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { TIERS, CREDIT_PACKS } from '@/lib/stripe/products'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { useCredits } from '@/hooks/use-credits'
import { getTierDisplayName } from '@/lib/stripe/products'
import { Button } from '@/components/ui/button'
import {
  Coins,
  Crown,
  Check,
  X,
  TrendingUp,
  Image,
  Video,
  Mic,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TierConfig, CreditPack } from '@/types/stripe'

/* ────────────────────────────────────────────
   Credit Calculator constants
   ──────────────────────────────────────────── */
const CREDIT_COSTS = {
  image: { label: 'HD Images', cost: 15, icon: Image },
  video: { label: 'Video Clips', cost: 120, icon: Video },
  tts: { label: 'TTS Minutes', cost: 8, icon: Mic },
  enhance: { label: 'Prompt Enhances', cost: 2, icon: Sparkles },
} as const

const CALCULATOR_PRESETS = [100, 500, 2000, 5000, 15000]

/* ────────────────────────────────────────────
   Feature comparison matrix
   ──────────────────────────────────────────── */
const COMPARISON_FEATURES: { label: string; free: boolean | string; pro: boolean | string; enterprise: boolean | string }[] = [
  { label: 'Monthly credits', free: '50', pro: '2,000', enterprise: '15,000' },
  { label: 'Daily check-in credits', free: '3', pro: '3', enterprise: '3' },
  { label: 'All 32 image models', free: true, pro: true, enterprise: true },
  { label: 'All 24 video models', free: false, pro: true, enterprise: true },
  { label: 'Max resolution output', free: false, pro: true, enterprise: true },
  { label: 'Text-to-Speech (Kokoro)', free: true, pro: true, enterprise: true },
  { label: 'Premium TTS voices', free: false, pro: true, enterprise: true },
  { label: 'UGC Avatars', free: false, pro: true, enterprise: true },
  { label: 'AI Prompt Enhancement', free: true, pro: true, enterprise: true },
  { label: 'Watermark-free outputs', free: false, pro: true, enterprise: true },
  { label: 'Priority generation queue', free: false, pro: true, enterprise: true },
  { label: 'API access', free: false, pro: false, enterprise: true },
  { label: 'Custom voice catalog', free: false, pro: false, enterprise: true },
  { label: 'Unlimited downloads', free: false, pro: false, enterprise: true },
  { label: 'Dedicated support', free: false, pro: false, enterprise: true },
]

/* ────────────────────────────────────────────
   Page Component
   ──────────────────────────────────────────── */
export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState(false)
  const [calcCredits, setCalcCredits] = useState(500)
  const { user, profile } = useAuth()
  const { balance } = useCredits(user?.id)
  const router = useRouter()
  const tierName = getTierDisplayName(profile?.subscription_tier)

  /* Stripe checkout — subscriptions */
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
          userId: user.id,
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

  /* Stripe checkout — credit packs */
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
          userId: user.id,
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

  /* Calculator derived values */
  const calcResults = useMemo(() => {
    return Object.entries(CREDIT_COSTS).map(([key, info]) => ({
      key,
      label: info.label,
      Icon: info.icon,
      count: Math.floor(calcCredits / info.cost),
    }))
  }, [calcCredits])

  /* Tier order helpers */
  const tierOrder = ['free', 'pro', 'enterprise']
  const currentIdx = tierOrder.indexOf(profile?.subscription_tier || 'free')

  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-20">

        {/* ── User credits bar ── */}
        {user && (
          <div className="mb-8 flex items-center justify-center gap-4 p-3 rounded-xl bg-nyx-surface/80 border border-nyx-border max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary-400" />
              <span className="text-sm text-gray-300">
                <span className="font-semibold text-white">{tierName}</span> Plan
              </span>
            </div>
            <div className="h-4 w-px bg-nyx-border" />
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary-400" />
              <span className="text-sm font-mono text-white">{balance.toLocaleString()}</span>
              <span className="text-sm text-gray-500">credits</span>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Start free, scale as you grow. Every plan includes access to all AI models.
          </p>
        </div>

        {/* ── Annual / Monthly pill toggle ── */}
        <div className="flex items-center justify-center gap-1 mb-14">
          <div className="relative inline-flex items-center rounded-full bg-nyx-surface border border-nyx-border p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200',
                !annual ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200',
                annual ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              Annual
            </button>
            {/* Sliding pill indicator */}
            <div
              className={cn(
                'absolute top-1 h-[calc(100%-8px)] rounded-full gradient-primary transition-all duration-300 ease-out',
                annual ? 'left-[calc(50%)] w-[calc(50%-4px)]' : 'left-1 w-[calc(50%-4px)]'
              )}
            />
          </div>
          <span
            className={cn(
              'ml-3 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300',
              annual
                ? 'bg-green-400/15 text-green-400 border border-green-400/20'
                : 'bg-green-400/5 text-green-400/40 border border-green-400/10'
            )}
          >
            Save 25%
          </span>
        </div>

        {/* ── Tier Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 pt-6 items-start overflow-visible">
          {TIERS.map((tier) => {
            const price = annual ? tier.annualPrice / 12 : tier.monthlyPrice
            const isCurrent = profile?.subscription_tier === tier.id
            const thisIdx = tierOrder.indexOf(tier.id)
            const isUpgrade = thisIdx > currentIdx
            const annualSavings = tier.monthlyPrice > 0
              ? Math.round((1 - tier.annualPrice / (tier.monthlyPrice * 12)) * 100)
              : 0

            return (
              <div
                key={tier.id}
                className={cn(
                  'relative rounded-2xl p-[1px] transition-transform duration-300',
                  tier.highlighted && !isCurrent && 'md:scale-105 md:z-10',
                  isCurrent && 'md:scale-105 md:z-10'
                )}
              >
                {/* Gradient border glow for highlighted / current */}
                {(tier.highlighted || isCurrent) && (
                  <div className="absolute inset-0 rounded-2xl gradient-primary opacity-60 blur-sm" />
                )}

                <div
                  className={cn(
                    'relative rounded-2xl border p-7 flex flex-col h-full',
                    isCurrent
                      ? 'border-primary-500/50 bg-gradient-to-b from-primary-500/10 via-nyx-surface to-nyx-surface'
                      : tier.highlighted
                        ? 'border-primary-500/40 bg-gradient-to-b from-primary-500/8 via-nyx-surface to-nyx-surface'
                        : 'border-nyx-border bg-gradient-to-b from-white/[0.03] to-nyx-surface'
                  )}
                >
                  {/* Badge */}
                  {isCurrent ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center rounded-full bg-[#0a0a0f] px-3 py-1 text-xs font-semibold shadow-lg border border-green-500/40 text-green-400">
                        <Crown className="h-3 w-3 mr-1" /> Your Plan
                      </span>
                    </div>
                  ) : tier.badge ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center rounded-full gradient-primary text-white px-4 py-1 text-xs font-bold shadow-lg shadow-primary-500/25">
                        <Zap className="h-3 w-3 mr-1" />
                        {tier.badge}
                      </span>
                    </div>
                  ) : null}

                  {/* Tier name & description */}
                  <div className="mb-6 pt-1">
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-end gap-1.5">
                      <span className="text-5xl font-extrabold text-white tracking-tight">
                        ${price === 0 ? '0' : price.toFixed(0)}
                      </span>
                      <span className="text-gray-500 text-base mb-1.5">/mo</span>
                    </div>
                    {annual && tier.annualPrice > 0 && (
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs text-gray-500">
                          ${tier.annualPrice}/yr billed annually
                        </p>
                        <p className="text-xs text-green-400 font-medium">
                          Save {annualSavings}% vs monthly
                        </p>
                      </div>
                    )}
                    {!annual && tier.monthlyPrice > 0 && annualSavings > 0 && (
                      <p className="text-xs text-primary-400 mt-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Switch to annual — save {annualSavings}%
                      </p>
                    )}
                    {tier.monthlyPrice === 0 && (
                      <p className="text-xs text-gray-500 mt-2">Free forever</p>
                    )}
                  </div>

                  {/* Credits highlight */}
                  <div className="flex items-center gap-2 mb-6 px-3 py-2.5 rounded-lg bg-primary-500/5 border border-primary-500/10">
                    <Coins className="h-4 w-4 text-primary-400" />
                    <span className="text-sm font-semibold text-white">{tier.credits.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">credits / month</span>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <div className="shrink-0 mt-0.5 h-4 w-4 rounded-full bg-primary-500/10 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-400" />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => handleTierSelect(tier)}
                    disabled={isCurrent || loading}
                    variant={isCurrent ? 'secondary' : tier.highlighted ? 'primary' : 'secondary'}
                    className={cn(
                      'w-full',
                      tier.highlighted && !isCurrent && 'shadow-lg shadow-primary-500/20'
                    )}
                    size="lg"
                  >
                    {isCurrent
                      ? 'Current Plan'
                      : isUpgrade
                        ? `Upgrade to ${tier.name}`
                        : tier.monthlyPrice === 0
                          ? 'Get Started Free'
                          : 'Subscribe'}
                  </Button>

                  {isUpgrade && !isCurrent && (
                    <p className="text-[10px] text-center text-primary-400/70 mt-2">
                      Upgrade takes effect immediately
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Trust badge ── */}
        <div className="flex justify-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            No charge for failed generations — credits auto-refund on errors
          </div>
        </div>

        {/* ── Feature Comparison Matrix ── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Compare Plans
            </h2>
            <p className="text-gray-400">See exactly what each tier includes.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-nyx-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-nyx-border bg-nyx-surface">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium min-w-[220px]">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium w-[140px]">Free</th>
                  <th className="text-center py-4 px-4 font-medium w-[140px]">
                    <span className="gradient-text font-bold">Creator</span>
                  </th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium w-[140px]">Pro Creator</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr
                    key={row.label}
                    className={cn(
                      'border-b border-nyx-border/50 transition-colors hover:bg-white/[0.02]',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
                    )}
                  >
                    <td className="py-3.5 px-6 text-gray-300">{row.label}</td>
                    {(['free', 'pro', 'enterprise'] as const).map((tierId) => {
                      const val = row[tierId]
                      return (
                        <td key={tierId} className="py-3.5 px-4 text-center">
                          {typeof val === 'string' ? (
                            <span className={cn(
                              'text-sm font-semibold',
                              tierId === 'pro' ? 'text-primary-400' : 'text-white'
                            )}>
                              {val}
                            </span>
                          ) : val ? (
                            <Check className="h-4 w-4 text-primary-400 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-gray-600 mx-auto" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Credit Calculator ── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              What Can You Create?
            </h2>
            <p className="text-gray-400">
              See how far your credits go across different generation types.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-2xl border border-nyx-border bg-gradient-to-b from-white/[0.03] to-nyx-surface p-8">
            {/* Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {CALCULATOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCalcCredits(preset)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                    calcCredits === preset
                      ? 'gradient-primary text-white border-transparent shadow-lg shadow-primary-500/20'
                      : 'border-nyx-border text-gray-400 hover:text-white hover:border-nyx-border-bright bg-nyx-surface'
                  )}
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Credits</span>
                <span className="text-lg font-bold text-white font-mono">
                  {calcCredits.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={15000}
                step={50}
                value={calcCredits}
                onChange={(e) => setCalcCredits(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-nyx-border accent-primary-500
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-400
                  [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary-500/30
                  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>50</span>
                <span>15,000</span>
              </div>
            </div>

            {/* Results grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {calcResults.map(({ key, label, Icon, count }) => (
                <div
                  key={key}
                  className="rounded-xl border border-nyx-border bg-nyx-surface/80 p-4 text-center"
                >
                  <Icon className="h-6 w-6 text-primary-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white mb-0.5">
                    ~{count.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-600 text-center mt-4">
              Estimates based on average credit costs. Actual costs vary by model and settings.
            </p>
          </div>
        </div>

        {/* ── Credit Packs ── */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Need More Credits?</h2>
          <p className="text-gray-400">Purchase credit packs anytime — they never expire.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {CREDIT_PACKS.map((pack) => {
            const pricePerCredit = (pack.price / pack.credits * 100).toFixed(1)
            return (
              <div
                key={pack.id}
                className="rounded-xl border border-nyx-border bg-gradient-to-b from-white/[0.03] to-nyx-surface p-5 flex flex-col transition-all duration-200 hover:border-nyx-border-bright hover:shadow-lg hover:shadow-primary-500/5"
              >
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
                  onClick={() => handlePackSelect(pack)}
                  disabled={loading}
                  variant="secondary"
                  className="w-full mt-auto"
                >
                  Buy for ${pack.price}
                </Button>
              </div>
            )
          })}
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-medium hover:bg-white/[0.02] transition-colors">
                  {q}
                  <span className="text-gray-500 group-open:rotate-45 transition-transform duration-200 text-xl ml-4 shrink-0">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

/* ────────────────────────────────────────────
   FAQ data
   ──────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: 'What are credits?',
    a: 'Credits are the currency used to generate images and videos. Different AI models cost different amounts of credits depending on their quality and compute requirements.',
  },
  {
    q: 'What can free users access?',
    a: 'Free users can generate images with all 32 image models, use Templates, and use Kokoro TTS. Outputs include a small watermark. Video generation (24 models), premium TTS voices, and UGC Avatars require a Creator or Pro Creator plan. Free users earn 3 credits daily via check-in.',
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
