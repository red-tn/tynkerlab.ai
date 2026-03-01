'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types/database'
import { Trash2, Loader2 } from 'lucide-react'

interface UserTableProps {
  users: Profile[]
  onSelect: (user: Profile) => void
  onDelete: (user: Profile) => void
  selectedId?: string
}

export function UserTable({ users, onSelect, onDelete, selectedId }: UserTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  return (
    <div className="rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-nyx-border bg-nyx-bg/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Generations</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
            <th className="w-10 px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.$id}
              className={`border-b border-nyx-border last:border-0 transition-colors
                ${selectedId === user.$id ? 'bg-primary-500/5' : 'hover:bg-white/[.02]'}`}
            >
              <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(user)}>
                <div className="flex items-center gap-3">
                  <Avatar fallback={user.fullName?.charAt(0) || 'U'} src={user.avatarUrl || undefined} size="sm" />
                  <div>
                    <p className="text-white font-medium">{user.fullName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(user)}>
                <Badge variant={user.role === 'admin' ? 'warning' : 'default'}>
                  {user.role}
                </Badge>
              </td>
              <td className="px-4 py-3 text-white font-mono cursor-pointer" onClick={() => onSelect(user)}>{(user.creditsBalance || 0).toLocaleString()}</td>
              <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(user)}>
                <Badge variant={user.subscriptionTier === 'pro' ? 'success' : user.subscriptionTier === 'enterprise' ? 'info' : 'outline'}>
                  {user.subscriptionTier === 'enterprise' ? 'Pro Creator' : user.subscriptionTier === 'pro' ? 'Creator' : 'Free'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-gray-400 cursor-pointer" onClick={() => onSelect(user)}>{(user.totalGenerations || 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-gray-500 text-xs cursor-pointer" onClick={() => onSelect(user)}>{formatDate(user.$createdAt)}</td>
              <td className="px-3 py-3">
                {confirmId === user.$id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(user); setConfirmId(null) }}
                      className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmId(null) }}
                      className="px-1.5 py-0.5 text-[10px] text-gray-500 hover:text-white rounded transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmId(user.$id) }}
                    className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="text-center text-gray-500 py-8 text-sm">No users found</p>
      )}
    </div>
  )
}
