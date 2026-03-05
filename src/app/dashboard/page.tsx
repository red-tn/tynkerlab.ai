'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatRelativeDate } from '@/lib/utils'
import type { Generation, PromptCategory } from '@/types/database'
import { useToast } from '@/components/ui/toast'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getModelById } from '@/lib/together/models'
import { ModelCategoryIcon } from '@/components/studio/model-icons'
import { adminFetch } from '@/lib/admin-fetch'
import { formatDate } from '@/lib/utils'
import { downloadFile } from '@/lib/download'
import {
  Wand2, ImageIcon, Video, Image, Volume2, Coins, TrendingUp,
  Zap, ArrowRight, Clock, Sparkles, Crown, CreditCard, Trash2, UserCircle, Download, Info, BookOpen, Send, Gift
} from 'lucide-react'

const CATEGORIES: { value: PromptCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'photography', label: 'Photography' },
  { value: 'art', label: 'Art' },
  { value: 'anime', label: 'Anime' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'nature', label: 'Nature' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'abstract', label: 'Abstract' },
]

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { addToast } = useToast()
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [detailGen, setDetailGen] = useState<Generation | null>(null)

  // Post/Submit to Inspirations state
  const [inspirationGen, setInspirationGen] = useState<Generation | null>(null)
  const [inspirationTitle, setInspirationTitle] = useState('')
  const [inspirationCategory, setInspirationCategory] = useState<PromptCategory>('general')
  const [inspirationPrompt, setInspirationPrompt] = useState('')
  const [publishAs, setPublishAs] = useState<'curated' | 'community'>('curated')
  const [postingInspiration, setPostingInspiration] = useState(false)
  const [submitMode, setSubmitMode] = useState<'admin' | 'user'>('admin')
  const [checkinClaimed, setCheckinClaimed] = useState(false)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const isAdmin = profile?.role === 'admin'

  const handleDownload = (gen: Generation) => {
    if (!gen.output_url) return
    const ext = gen.type.includes('video') || gen.type === 'ugc-avatar' ? 'mp4' : 'png'
    downloadFile(gen.output_url, `tynkerlab-${gen.id}.${ext}`)
  }

  const fetchRecent = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(6)
      if (error) throw error
      setRecentGenerations((data || []) as Generation[])
    } catch (err) {
      console.error('Failed to fetch generations:', err)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRecent() }, [user])

  // Check if daily credits already claimed today
  useEffect(() => {
    if (!user || profile?.subscription_tier !== 'free') return
    fetch(`/api/credits/checkin?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.claimed) setCheckinClaimed(true)
      })
      .catch(() => {})
  }, [user, profile?.subscription_tier])

  const handleDeleteGeneration = async (gen: Generation) => {
    if (!user) return
    setDeletingId(gen.id)
    try {
      const res = await fetch(`/api/generations?id=${gen.id}&userId=${user.id}`, { method: 'DELETE' })
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

  const openInspirationDialog = (gen: Generation, mode: 'admin' | 'user') => {
    setInspirationGen(gen)
    setInspirationTitle('')
    setInspirationCategory('general')
    setInspirationPrompt(gen.prompt || '')
    setPublishAs('curated')
    setSubmitMode(mode)
  }

  const handlePostInspiration = async () => {
    if (!inspirationGen || !inspirationTitle.trim()) return
    setPostingInspiration(true)
    try {
      if (submitMode === 'admin') {
        const promptText = inspirationPrompt.trim() || inspirationGen.prompt
        const modelType = inspirationGen.type.includes('video') || inspirationGen.type === 'ugc-avatar' ? 'video' : 'image'

        if (publishAs === 'community') {
          const res = await adminFetch('/api/admin/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: inspirationTitle.trim(),
              promptText,
              category: inspirationCategory,
              modelType,
              modelUsed: inspirationGen.model,
              previewImageUrl: inspirationGen.output_url,
              isPublished: true,
              submissionStatus: 'approved',
              submittedBy: user?.id,
              submitterName: profile?.full_name || 'Anonymous',
              createdBy: profile?.full_name || 'Anonymous',
            }),
          })
          if (!res.ok) throw new Error('Failed to post')
          addToast('Posted as Community inspiration!', 'success')
        } else {
          const res = await adminFetch('/api/admin/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: inspirationTitle.trim(),
              promptText,
              category: inspirationCategory,
              modelType,
              modelUsed: inspirationGen.model,
              previewImageUrl: inspirationGen.output_url,
              isPublished: true,
              createdBy: 'Tynkerlab.ai Team',
            }),
          })
          if (!res.ok) throw new Error('Failed to post')
          addToast('Posted as Curated inspiration!', 'success')
        }
      } else {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: inspirationTitle.trim(),
            promptText: inspirationGen.prompt,
            category: inspirationCategory,
            modelType: inspirationGen.type.includes('video') || inspirationGen.type === 'ugc-avatar' ? 'video' : 'image',
            modelUsed: inspirationGen.model,
            previewImageUrl: inspirationGen.output_url,
            userId: user?.id,
            userName: profile?.full_name || user?.user_metadata?.full_name || 'Anonymous',
          }),
        })
        if (!res.ok) throw new Error('Failed to submit')
        addToast('Submitted for review!', 'success')
      }
      setInspirationGen(null)
    } catch (err: any) {
      addToast(err.message || 'Failed', 'error')
    } finally {
      setPostingInspiration(false)
    }
  }

  const handleCheckin = async () => {
    if (!user || checkinLoading || checkinClaimed) return
    setCheckinLoading(true)
    try {
      const res = await fetch('/api/credits/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (data.already_claimed) {
        setCheckinClaimed(true)
        addToast('Already claimed today!', 'info')
      } else if (data.credits_granted) {
        setCheckinClaimed(true)
        addToast(`+${data.credits_granted} daily credits claimed!`, 'success')
        await refreshProfile()
      } else if (data.error) {
        addToast(data.error, 'error')
      }
    } catch {
      addToast('Failed to claim daily credits', 'error')
    } finally {
      setCheckinLoading(false)
    }
  }

  const quickLinks = [
    { href: '/studio/text-to-image', label: 'Text to Image', desc: 'Generate from text prompts', icon: Wand2, gradient: 'from-primary-500 to-primary-700' },
    { href: '/studio/image-to-image', label: 'Image to Image', desc: 'Transform existing images', icon: ImageIcon, gradient: 'from-accent-500 to-accent-700' },
    { href: '/studio/text-to-video', label: 'Text to Video', desc: 'Create videos from text', icon: Video, gradient: 'from-primary-400 to-accent-500' },
    { href: '/studio/image-to-video', label: 'Image to Video', desc: 'Animate still images', icon: Image, gradient: 'from-accent-400 to-primary-500' },
    { href: '/studio/ugc-avatar', label: 'UGC Avatar', desc: 'Talking avatar videos', icon: UserCircle, gradient: 'from-primary-600 to-accent-400' },
    { href: '/studio/text-to-speech', label: 'Text to Speech', desc: 'AI voice generation', icon: Volume2, gradient: 'from-primary-500 to-accent-400' },
  ]

  const tierLabel = profile?.subscription_tier === 'enterprise' ? 'Pro Creator' : profile?.subscription_tier === 'pro' ? 'Creator' : 'Free'
  const creditsPercent = profile ? Math.min(100, Math.round((profile.credits_balance / Math.max(profile.credits_monthly || 50, 1)) * 100)) : 0

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
                Welcome back, <span className="gradient-text">{profile?.full_name || user?.user_metadata?.full_name || 'Creator'}</span>
              </h1>
              <p className="text-gray-400 mt-2 text-lg">What will you create today?</p>
            </div>

            {/* Credits pill */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 bg-nyx-bg/60 backdrop-blur-sm border border-nyx-border rounded-xl px-5 py-4 min-w-[200px]">
                <div className="relative">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-nyx-border" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#credit-grad)" strokeWidth="3" strokeDasharray={`${creditsPercent} ${100 - creditsPercent}`} strokeLinecap="round" />
                    <defs>
                      <linearGradient id="credit-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--gradient-from)" />
                        <stop offset="100%" stopColor="var(--gradient-to)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <Coins className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile?.credits_balance?.toLocaleString() ?? 0}</p>
                  <p className="text-xs text-gray-500">credits remaining</p>
                </div>
              </div>
              {profile?.subscription_tier === 'free' && (
                <button
                  onClick={handleCheckin}
                  disabled={checkinClaimed || checkinLoading}
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                    checkinClaimed
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400 cursor-default'
                      : 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30 text-primary-300 hover:from-primary-500/30 hover:to-accent-500/30 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10'
                  )}
                >
                  {checkinClaimed ? (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Claimed!
                    </>
                  ) : checkinLoading ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Gift className="h-4 w-4" />
                      Claim Daily Credits (+3)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Stats row ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 relative">
        {[
          { label: 'Credits Balance', value: profile?.credits_balance?.toLocaleString() ?? '0', icon: Coins, color: 'text-primary-400', bg: 'bg-primary-500/10', ring: 'ring-primary-500/20' },
          { label: 'Total Generations', value: profile?.total_generations?.toString() ?? '0', icon: TrendingUp, color: 'text-accent-400', bg: 'bg-accent-500/10', ring: 'ring-accent-500/20' },
          { label: 'Images Created', value: profile?.total_images?.toString() ?? '0', icon: ImageIcon, color: 'text-primary-300', bg: 'bg-primary-500/10', ring: 'ring-primary-500/20' },
          { label: 'Videos Created', value: profile?.total_videos?.toString() ?? '0', icon: Video, color: 'text-accent-300', bg: 'bg-accent-500/10', ring: 'ring-accent-500/20' },
          { label: 'Avatars Created', value: profile?.total_avatars?.toString() ?? '0', icon: UserCircle, color: 'text-pink-300', bg: 'bg-pink-500/10', ring: 'ring-pink-500/20' },
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
      {profile?.subscription_tier === 'free' && (
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
              <div key={gen.id} className="group relative overflow-hidden rounded-xl border border-nyx-border bg-nyx-surface/80 backdrop-blur-sm hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 cursor-pointer" onClick={() => setDetailGen(gen)}>
                <div className="aspect-video bg-nyx-border relative overflow-hidden">
                  {gen.output_url ? (
                    gen.type.includes('video') || gen.type === 'ugc-avatar' ? (
                      <video src={gen.output_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted playsInline autoPlay loop />
                    ) : (
                      <img src={gen.output_url} alt={gen.prompt || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Badge variant={gen.status === 'failed' ? 'error' : 'default'}>{gen.status}</Badge>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Action buttons */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {confirmDeleteId === gen.id ? (
                      <div className="flex items-center gap-1 bg-black/70 rounded-lg px-2 py-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteGeneration(gen) }}
                          disabled={deletingId === gen.id}
                          className="text-[10px] font-medium text-red-400 hover:text-red-300"
                        >
                          {deletingId === gen.id ? '...' : 'Delete'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null) }}
                          className="text-[10px] text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(gen.id) }}
                        className="p-1.5 rounded-lg bg-black/50 hover:bg-red-500/20 transition-colors"
                        title="Delete generation"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-400" />
                      </button>
                    )}
                  </div>
                  {/* Action buttons (right) */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetailGen(gen) }}
                      className="p-1.5 rounded-lg bg-black/50 hover:bg-white/20 transition-colors"
                      title="View details"
                    >
                      <Info className="h-3.5 w-3.5 text-white" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openInspirationDialog(gen, 'admin') }}
                        className="p-1.5 rounded-lg bg-black/50 hover:bg-white/20 transition-colors"
                        title="Post to Inspirations"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-primary-400" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); openInspirationDialog(gen, 'user') }}
                      className="p-1.5 rounded-lg bg-black/50 hover:bg-white/20 transition-colors"
                      title="Submit to Inspirations"
                    >
                      <Send className="h-3.5 w-3.5 text-accent-400" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(gen) }}
                      className="p-1.5 rounded-lg bg-black/50 hover:bg-white/20 transition-colors"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-300 truncate">{gen.prompt || 'No prompt'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline">{gen.type}</Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(gen.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generation Detail Dialog */}
      {detailGen && (() => {
        const modelInfo = getModelById(detailGen.model)
        return (
          <Dialog open onClose={() => setDetailGen(null)} title="Generation Details" size="lg">
            <div className="space-y-4">
              {/* Preview */}
              <div className="rounded-lg overflow-hidden border border-nyx-border bg-black">
                {detailGen.type.includes('video') || detailGen.type === 'ugc-avatar' ? (
                  <video src={detailGen.output_url || ''} className="w-full max-h-[400px] object-contain" controls muted autoPlay loop playsInline />
                ) : (
                  <img src={detailGen.output_url || ''} alt={detailGen.prompt || ''} className="w-full max-h-[400px] object-contain" />
                )}
              </div>

              {/* Model info */}
              {modelInfo && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-nyx-surface border border-nyx-border">
                  <ModelCategoryIcon category={modelInfo.category} className="h-4 w-4" />
                  <span className="text-sm font-medium text-white">{modelInfo.displayName}</span>
                  <span className="text-xs text-gray-500">&middot;</span>
                  <span className="text-xs text-gray-400">{modelInfo.categoryLabel}</span>
                </div>
              )}

              {/* Prompt */}
              {detailGen.prompt && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Prompt</label>
                  <p className="text-sm text-gray-300 bg-nyx-bg border border-nyx-border rounded-lg p-3 whitespace-pre-wrap">{detailGen.prompt}</p>
                </div>
              )}

              {/* Metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Type</p>
                  <p className="text-sm text-white font-medium mt-0.5">{detailGen.type}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Credits</p>
                  <p className="text-sm text-white font-medium mt-0.5">{detailGen.credits_used}</p>
                </div>
                {detailGen.width && detailGen.height && (
                  <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Resolution</p>
                    <p className="text-sm text-white font-medium mt-0.5">{detailGen.width}&times;{detailGen.height}</p>
                  </div>
                )}
                {detailGen.aspect_ratio && (
                  <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Aspect Ratio</p>
                    <p className="text-sm text-white font-medium mt-0.5">{detailGen.aspect_ratio}</p>
                  </div>
                )}
                {detailGen.seed != null && (
                  <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Seed</p>
                    <p className="text-sm text-white font-medium mt-0.5">{detailGen.seed}</p>
                  </div>
                )}
                {detailGen.steps != null && (
                  <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Steps</p>
                    <p className="text-sm text-white font-medium mt-0.5">{detailGen.steps}</p>
                  </div>
                )}
                {detailGen.duration_seconds != null && (
                  <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Duration</p>
                    <p className="text-sm text-white font-medium mt-0.5">{detailGen.duration_seconds}s</p>
                  </div>
                )}
                <div className="p-2.5 rounded-lg bg-nyx-bg border border-nyx-border">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Created</p>
                  <p className="text-sm text-white font-medium mt-0.5">{formatDate(detailGen.created_at)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setDetailGen(null)}>Close</Button>
                <Button variant="primary" onClick={() => handleDownload(detailGen)}>
                  <Download className="h-4 w-4 mr-1.5" /> Download
                </Button>
              </div>
            </div>
          </Dialog>
        )
      })()}

      {/* Post/Submit to Inspirations Dialog */}
      {inspirationGen && (() => {
        const modelInfo = getModelById(inspirationGen.model)
        return (
          <Dialog open onClose={() => setInspirationGen(null)} title={submitMode === 'admin' ? 'Post to Inspirations' : 'Submit to Inspirations'} size="md">
            <div className="space-y-4">
              {/* Preview */}
              <div className="rounded-lg overflow-hidden border border-nyx-border">
                {inspirationGen.type.includes('video') || inspirationGen.type === 'ugc-avatar' ? (
                  <video
                    src={inspirationGen.output_url || ''}
                    className="w-full aspect-video object-cover"
                    controls
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={inspirationGen.output_url || ''}
                    alt={inspirationGen.prompt}
                    className="w-full aspect-video object-cover"
                  />
                )}
              </div>

              {/* Model info */}
              {modelInfo && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-nyx-surface border border-nyx-border">
                  <ModelCategoryIcon category={modelInfo.category} className="h-4 w-4 text-primary-400" />
                  <span className="text-sm font-medium text-white">{modelInfo.displayName}</span>
                  <span className="text-xs text-gray-500">&middot;</span>
                  <span className="text-xs text-gray-400">{modelInfo.categoryLabel}</span>
                  {inspirationGen.width && inspirationGen.height && (
                    <>
                      <span className="text-xs text-gray-500">&middot;</span>
                      <span className="text-xs text-gray-400">{inspirationGen.width} &times; {inspirationGen.height}</span>
                    </>
                  )}
                </div>
              )}

              {/* Admin: Curated / Community toggle */}
              {submitMode === 'admin' && (
                <div className="flex rounded-lg border border-nyx-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPublishAs('curated')}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm font-medium transition-colors',
                      publishAs === 'curated'
                        ? 'bg-primary-500/20 text-primary-300 border-r border-primary-500/30'
                        : 'bg-nyx-surface text-gray-400 hover:text-white border-r border-nyx-border'
                    )}
                  >
                    Public (Curated)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPublishAs('community')}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm font-medium transition-colors',
                      publishAs === 'community'
                        ? 'bg-accent-500/20 text-accent-300'
                        : 'bg-nyx-surface text-gray-400 hover:text-white'
                    )}
                  >
                    Community
                  </button>
                </div>
              )}

              {submitMode === 'user' && (
                <p className="text-xs text-gray-400 bg-primary-500/5 border border-primary-500/20 rounded-lg p-3">
                  Submissions are reviewed before publishing. Your name will appear as the creator.
                </p>
              )}

              {/* Title */}
              <Input
                label="Title"
                value={inspirationTitle}
                onChange={(e) => setInspirationTitle(e.target.value)}
                placeholder="Give this creation a title..."
              />

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <select
                  value={inspirationCategory}
                  onChange={(e) => setInspirationCategory(e.target.value as PromptCategory)}
                  className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Prompt */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Prompt</label>
                {submitMode === 'admin' ? (
                  <textarea
                    value={inspirationPrompt}
                    onChange={(e) => setInspirationPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                    placeholder="Edit the prompt..."
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-nyx-bg border border-nyx-border">
                    <p className="text-sm text-gray-300 line-clamp-4">{inspirationGen.prompt}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setInspirationGen(null)}>Cancel</Button>
                <Button
                  variant="primary"
                  onClick={handlePostInspiration}
                  loading={postingInspiration}
                  disabled={!inspirationTitle.trim()}
                >
                  {submitMode === 'admin' ? 'Post' : 'Submit'}
                </Button>
              </div>
            </div>
          </Dialog>
        )
      })()}
    </div>
  )
}
