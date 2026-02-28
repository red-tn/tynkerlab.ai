'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Link2, Copy, Check, MousePointerClick, UserPlus, DollarSign,
  TrendingUp, ArrowRight, Sparkles, Clock
} from 'lucide-react'

export default function AffiliateDashboardPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [affiliate, setAffiliate] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [copied, setCopied] = useState(false)

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/affiliates?userId=${user.$id}`)
      if (res.ok) {
        const data = await res.json()
        setEnrolled(data.enrolled)
        setAffiliate(data.affiliate || null)
        setEvents(data.events || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData() }, [user?.$id])

  const handleEnroll = async () => {
    if (!user) return
    setEnrolling(true)
    try {
      const res = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.$id }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || 'Failed to enroll. Try again.', 'error')
        return
      }
      if (data.enrolled) {
        setEnrolled(true)
        setAffiliate(data.affiliate)
        addToast('You are now a Tynkerlab.ai affiliate!')
      }
    } catch (err) {
      addToast('Failed to enroll. Try again.', 'error')
    } finally {
      setEnrolling(false)
    }
  }

  const referralLink = affiliate ? `https://tynkerlab.ai/?ref=${affiliate.code}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    addToast('Referral link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-nyx-surface animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-nyx-surface animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Not enrolled — enrollment CTA
  if (!enrolled) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="relative overflow-hidden rounded-2xl border border-nyx-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-nyx-surface to-accent-900/20" />
          <div className="relative text-center p-12">
            <div className="inline-flex p-4 rounded-2xl bg-primary-500/10 ring-1 ring-primary-500/20 mb-6">
              <DollarSign className="h-10 w-10 text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Become an Affiliate</h1>
            <p className="text-gray-400 mb-2">Earn 10% recurring commission on every sale you refer.</p>
            <p className="text-sm text-gray-500 mb-8">Free to join. No minimum requirements. Start earning today.</p>
            <Button variant="primary" size="lg" loading={enrolling} onClick={handleEnroll}>
              <Sparkles className="h-5 w-5 mr-2" /> Join the Affiliate Program
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Enrolled — dashboard
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Affiliate Dashboard</h1>
        <p className="text-sm text-gray-400">Track your referrals, earnings, and payouts</p>
      </div>

      {/* Referral Link */}
      <div className="bg-nyx-surface border border-nyx-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-5 w-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">Your Referral Link</h2>
        </div>
        <div className="flex gap-2">
          <input
            readOnly
            value={referralLink}
            className="flex-1 px-4 py-2.5 rounded-lg bg-nyx-bg border border-nyx-border text-sm text-white font-mono"
          />
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Share this link to earn 10% commission on every sale. 30-day cookie window.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks', value: affiliate.totalClicks || 0, icon: MousePointerClick, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Signups', value: affiliate.totalSignups || 0, icon: UserPlus, color: 'text-accent-400', bg: 'bg-accent-500/10' },
          { label: 'Conversions', value: affiliate.totalConversions || 0, icon: TrendingUp, color: 'text-primary-300', bg: 'bg-primary-500/10' },
          { label: 'Pending Earnings', value: `$${(affiliate.pendingBalance || 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-nyx-surface/80 border border-nyx-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payout Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-nyx-surface border border-nyx-border rounded-xl p-5">
          <p className="text-sm text-gray-400">Total Earned</p>
          <p className="text-2xl font-bold text-white">${(affiliate.totalEarnings || 0).toFixed(2)}</p>
        </div>
        <div className="bg-nyx-surface border border-nyx-border rounded-xl p-5">
          <p className="text-sm text-gray-400">Pending Balance</p>
          <p className="text-2xl font-bold text-primary-400">${(affiliate.pendingBalance || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Min. payout: $25.00</p>
        </div>
        <div className="bg-nyx-surface border border-nyx-border rounded-xl p-5">
          <p className="text-sm text-gray-400">Total Paid Out</p>
          <p className="text-2xl font-bold text-green-400">${(affiliate.paidOut || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Events */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        {events.length === 0 ? (
          <div className="bg-nyx-surface border border-nyx-border rounded-xl p-8 text-center">
            <p className="text-gray-500">No activity yet. Share your referral link to get started!</p>
          </div>
        ) : (
          <div className="bg-nyx-surface border border-nyx-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nyx-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Commission</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: any) => (
                  <tr key={event.$id} className="border-b border-nyx-border/50 last:border-0">
                    <td className="px-4 py-3">
                      <Badge variant={event.type === 'commission' ? 'success' : event.type === 'payout' ? 'warning' : 'default'}>
                        {event.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {event.commission > 0 ? (
                        <span className={event.type === 'payout' ? 'text-red-400' : 'text-green-400'}>
                          {event.type === 'payout' ? '-' : '+'}${event.commission.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
