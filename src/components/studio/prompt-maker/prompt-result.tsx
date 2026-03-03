'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Copy, Check, ArrowRight, RefreshCw } from 'lucide-react'

interface PromptResultProps {
  prompt: string
  type: 'image' | 'video' | 'speech'
  onRegenerate: () => void
  regenerating: boolean
}

const STUDIO_ROUTES: Record<string, string> = {
  image: '/studio/text-to-image',
  video: '/studio/text-to-video',
  speech: '/studio/text-to-speech',
}

export function PromptResult({ prompt, type, onRegenerate, regenerating }: PromptResultProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUseInStudio = () => {
    const route = STUDIO_ROUTES[type] || STUDIO_ROUTES.image
    router.push(`${route}?prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <div className="rounded-xl border border-primary-500/20 bg-nyx-surface/50 p-5 animate-slide-down">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Generated Prompt</h3>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{type}</span>
      </div>

      <div className="rounded-lg bg-nyx-bg/80 border border-nyx-border p-4 mb-4">
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{prompt}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
        <Button size="sm" onClick={handleUseInStudio}>
          <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
          Use in Studio
        </Button>
        <Button variant="ghost" size="sm" onClick={onRegenerate} loading={regenerating}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Regenerate
        </Button>
      </div>
    </div>
  )
}
