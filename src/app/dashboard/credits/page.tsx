'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Coins, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'generations', label: 'Generations' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'adjustments', label: 'Adjustments' },
  { key: 'refunds', label: 'Refunds' },
]

const TYPE_BADGES: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  generation_debit: { label: 'Generation', variant: 'default' },
  credit_purchase: { label: 'Purchase', variant: 'success' },
  subscription_credit: { label: 'Subscription', variant: 'success' },
  admin_adjustment: { label: 'Adjustment', variant: 'warning' },
  refund: { label: 'Refund', variant: 'success' },
}

interface Transaction {
  $id: string
  $createdAt: string
  amount: number
  type: string
  description: string
  balanceAfter?: number
}

export default function CreditsPage() {
  const { user } = useAuth()
  const { balance } = useCredits(user?.$id)
  const [filter, setFilter] = useState('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.ceil(total / 20)

  useEffect(() => {
    if (!user?.$id) return
    setLoading(true)
    const params = new URLSearchParams({
      userId: user.$id,
      page: page.toString(),
      limit: '20',
    })
    if (filter !== 'all') params.set('type', filter)

    fetch(`/api/credits/history?${params}`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || [])
        setTotal(data.total || 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.$id, filter, page])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Credits</h1>
          <p className="text-sm text-gray-400">Your credit balance and transaction history</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary-900/40 via-nyx-surface to-accent-900/20 border border-nyx-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <Coins className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Balance</p>
              <p className="text-3xl font-bold text-white font-mono">{balance.toLocaleString()}</p>
            </div>
          </div>
          <Link href="/pricing#packs">
            <Button variant="primary">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(0) }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              filter === f.key
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction History Table */}
      <div className="bg-nyx-surface border border-nyx-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nyx-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Balance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-5 bg-nyx-bg rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map(tx => {
                const badge = TYPE_BADGES[tx.type] || { label: tx.type, variant: 'default' as const }
                return (
                  <tr key={tx.$id} className="border-b border-nyx-border/50 last:border-0">
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(tx.$createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 max-w-[200px] truncate">
                      {tx.description}
                    </td>
                    <td className={cn(
                      'px-4 py-3 text-sm font-mono text-right whitespace-nowrap',
                      tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-gray-400 whitespace-nowrap">
                      {tx.balanceAfter != null ? tx.balanceAfter.toLocaleString() : '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-400">Page {page + 1} of {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
