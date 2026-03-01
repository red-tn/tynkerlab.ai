'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/client'
import { Query } from 'appwrite'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeDate } from '@/lib/utils'
import type { Generation } from '@/types/database'
import { useToast } from '@/components/ui/toast'
import {
  Wand2, ImageIcon, Video, Image, Volume2, Coins, TrendingUp,
  Zap, ArrowRight, Clock, Sparkles, Crown, CreditCard, Trash2
} from 'lucide-react'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { addToast } = useToast()
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchRecent = async () => {
    if (!user) return
    try {
      const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, [
        Query.equal('userId', user.$id),
        Query.equal('status', 'completed'),
        Query.orderDesc('$createdAt'),
        Query.limit(6),
      ])
      setRecentGenerations(result.documents as unknown as Generation[])
    } catch (err) {
      console.error('Failed to fetch generations:', err)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRecent() }, [user])

  const handleDeleteGeneration = async (gen: Generation) => {
    if (!user) return
    setDeletingId(gen.$id)
    try {
      const res = await fetch(`/api/generations?id=${gen.$id}&userId=${user.$id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        addToast(err.error || 'Failed to delete', 'error')
        return
      }
      addToast('Generation deleted')
      setConfirmDeleteId(null)
      await fetchRecent()
    } catch {
      addToast('Failed to delete', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const quickLinks = [
    { href: '/studio/text-to-image', label: 'Text to Image', desc: 'Generate from text prompts', icon: Wand2, gradient: 'from-primary-500 to-primary-700' },
    { href: '/studio/image-to-image', label: 'Image to Image', desc: 'Transform existing images', icon: ImageIcon, gradient: 'from-accent-500 to-accent-700' },
    { href: '/studio/text-to-video', label: 'Text to Video', desc: 'Create videos from text', icon: Video, gradient: 'from-primary-400 to-accent-500' },
    { href: '/studio/image-to-video', label: 'Image to Video', desc: 'Animate still images', icon: Image, gradient: 'from-accent-400 to-primary-500' },
    { href: '/studio/text-to-speech', label: 'Text to Speech', desc: 'AI voice generation', icon: Volume2, gradient: 'from-primary-500 to-accent-400' },
  ]

  const tierLabel = profile?.subscriptionTier === 'enterprise' ? 'Pro Creator' : profile?.subscriptionTier === 'pro' ? 'Creator' : 'Free'
  const creditsPercent = profile ? Math.min(100, Math.round((profile.creditsBalance / Math.max(profile.creditsMonthly || 50, 1)) * 100)) : 0

  return (
    <div className="space-y-8 relative">
      {/* ---- Ambient glow orbs ---- */}
      <div className="pointer-events-none absolute inset-0 -top-24 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary-500/[0.07] blur-[120px]" />
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-accent-500/[0.05] blur-[100px]" />
        <div className="absolute top-[400px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary-600/[0.04] blur-[100px]" />
      </div>

      {/* ---- Hero welcome banner ---- */}
      <div className="relative overflow-hidden rounded-2xl border border-nyx-border">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-nyx-surface to-accent-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-500/15 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent-500/10 via-transparent to-transparent" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary-400" />
                <Badge variant="outline" className="border-primary-500/30 text-primary-300 text-xs">
                  {tierLabel} Plan
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Welcome back, <span className="gradient-text">{profile?.fullName || user?.name || 'Creator'}</span>
              </h1>
              <p className="text-gray-400 mt-2 text-lg">What will you create today?</p>
            </div>

            {/* Credits pill */}
            <div className="flex items-center gap-4 bg-nyx-bg/60 backdrop-blur-sm border border-nyx-border rounded-xl px-5 py-4 min-w-[200px]">
              <div className="relative">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-nyx-border" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#credit-grad)" strokeWidth="3" strokeDasharray={`${creditsPercent} ${100 - creditsPercent}`} strokeLinecap="round" />
                  <defs>
                    <linearGradient id="credit-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </svg>
                <Coins className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{profile?.creditsBalance?.toLocaleString() ?? 0}</p>
                <p className="text-xs text-gray-500">credits remaining</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Stats row ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {[
          { label: 'Credits Balance', value: profile?.creditsBalance?.toLocaleString() ?? '0', icon: Coins, color: 'text-primary-400', bg: 'bg-primary-500/10', ring: 'ring-primary-500/20' },
          { label: 'Total Generations', value: profile?.totalGenerations?.toString() ?? '0', icon: TrendingUp, color: 'text-accent-400', bg: 'bg-accent-500/10', ring: 'ring-accent-500/20' },
          { label: 'Images Created', value: profile?.totalImages?.toString() ?? '0', icon: ImageIcon, color: 'text-primary-300', bg: 'bg-primary-500/10', ring: 'ring-primary-500/20' },
          { label: 'Videos Created', value: profile?.totalVideos?.toString() ?? '0', icon: Video, color: 'text-accent-300', bg: 'bg-accent-500/10', ring: 'ring-accent-500/20' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative bg-nyx-surface/80 backdrop-blur-sm border border-nyx-border rounded-xl p-4 hover:border-nyx-border-bright transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.bg} ring-1 ${stat.ring}`}>
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

      {/* ---- Quick actions ---- */}
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">Create Something New</h2>
          <Link href="/studio/text-to-image">
            <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-300">
              Open Studio <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="group relative overflow-hidden rounded-xl border border-nyx-border bg-nyx-surface/80 backdrop-blur-sm p-5 h-full hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5">
                {/* Subtle gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${link.gradient} mb-3`}>
                    <link.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-primary-300 transition-colors">{link.label}</h3>
                  <p className="text-xs text-gray-500 mt-1">{link.desc}</p>
                  <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all mt-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ---- Plan + upgrade banner ---- */}
      {profile?.subscriptionTier === 'free' && (
        <div className="relative overflow-hidden rounded-xl border border-primary-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 via-nyx-surface to-accent-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/20">
                <Crown className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
                <p className="text-xs text-gray-400">Get 2,000 credits/month and access premium models</p>
              </div>
            </div>
            <Link href="/pricing">
              <Button variant="primary" size="sm" className="shrink-0">
                <CreditCard className="h-4 w-4 mr-1.5" /> View Plans
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ---- Recent Generations ---- */}
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">Recent Generations</h2>
          <Link href="/dashboard/gallery">
            <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-300">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" variant="rectangular" />
            ))}
          </div>
        ) : recentGenerations.length === 0 ? (
          <div className="relative overflow-hidden rounded-xl border border-nyx-border bg-nyx-surface/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/5 via-transparent to-transparent" />
            <div className="relative text-center py-16">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 ring-1 ring-primary-500/20 mb-4">
                <Zap className="h-8 w-8 text-primary-400" />
              </div>
              <p className="text-lg font-medium text-white mb-1">No generations yet</p>
              <p className="text-sm text-gray-500 mb-6">Start creating with the studio tools above!</p>
              <Link href="/studio/text-to-image">
                <Button variant="primary" size="sm">
                  <Sparkles className="h-4 w-4 mr-1.5" /> Create Your First Image
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {recentGenerations.map((gen) => (
              <div key={gen.$id} className="group relative overflow-hidden rounded-xl border border-nyx-border bg-nyx-surface/80 backdrop-blur-sm hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5">
                <div className="aspect-video bg-nyx-border relative overflow-hidden">
                  {gen.outputUrl ? (
                    gen.type.includes('video') ? (
                      <video src={gen.outputUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted />
                    ) : (
                      <img src={gen.outputUrl} alt={gen.prompt || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Badge variant={gen.status === 'failed' ? 'error' : 'default'}>{gen.status}</Badge>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Delete button */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {confirmDeleteId === gen.$id ? (
                      <div className="flex items-center gap-1 bg-black/70 rounded-lg px-2 py-1">
                        <button
                          onClick={() => handleDeleteGeneration(gen)}
                          disabled={deletingId === gen.$id}
                          className="text-[10px] font-medium text-red-400 hover:text-red-300"
                        >
                          {deletingId === gen.$id ? '...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[10px] text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(gen.$id)}
                        className="p-1.5 rounded-lg bg-black/50 hover:bg-red-500/20 transition-colors"
                        title="Delete generation"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-300 truncate">{gen.prompt || 'No prompt'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline">{gen.type}</Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(gen.$createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
