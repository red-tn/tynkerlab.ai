'use client'

import { useState, useEffect } from 'react'
import type { Profile } from '@/types/database'
import { UserTable } from '@/components/admin/user-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Search, ChevronLeft, ChevronRight, X, Coins, Shield } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [creditAdjust, setCreditAdjust] = useState('200')
  const [showCreditConfirm, setShowCreditConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Editable overrides for the modal
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user')
  const [editTier, setEditTier] = useState<'free' | 'pro' | 'enterprise'>('free')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotal(data.total)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page, search])

  // When a user is selected, sync editable fields
  useEffect(() => {
    if (selectedUser) {
      setEditRole(selectedUser.role || 'user')
      setEditTier(selectedUser.subscriptionTier || 'free')
      setShowCreditConfirm(false)
    }
  }, [selectedUser])

  const handleUpdateUser = async (updates: Record<string, any>) => {
    if (!selectedUser) return
    setSaving(true)
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: selectedUser.$id, ...updates }),
      })
      await fetchUsers()
      setSelectedUser(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (user: Profile) => {
    try {
      const res = await fetch(`/api/admin/users?profileId=${user.$id}`, { method: 'DELETE' })
      if (res.ok) {
        if (selectedUser?.$id === user.$id) setSelectedUser(null)
        await fetchUsers()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveRoleTier = () => {
    const updates: Record<string, any> = {}
    if (editRole !== selectedUser?.role) updates.role = editRole
    if (editTier !== (selectedUser?.subscriptionTier || 'free')) updates.subscriptionTier = editTier
    if (Object.keys(updates).length > 0) {
      handleUpdateUser(updates)
    }
  }

  const roleTierChanged = selectedUser && (
    editRole !== (selectedUser.role || 'user') ||
    editTier !== (selectedUser.subscriptionTier || 'free')
  )

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-400">{total} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-nyx-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <UserTable
          users={users}
          onSelect={setSelectedUser}
          onDelete={handleDeleteUser}
          selectedId={selectedUser?.$id}
        />
      )}

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

      {/* User Detail Panel */}
      {selectedUser && (
        <Dialog open onClose={() => setSelectedUser(null)} title="User Details" size="md">
          <div className="space-y-5">
            <div>
              <p className="text-lg font-semibold text-white">{selectedUser.fullName}</p>
              <p className="text-sm text-gray-400">{selectedUser.email}</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-nyx-bg">
                <p className="text-gray-500 text-xs mb-1">Credits</p>
                <p className="text-white font-mono text-lg">{(selectedUser.creditsBalance || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-nyx-bg">
                <p className="text-gray-500 text-xs mb-1">Generations</p>
                <p className="text-white text-lg">{selectedUser.totalGenerations || 0}</p>
              </div>
            </div>

            {/* Role & Tier — editable dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-400">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'user' | 'admin')}
                  className="w-full rounded-lg bg-nyx-bg border border-nyx-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-400">Subscription Tier</label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value as 'free' | 'pro' | 'enterprise')}
                  className="w-full rounded-lg bg-nyx-bg border border-nyx-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="free">Free</option>
                  <option value="pro">Creator</option>
                  <option value="enterprise">Pro Creator</option>
                </select>
              </div>
            </div>
            {roleTierChanged && (
              <Button
                size="sm"
                loading={saving}
                onClick={handleSaveRoleTier}
              >
                Save Role & Tier
              </Button>
            )}

            {/* Add Gratuitous Credits */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Add Gratuitous Credits</label>
              <p className="text-xs text-gray-500">Free addition — no charge to the user</p>
              <div className="flex gap-2">
                <select
                  value={creditAdjust}
                  onChange={(e) => setCreditAdjust(e.target.value)}
                  className="flex-1 rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="200">200 credits</option>
                  <option value="500">500 credits</option>
                  <option value="1000">1,000 credits</option>
                  <option value="10000">10,000 credits</option>
                </select>
                {!showCreditConfirm ? (
                  <Button
                    variant="secondary"
                    disabled={saving}
                    onClick={() => setShowCreditConfirm(true)}
                  >
                    <Coins className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="primary"
                      disabled={saving}
                      loading={saving}
                      onClick={() => {
                        handleUpdateUser({ credits: parseInt(creditAdjust) })
                        setCreditAdjust('200')
                        setShowCreditConfirm(false)
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreditConfirm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
