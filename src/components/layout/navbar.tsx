'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { LogoFull } from '@/components/brand/logo-full'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  TextToImageIcon, ImageToImageIcon, TextToVideoIcon,
  ImageToVideoIcon, TextToSpeechIcon,
} from '@/components/brand/studio-icons'
import { ModelCategoryIcon } from '@/components/studio/model-icons'
import type { ModelCategory } from '@/lib/together/models'
import {
  Menu, X, ChevronDown, Wand2, ImageIcon, Video, Coins,
  LayoutDashboard, User, CreditCard, LogOut, Shield, Image, Volume2
} from 'lucide-react'

const studioLinks = [
  { href: '/studio/text-to-image', label: 'Text to Image', icon: Wand2 },
  { href: '/studio/image-to-image', label: 'Image to Image', icon: ImageIcon },
  { href: '/studio/text-to-video', label: 'Text to Video', icon: Video },
  { href: '/studio/image-to-video', label: 'Image to Video', icon: Image },
  { href: '/studio/text-to-speech', label: 'Text to Speech', icon: Volume2 },
]

// Mega-menu feature items with colored studio icons
const megaFeatures = [
  { Icon: TextToImageIcon, label: 'Text to Image', desc: 'Generate images from text prompts', href: '/studio/text-to-image' },
  { Icon: ImageToImageIcon, label: 'Image to Image', desc: 'Transform and enhance images', href: '/studio/image-to-image' },
  { Icon: TextToVideoIcon, label: 'Text to Video', desc: 'Create videos from descriptions', href: '/studio/text-to-video' },
  { Icon: ImageToVideoIcon, label: 'Image to Video', desc: 'Animate still images', href: '/studio/image-to-video' },
  { Icon: TextToSpeechIcon, label: 'Text to Speech', desc: 'Natural AI voice generation', href: '/studio/text-to-speech' },
]

interface MegaModel {
  name: string
  category: ModelCategory
  badge?: 'HOT' | 'NEW'
  href: string
  modelId: string
}

const megaImageModels: MegaModel[] = [
  { name: 'Imagen 4.0', category: 'google', badge: 'HOT', href: '/studio/text-to-image', modelId: 'google/imagen-4.0-ultra' },
  { name: 'FLUX.2 Dev', category: 'flux', href: '/studio/text-to-image', modelId: 'black-forest-labs/FLUX.2-dev' },
  { name: 'Ideogram 3', category: 'ideogram', badge: 'HOT', href: '/studio/text-to-image', modelId: 'ideogram/ideogram-3.0' },
  { name: 'Qwen Image', category: 'qwen', href: '/studio/text-to-image', modelId: 'Qwen/Qwen-Image' },
  { name: 'HiDream', category: 'hidream', badge: 'NEW', href: '/studio/text-to-image', modelId: 'HiDream-ai/HiDream-I1-Full' },
]

const megaVideoModels: MegaModel[] = [
  { name: 'Seedance', category: 'bytedance', badge: 'HOT', href: '/studio/text-to-video', modelId: 'ByteDance/Seedance-1.0-pro' },
  { name: 'Veo 3', category: 'google', badge: 'HOT', href: '/studio/text-to-video', modelId: 'google/veo-3.0' },
  { name: 'Sora 2', category: 'openai', href: '/studio/text-to-video', modelId: 'openai/sora-2' },
  { name: 'Wan AI', category: 'wan', href: '/studio/text-to-video', modelId: 'Wan-AI/Wan2.2-T2V-A14B' },
  { name: 'Kling AI', category: 'kling', badge: 'NEW', href: '/studio/text-to-video', modelId: 'kwaivgI/kling-2.1-master' },
  { name: 'Hailuo', category: 'minimax', badge: 'NEW', href: '/studio/text-to-video', modelId: 'minimax/hailuo-02' },
  { name: 'PixVerse', category: 'pixverse', badge: 'NEW', href: '/studio/text-to-video', modelId: 'pixverse/pixverse-v5' },
]

function ModelBadge({ type }: { type: 'HOT' | 'NEW' }) {
  return type === 'HOT' ? (
    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-orange-500/15 text-orange-400 leading-none">
      HOT
    </span>
  ) : (
    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-purple-500/15 text-purple-400 leading-none">
      NEW
    </span>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { user, profile, isAuthenticated, isAdmin, signOut, isLoading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null }
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }, [])

  const handleEnter = useCallback(() => {
    clearTimers()
    openTimer.current = setTimeout(() => setMegaOpen(true), 100)
  }, [clearTimers])

  const handleLeave = useCallback(() => {
    clearTimers()
    closeTimer.current = setTimeout(() => setMegaOpen(false), 200)
  }, [clearTimers])

  useEffect(() => () => clearTimers(), [clearTimers])

  // Close on route change
  useEffect(() => { setMegaOpen(false); setMobileOpen(false) }, [pathname])

  return (
    <nav className="sticky top-0 z-40 border-b border-nyx-border/60 bg-nyx-bg/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <LogoFull size={28} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Studio Mega-Menu */}
            <div
              ref={megaRef}
              className="relative"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              <button className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith('/studio') || megaOpen
                  ? 'text-white bg-white/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}>
                Studio <ChevronDown className={cn('h-4 w-4 transition-transform', megaOpen && 'rotate-180')} />
              </button>

              {/* Mega-Menu Panel */}
              {megaOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                  <div className="w-[560px] rounded-xl border border-nyx-border bg-nyx-surface/95 backdrop-blur-2xl shadow-2xl shadow-black/40 animate-slide-down overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-nyx-border">
                      {/* Left: Features */}
                      <div className="p-4">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Features</p>
                        <div className="space-y-1">
                          {megaFeatures.map(({ Icon, label, desc, href }) => (
                            <Link
                              key={href}
                              href={href}
                              className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                              <div className="mt-0.5 shrink-0">
                                <Icon size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">{label}</p>
                                <p className="text-xs text-gray-500">{desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Right: Models */}
                      <div className="p-4">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Models</p>
                        {/* Image Models */}
                        <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5 mt-1">Image</p>
                        <div className="space-y-0.5 mb-3">
                          {megaImageModels.map((m) => (
                            <Link
                              key={m.name}
                              href={`${m.href}?model=${encodeURIComponent(m.modelId)}`}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors group"
                            >
                              <ModelCategoryIcon category={m.category} className="h-4 w-4 shrink-0" />
                              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{m.name}</span>
                              {m.badge && <ModelBadge type={m.badge} />}
                            </Link>
                          ))}
                        </div>
                        {/* Video Models */}
                        <p className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Video</p>
                        <div className="space-y-0.5">
                          {megaVideoModels.map((m) => (
                            <Link
                              key={m.name}
                              href={`${m.href}?model=${encodeURIComponent(m.modelId)}`}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors group"
                            >
                              <ModelCategoryIcon category={m.category} className="h-4 w-4 shrink-0" />
                              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{m.name}</span>
                              {m.badge && <ModelBadge type={m.badge} />}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/pricing"
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/pricing' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              Pricing
            </Link>

            <Link
              href="/prompts"
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/prompts' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              Inspirations
            </Link>

            <Link
              href="/affiliates"
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/affiliates' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              Affiliates
            </Link>

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith('/dashboard') ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-20 rounded-lg bg-nyx-surface animate-pulse" />
            ) : isAuthenticated ? (
              <>
                {/* Credits Display */}
                {profile && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nyx-surface border border-nyx-border">
                    <Coins className="h-4 w-4 text-primary-400" />
                    <span className="text-sm font-medium text-white">
                      {profile.creditsBalance?.toLocaleString() ?? 0}
                    </span>
                  </div>
                )}

                {/* User Menu */}
                <DropdownMenu
                  align="right"
                  trigger={
                    <button className="flex items-center gap-2">
                      <Avatar
                        src={profile?.avatarUrl}
                        fallback={profile?.fullName || user?.name || '?'}
                        size="sm"
                      />
                    </button>
                  }
                >
                  <div className="px-3 py-2 border-b border-nyx-border">
                    <p className="text-sm font-medium text-white">{profile?.fullName || user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {isAdmin && <Badge variant="default" className="mt-1">Admin</Badge>}
                  </div>
                  <DropdownItem>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/dashboard/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/dashboard/subscription" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Subscription
                    </Link>
                  </DropdownItem>
                  {isAdmin && (
                    <>
                      <DropdownSeparator />
                      <DropdownItem>
                        <Link href="/admin" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      </DropdownItem>
                    </>
                  )}
                  <DropdownSeparator />
                  <DropdownItem destructive onClick={signOut}>
                    <span className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </span>
                  </DropdownItem>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-nyx-border animate-slide-down">
            <div className="space-y-1">
              <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Studio</p>
              {studioLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                    pathname === link.href ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white'
                  )}
                >
                  <link.icon className="h-4 w-4 text-primary-400" />
                  {link.label}
                </Link>
              ))}
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
              >
                Pricing
              </Link>
              <Link
                href="/prompts"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
              >
                Inspirations
              </Link>
              <Link
                href="/affiliates"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
              >
                Affiliates
              </Link>
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
