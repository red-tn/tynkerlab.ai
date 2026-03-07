'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  TextToImageIcon,
  ImageToImageIcon,
  TextToVideoIcon,
  ImageToVideoIcon,
  UGCAvatarIcon,
  PromptMakerIcon,
  TextToSpeechIcon,
} from '@/components/brand/dynamic-icons'
import { LayoutTemplate } from 'lucide-react'

const tools = [
  { href: '/studio/text-to-image', label: 'Text to Image', shortLabel: 'Txt2Img', Icon: TextToImageIcon },
  { href: '/studio/image-to-image', label: 'Image to Image', shortLabel: 'Img2Img', Icon: ImageToImageIcon },
  { href: '/studio/text-to-video', label: 'Text to Video', shortLabel: 'Txt2Vid', Icon: TextToVideoIcon },
  { href: '/studio/image-to-video', label: 'Image to Video', shortLabel: 'Img2Vid', Icon: ImageToVideoIcon },
  { href: '/studio/ugc-avatar', label: 'UGC Avatar', shortLabel: 'Avatar', Icon: UGCAvatarIcon },
  { href: '/studio/templates', label: 'Templates', shortLabel: 'Templates', Icon: LayoutTemplate as any },
  { href: '/studio/prompt-maker', label: 'Prompt Maker', shortLabel: 'Prompts', Icon: PromptMakerIcon },
  { href: '/studio/text-to-speech', label: 'Text to Speech', shortLabel: 'TTS', Icon: TextToSpeechIcon },
]

export function MobileStudioNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-nyx-border backdrop-blur-xl bg-[#0a0a0f]/90"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex overflow-x-auto scrollbar-none">
        {tools.map(({ href, shortLabel, Icon }) => {
          const isActive = pathname === href

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 min-w-[4.5rem] flex-shrink-0 px-2 py-2.5 transition-colors',
                isActive
                  ? 'text-white'
                  : 'text-gray-500 active:text-gray-300'
              )}
            >
              {/* Gradient top indicator for active item */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                  aria-hidden="true"
                />
              )}

              <span className={cn(
                'transition-colors',
                isActive ? 'text-white' : 'text-gray-500'
              )}>
                <Icon size={24} />
              </span>

              <span className={cn(
                'text-[10px] leading-tight font-medium whitespace-nowrap',
                isActive
                  ? 'bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent'
                  : 'text-gray-500'
              )}>
                {shortLabel}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
