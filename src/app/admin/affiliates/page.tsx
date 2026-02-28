'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import {
  Users, DollarSign, TrendingUp, Clock, AlertCircle,
  CheckCircle, XCircle, Banknote
} from 'lucide-react'

export default function AdminAffiliatesPage() {
  const { addToast } = useToast()
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [stats, setStats] = useState({ totalEarnings: 0, totalPending: 0, activeCount: 0 })
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [payoutTarget, setPayoutTarget] = useState<any>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/affiliates')
      if (res.ok) {
        const data = await res.json()
        setAffiliates(data.affiliates)
        setTotal(data.total)
        setStats(data.stats)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleStatusChange = async (affiliateId: string, status: string) => {
    setActionLoading(true)
    try {
      await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId, status }),
      })
      addToast(`Affiliate status set to ${status}`)
      fetchData()
    } catch (err) {
      addToast('Failed to update', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePayout = async () => {
    if (!payoutTarget) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId: payoutTarget.$id, action: 'payout' }),
      })
      const data = await res.json()
      if (data.success) {
        addToast(`Payout of $${data.amount.toFixed(2)} processed`)
      } else {
        addToast(data.error || 'Payout failed', 'error')
      }
      setPayoutTarget(null)
      fetchData()
    } catch (err) {
      addToast('Failed to process payout', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Affiliates</h1>
        <p className="text-sm text-gray-400">{total} total affiliates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Affiliates', value: total, icon: Users, color: 'text-primary-400' },
          { label: 'Active', value: stats.activeCount, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Total Commissions', value: `$${stats.totalEarnings.toFixed(2)}`, icon: TrendingUp, color: 'text-accent-400' },
          { label: 'Pending Payouts', value: `$${stats.totalPending.toFixed(2)}`, icon: DollarSign, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-nyx-surface border border-nyx-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-nyx-surface animate-pulse" />
          ))}
        </div>
      ) : affiliates.length === 0 ? (
        <div className="bg-nyx-surface border border-nyx-border rounded-xl p-8 text-center">
          <p className="text-gray-500">No affiliates yet.</p>
        </div>
      ) : (
        <div className="bg-nyx-surface border border-nyx-border rounded-xl overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-nyx-border">
                {['User ID', 'Code', 'Status', 'Clicks', 'Signups', 'Conversions', 'Earnings', 'Pending', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a: any) => (
                <tr key={a.$id} className="border-b border-nyx-border/50 last:border-0 hover:bg-nyx-surface-hover/50">
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">{a.userId?.slice(0, 12)}...</td>
                  <td className="px-4 py-3 text-sm text-primary-400 font-mono">{a.code}</td>
                  <td className="px-4 py-3">
                    <Badge variant={a.status === 'active' ? 'success' : a.status === 'suspended' ? 'error' : 'warning'}>
                      {a.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{a.totalClicks || 0}</td>
                  <td className="px-4 py-3 text-sm text-white">{a.totalSignups || 0}</td>
                  <td className="px-4 py-3 text-sm text-white">{a.totalConversions || 0}</td>
                  <td className="px-4 py-3 text-sm text-green-400 font-mono">${(a.totalEarnings || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-yellow-400 font-mono">${(a.pendingBalance || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {a.status === 'active' ? (
                        <Button variant="ghost" size="sm" onClick={() => handleStatusChange(a.$id, 'suspended')} disabled={actionLoading}>
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleStatusChange(a.$id, 'active')} disabled={actionLoading}>
                          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                        </Button>
                      )}
                      {(a.pendingBalance || 0) >= 25 && (
                        <Button variant="ghost" size="sm" onClick={() => setPayoutTarget(a)} disabled={actionLoading}>
                          <Banknote className="h-3.5 w-3.5 text-yellow-400" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payout Confirmation Dialog */}
      {payoutTarget && (
        <Dialog open onClose={() => setPayoutTarget(null)} title="Process Payout" size="sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-nyx-bg">
              <Banknote className="h-6 w-6 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Payout amount</p>
                <p className="text-2xl font-bold text-white">${(payoutTarget.pendingBalance || 0).toFixed(2)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Affiliate: <span className="text-white font-mono">{payoutTarget.code}</span>
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0" />
              <p className="text-xs text-yellow-300">This will mark the balance as paid. Process the actual payment separately.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setPayoutTarget(null)}>Cancel</Button>
              <Button variant="primary" loading={actionLoading} onClick={handlePayout}>Confirm Payout</Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
