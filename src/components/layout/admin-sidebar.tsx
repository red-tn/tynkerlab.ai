'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'
import {
  LayoutDashboard, Users, CreditCard, MessageSquare,
  Activity, BarChart3, Settings, ArrowLeft, Home, FileText, Volume2, Handshake, Inbox, Share2, Palette,
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

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-nyx-surface/90 backdrop-blur-sm border-r border-nyx-border flex flex-col">
      <div className="p-4 border-b border-nyx-border">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="text-sm font-bold text-white">Admin</span>
        </div>
      </div>

      <nav className="flex-1 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
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
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Site
        </Link>
      </div>
    </aside>
  )
}
