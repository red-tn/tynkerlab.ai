'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types/database'
import { Trash2 } from 'lucide-react'

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
      {/* Mobile card layout */}
      <div className="md:hidden divide-y divide-nyx-border">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelect(user)}
            className={`p-4 cursor-pointer transition-colors ${
              selectedId === user.id ? 'bg-primary-500/5' : 'hover:bg-white/[.02]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar fallback={user.full_name?.charAt(0) || 'U'} src={user.avatar_url || undefined} size="sm" />
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{user.full_name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              {confirmId === user.id ? (
                <div className="flex items-center gap-1 shrink-0">
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
                  onClick={(e) => { e.stopPropagation(); setConfirmId(user.id) }}
                  className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Delete user"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant={user.role === 'admin' ? 'warning' : 'default'}>
                {user.role}
              </Badge>
              <Badge variant={user.subscription_tier === 'pro' ? 'success' : user.subscription_tier === 'enterprise' ? 'info' : 'outline'}>
                {user.subscription_tier === 'enterprise' ? 'Pro Creator' : user.subscription_tier === 'pro' ? 'Creator' : 'Free'}
              </Badge>
              <span className="text-gray-400 font-mono">{(user.credits_balance || 0).toLocaleString()} credits</span>
              <span className="text-gray-500">{(user.total_generations || 0).toLocaleString()} gens</span>
              <span className="text-gray-600">{formatDate(user.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block overflow-x-auto">
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
                key={user.id}
                className={`border-b border-nyx-border last:border-0 transition-colors
                  ${selectedId === user.id ? 'bg-primary-500/5' : 'hover:bg-white/[.02]'}`}
              >
                <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(user)}>
                  <div className="flex items-center gap-3">
                    <Avatar fallback={user.full_name?.charAt(0) || 'U'} src={user.avatar_url || undefined} size="sm" />
                    <div>
                      <p className="text-white font-medium">{user.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(user)}>
                  <Badge variant={user.role === 'admin' ? 'warning' : 'default'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-white font-mono cursor-pointer" onClick={() => onSelect(user)}>{(user.credits_balance || 0).toLocaleString()}</td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(user)}>
                  <Badge variant={user.subscription_tier === 'pro' ? 'success' : user.subscription_tier === 'enterprise' ? 'info' : 'outline'}>
                    {user.subscription_tier === 'enterprise' ? 'Pro Creator' : user.subscription_tier === 'pro' ? 'Creator' : 'Free'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-400 cursor-pointer" onClick={() => onSelect(user)}>{(user.total_generations || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500 text-xs cursor-pointer" onClick={() => onSelect(user)}>{formatDate(user.created_at)}</td>
                <td className="px-3 py-3">
                  {confirmId === user.id ? (
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
                      onClick={(e) => { e.stopPropagation(); setConfirmId(user.id) }}
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
      </div>
      {users.length === 0 && (
        <p className="text-center text-gray-500 py-8 text-sm">No users found</p>
      )}
    </div>
  )
}
