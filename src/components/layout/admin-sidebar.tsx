'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/dynamic-icons'
import {
  LayoutDashboard, Users, CreditCard, MessageSquare,
  Activity, BarChart3, Settings, ArrowLeft, Home, FileText, Volume2, Handshake, Inbox, Share2, Palette,
  Menu, X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/homepage', label: 'Homepage', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/prompts', label: 'Inspirations', icon: MessageSquare },
  { href: '/admin/submissions', label: 'Submissions', icon: Inbox },
  { href: '/admin/voices', label: 'Voices', icon: Volume2 },
  { href: '/admin/affiliates', label: 'Affiliates', icon: Handshake },
  { href: '/admin/social', label: 'Social Media', icon: Share2 },
  { href: '/admin/brand', label: 'Brand Assets', icon: Palette },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/monitoring', label: 'Monitoring', icon: Activity },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <div className="p-4 border-b border-nyx-border">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="text-sm font-bold text-white">Admin</span>
        </div>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-500/10 text-white border border-primary-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-nyx-border">
        <Link
          href="/dashboard"
          onClick={onNavClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Site
        </Link>
      </div>
    </>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-nyx-surface/95 backdrop-blur-sm border-b border-nyx-border flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo size={20} />
        <span className="text-sm font-bold text-white">Admin</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen bg-nyx-surface/90 backdrop-blur-sm border-r border-nyx-border flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute top-0 left-0 bottom-0 w-64 bg-nyx-surface border-r border-nyx-border flex flex-col animate-slide-in-left">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNavClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
