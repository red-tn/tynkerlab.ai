'use client'

import { useState, useEffect } from 'react'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/client'
import { Query } from 'appwrite'
import { StatsCard } from '@/components/admin/stats-card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react'

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, [
          Query.orderDesc('$createdAt'),
          Query.limit(50),
        ])
        setSubscriptions(result.documents)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const active = subscriptions.filter(s => s.status === 'active')
  const canceled = subscriptions.filter(s => s.status === 'canceled')
  const proCount = active.filter(s => s.tier === 'pro').length
  const enterpriseCount = active.filter(s => s.tier === 'enterprise').length
  const mrr = proCount * 20 + enterpriseCount * 99

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-sm text-gray-400 mt-1">Revenue and subscription management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Subs" value={active.length} icon={CreditCard} />
        <StatsCard title="MRR" value={formatCurrency(mrr)} icon={DollarSign} iconColor="text-green-400" />
        <StatsCard title="Churn Rate" value={`${subscriptions.length > 0 ? (canceled.length / subscriptions.length * 100).toFixed(1) : 0}%`} icon={TrendingUp} iconColor="text-orange-400" />
        <StatsCard title="Pro / Enterprise" value={`${proCount} / ${enterpriseCount}`} icon={Users} iconColor="text-accent-400" />
      </div>

      <div className="rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nyx-border bg-nyx-bg/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Period End</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : subscriptions.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No subscriptions yet</td></tr>
            ) : subscriptions.map((sub) => (
              <tr key={sub.$id} className="border-b border-nyx-border last:border-0 hover:bg-white/[.02]">
                <td className="px-4 py-3 text-white">{sub.userId}</td>
                <td className="px-4 py-3">
                  <Badge variant={sub.tier === 'pro' ? 'success' : sub.tier === 'enterprise' ? 'info' : 'default'}>
                    {sub.tier}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={sub.status === 'active' ? 'success' : sub.status === 'past_due' ? 'warning' : 'error'}>
                    {sub.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : '-'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(sub.$createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
