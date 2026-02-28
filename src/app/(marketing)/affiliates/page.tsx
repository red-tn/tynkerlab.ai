'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import {
  DollarSign, Link2, Share2, TrendingUp, Cookie, BarChart3,
  Infinity, ArrowRight, CheckCircle2
} from 'lucide-react'

const STEPS = [
  { icon: CheckCircle2, title: 'Sign Up Free', desc: 'Create your affiliate account in under a minute. No fees, no commitments.' },
  { icon: Link2, title: 'Get Your Link', desc: 'Receive a unique referral URL to share with your audience.' },
  { icon: DollarSign, title: 'Share & Earn', desc: 'Earn 10% commission on every sale from your referrals — forever.' },
]

const BENEFITS = [
  { icon: TrendingUp, title: 'Recurring Revenue', desc: 'Earn on subscription renewals, not just first purchases. Your income grows over time.' },
  { icon: Cookie, title: '30-Day Cookie', desc: 'Referrals have 30 days to complete their purchase and you still get credit.' },
  { icon: BarChart3, title: 'Real-Time Dashboard', desc: 'Track clicks, signups, conversions, and earnings with instant reporting.' },
  { icon: Infinity, title: 'No Cap on Earnings', desc: 'There is no maximum. The more you refer, the more you earn.' },
]

const PRODUCTS = [
  { name: 'Pro Monthly', price: '$20/mo', commission: '$24/yr', note: '$2/mo recurring' },
  { name: 'Pro Annual', price: '$192/yr', commission: '$19.20/yr', note: 'Paid upfront' },
  { name: 'Enterprise Monthly', price: '$99/mo', commission: '$118.80/yr', note: '$9.90/mo recurring' },
  { name: 'Enterprise Annual', price: '$948/yr', commission: '$94.80/yr', note: 'Paid upfront' },
  { name: 'Credit Packs', price: '$5–$125', commission: '$0.50–$12.50 each', note: 'Per purchase' },
]

const FAQ = [
  { q: 'How do I get paid?', a: 'Once your pending balance reaches $25, you can request a payout. Payments are processed via bank transfer or PayPal within 5 business days.' },
  { q: 'Is there a cost to join?', a: 'No. The affiliate program is completely free to join with no hidden fees or requirements.' },
  { q: 'Do I earn on renewals?', a: 'Yes! You earn 10% on every recurring subscription payment, not just the first one. As long as your referral stays subscribed, you keep earning.' },
  { q: 'What counts as a valid referral?', a: 'Any new user who signs up through your unique link and makes a purchase within 30 days of clicking your link.' },
  { q: 'Can I promote on social media?', a: 'Absolutely. You can share your link on social media, blogs, YouTube, email newsletters, or anywhere you have an audience.' },
  { q: 'What if someone clears their cookies?', a: 'If the cookie is cleared before purchase, the referral won\'t be tracked. We use a 30-day first-click attribution model.' },
]

export default function AffiliatesPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-6">
            <DollarSign className="h-4 w-4" />
            Affiliate Program
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Earn <span className="gradient-text">10% Commission</span> on Every Sale
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Join the Tynkerlab.ai affiliate program and earn recurring revenue by sharing AI-powered creative tools with your audience. Simple, transparent, and profitable.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href={isAuthenticated ? '/dashboard/affiliates' : '/signup'}>
              <Button size="lg" variant="primary">
                Join Now — It&apos;s Free <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">How It Works</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Three simple steps to start earning</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative bg-nyx-surface border border-nyx-border rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 mb-4">
                <step.icon className="h-6 w-6 text-primary-400" />
              </div>
              <div className="absolute top-4 left-4 text-4xl font-bold text-white/5">{i + 1}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commission Structure */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Commission Structure</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Earn 10% on every product, every renewal</p>
        <div className="bg-nyx-surface border border-nyx-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-nyx-border">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Product</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Price</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Your Commission</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => (
                <tr key={p.name} className="border-b border-nyx-border/50 last:border-0">
                  <td className="px-6 py-4 text-sm text-white font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{p.price}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-primary-400 font-semibold">{p.commission}</span>
                    {p.note && <span className="block text-xs text-gray-500 mt-0.5">{p.note}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Example Earnings */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Example: 10 Affiliates</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">See how quickly your earnings can grow with just 10 referrals</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-nyx-surface border border-nyx-border rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">10 Pro Monthly Referrals</p>
            <p className="text-3xl font-bold gradient-text mb-1">$240/yr</p>
            <p className="text-xs text-gray-500">$20/mo recurring from each referral</p>
          </div>
          <div className="bg-nyx-surface border border-primary-500/30 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">10 Enterprise Monthly Referrals</p>
            <p className="text-3xl font-bold gradient-text mb-1">$1,188/yr</p>
            <p className="text-xs text-gray-500">$99/mo recurring from each referral</p>
          </div>
          <div className="bg-nyx-surface border border-nyx-border rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Mix: 5 Pro + 5 Enterprise</p>
            <p className="text-3xl font-bold gradient-text mb-1">$714/yr</p>
            <p className="text-xs text-gray-500">Blended recurring income</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Why Join?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-nyx-surface border border-nyx-border rounded-xl p-6 flex gap-4">
              <div className="shrink-0 p-3 rounded-lg bg-primary-500/10 h-fit">
                <b.icon className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{b.title}</h3>
                <p className="text-sm text-gray-400">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-lg border border-nyx-border bg-nyx-surface">
              <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                {q}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-primary-900/40 via-nyx-surface to-accent-900/20 border border-nyx-border rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join hundreds of creators and marketers earning recurring income with Tynkerlab.ai.
          </p>
          <Link href={isAuthenticated ? '/dashboard/affiliates' : '/signup'}>
            <Button size="lg" variant="primary">
              Become an Affiliate <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
