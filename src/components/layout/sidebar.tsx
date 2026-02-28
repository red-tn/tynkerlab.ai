'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { TextToImageIcon, ImageToImageIcon, TextToVideoIcon, ImageToVideoIcon, TextToSpeechIcon } from '@/components/brand/studio-icons'
import { Coins, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const tools = [
  { href: '/studio/text-to-image', label: 'Text to Image', Icon: TextToImageIcon },
  { href: '/studio/image-to-image', label: 'Image to Image', Icon: ImageToImageIcon },
  { href: '/studio/text-to-video', label: 'Text to Video', Icon: TextToVideoIcon },
  { href: '/studio/image-to-video', label: 'Image to Video', Icon: ImageToVideoIcon },
  { href: '/studio/text-to-speech', label: 'Text to Speech', Icon: TextToSpeechIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { balance } = useCredits(user?.$id)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      'hidden lg:flex flex-col border-r border-nyx-border bg-nyx-surface/90 backdrop-blur-sm transition-all duration-300',
      collapsed ? 'w-16' : 'w-56'
    )}>
      <div className="flex-1 py-4 space-y-1">
        {tools.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary-500/10 text-white border border-primary-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </div>
      <Link href="/dashboard/credits" className="block p-4 border-t border-nyx-border hover:bg-white/5 transition-colors">
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          <Coins className="h-4 w-4 text-primary-400 shrink-0" />
          {!collapsed && (
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Credits</span>
                <span className="text-white font-mono">{balance.toLocaleString()}</span>
              </div>
              <Progress value={Math.min(balance, 1000)} max={1000} size="sm" className="mt-1.5" />
            </div>
          )}
        </div>
      </Link>
      <button onClick={() => setCollapsed(!collapsed)} className="p-3 border-t border-nyx-border text-gray-500 hover:text-white transition-colors flex justify-center">
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}
