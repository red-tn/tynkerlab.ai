'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InspirationBrowser } from '@/components/studio/prompt-maker/inspiration-browser'
import { ImageBuilder, type ImageFields } from '@/components/studio/prompt-maker/image-builder'
import { VideoBuilder, type VideoFields } from '@/components/studio/prompt-maker/video-builder'
import { SpeechBuilder, type SpeechFields } from '@/components/studio/prompt-maker/speech-builder'
import { PromptResult } from '@/components/studio/prompt-maker/prompt-result'
import { FaqSection } from '@/components/studio/prompt-maker/faq-section'
import { PromptMakerIcon } from '@/components/brand/dynamic-icons'
import { cn } from '@/lib/utils'
import { Coins, Sparkles, AlertCircle } from 'lucide-react'
import type { Prompt } from '@/types/database'

type TabType = 'image' | 'video' | 'speech'

const TABS: { key: TabType; label: string }[] = [
  { key: 'image', label: 'Image' },
  { key: 'video', label: 'Video' },
  { key: 'speech', label: 'Speech' },
]

const DEFAULT_IMAGE_FIELDS: ImageFields = {
  subject: '',
  style: '',
  lighting: '',
  camera: '',
  modifiers: [],
  details: '',
}

const DEFAULT_VIDEO_FIELDS: VideoFields = {
  subject: '',
  style: '',
  camera_motion: '',
  pacing: '',
  mood: '',
  details: '',
}

const DEFAULT_SPEECH_FIELDS: SpeechFields = {
  topic: '',
  role: '',
  goal: '',
  tone: '',
  format: '',
}

export default function PromptMakerPage() {
  const { user } = useAuth()
  const { balance, refetch: refetchCredits } = useCredits(user?.id)

  const [activeTab, setActiveTab] = useState<TabType>('image')
  const [imageFields, setImageFields] = useState<ImageFields>(DEFAULT_IMAGE_FIELDS)
  const [videoFields, setVideoFields] = useState<VideoFields>(DEFAULT_VIDEO_FIELDS)
  const [speechFields, setSpeechFields] = useState<SpeechFields>(DEFAULT_SPEECH_FIELDS)

  const [generating, setGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [generatedType, setGeneratedType] = useState<TabType>('image')
  const [generateError, setGenerateError] = useState<string | null>(null)

  const isFormValid = () => {
    if (activeTab === 'image') return imageFields.subject.trim().length > 0
    if (activeTab === 'video') return videoFields.subject.trim().length > 0
    if (activeTab === 'speech') return speechFields.topic.trim().length > 0
    return false
  }

  const getFields = (): Record<string, any> => {
    if (activeTab === 'image') return imageFields
    if (activeTab === 'video') return videoFields
    return speechFields
  }

  const handleGenerate = useCallback(async () => {
    if (!user?.id || generating) return
    setGenerating(true)
    setGenerateError(null)

    try {
      const res = await fetch('/api/generate/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          fields: getFields(),
          userId: user.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate prompt')
      }

      setGeneratedPrompt(data.prompt)
      setGeneratedType(activeTab)
      refetchCredits()
    } catch (err: any) {
      setGenerateError(err.message)
    } finally {
      setGenerating(false)
    }
  }, [user?.id, activeTab, imageFields, videoFields, speechFields, generating, refetchCredits])

  const handleInspirationSelect = (prompt: Prompt) => {
    const type = prompt.model_type === 'video' ? 'video' : 'image'
    setActiveTab(type)
    if (type === 'image') {
      setImageFields({ ...imageFields, details: prompt.prompt_text })
    } else {
      setVideoFields({ ...videoFields, details: prompt.prompt_text })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/10 flex items-center justify-center shrink-0">
          <PromptMakerIcon size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Prompt Maker</h1>
          <p className="text-sm text-gray-400 mt-1">
            Build perfect AI generation prompts with structured guidance and AI-powered composition
          </p>
        </div>
      </div>

      {/* Inspiration Browser */}
      <InspirationBrowser onSelect={handleInspirationSelect} />

      {/* Type Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-nyx-surface border border-nyx-border w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === key
                ? 'bg-primary-500/15 text-primary-300'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Builder Form */}
      <div className="rounded-xl border border-nyx-border bg-nyx-surface/30 p-5">
        {activeTab === 'image' && (
          <ImageBuilder fields={imageFields} onChange={setImageFields} />
        )}
        {activeTab === 'video' && (
          <VideoBuilder fields={videoFields} onChange={setVideoFields} />
        )}
        {activeTab === 'speech' && (
          <SpeechBuilder fields={speechFields} onChange={setSpeechFields} />
        )}
      </div>

      {/* Generate Button + Credit Cost */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={!isFormValid() || generating || !user?.id}
          loading={generating}
          className="px-6"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Prompt
        </Button>
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Coins className="h-4 w-4 text-primary-400" />
          <span>2 credits per generation</span>
          {user?.id && (
            <>
              <span className="text-gray-600 mx-1">|</span>
              <span>Balance: <span className="text-white font-mono">{balance.toLocaleString()}</span></span>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {generateError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{generateError}</p>
        </div>
      )}

      {/* Result */}
      {generatedPrompt && (
        <PromptResult
          prompt={generatedPrompt}
          type={generatedType}
          onRegenerate={handleGenerate}
          regenerating={generating}
        />
      )}

      {/* FAQ */}
      <FaqSection />
    </div>
  )
}
