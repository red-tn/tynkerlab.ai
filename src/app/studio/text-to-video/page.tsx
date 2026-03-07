'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { useGeneration } from '@/hooks/use-generation'
import {
  getModelById, getDefaultModel, getVideoQualityOptions, getVideoDefaultQuality,
  getVideoCreditsForQuality, getVideoDurationOptions, getVideoCameraMotionOptions,
  getVideoResolutionForQuality,
} from '@/lib/together/models'
import type { VideoQuality } from '@/lib/together/models'
import { ModelSelector } from '@/components/studio/model-selector'
import { PromptInput } from '@/components/studio/prompt-input'
import { AspectRatioPicker } from '@/components/studio/aspect-ratio-picker'
import { DurationPicker } from '@/components/studio/duration-picker'
import { VideoQualityPicker } from '@/components/studio/video-quality-picker'
import { SeedInput } from '@/components/studio/seed-input'
import { CameraMotionPicker } from '@/components/studio/camera-motion-picker'
import { CreditCostDisplay } from '@/components/studio/credit-cost-display'
import { GenerationResult } from '@/components/studio/generation-result'
import { CollapsibleSection } from '@/components/studio/collapsible-section'
import { Button } from '@/components/ui/button'
import { Sparkles, Monitor, Cpu, Ratio, Settings2 } from 'lucide-react'

export default function TextToVideoPage() {
  const { user } = useAuth()
  const { balance, refetch: refetchCredits } = useCredits(user?.id)
  const { state, result, error, progress, progressPercent, progressNote, generateVideo, cancel, reset, isGenerating } = useGeneration()

  useEffect(() => {
    if (state === 'completed' || state === 'failed') refetchCredits()
  }, [state, refetchCredits])
  const searchParams = useSearchParams()

  const [model, setModel] = useState<string | null>(getDefaultModel('text-to-video'))
  const [prompt, setPrompt] = useState('')

  // Pre-fill prompt and model from URL query params
  useEffect(() => {
    const urlPrompt = searchParams.get('prompt')
    if (urlPrompt) setPrompt(urlPrompt)
    const urlModel = searchParams.get('model')
    if (urlModel) setModel(urlModel)
  }, [searchParams])
  const [negativePrompt, setNegativePrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [duration, setDuration] = useState(() => {
    const defaultModel = getDefaultModel('text-to-video')
    const opts = getVideoDurationOptions(defaultModel)
    return opts[0]?.value || '5'
  })
  const [quality, setQuality] = useState<VideoQuality>('720p')
  const [seed, setSeed] = useState('')
  const [cameraMotion, setCameraMotion] = useState('')

  // Reset options when model changes
  useEffect(() => {
    if (!model) return
    const defaultQ = getVideoDefaultQuality(model)
    setQuality(defaultQ)
    const durationOpts = getVideoDurationOptions(model)
    if (!durationOpts.find(d => d.value === duration)) {
      setDuration(durationOpts[0]?.value || '5')
    }
    const md = getModelById(model)
    if (md?.aspectRatios && !md.aspectRatios.includes(aspectRatio)) {
      setAspectRatio(md.aspectRatios[0] || '16:9')
    }
    setCameraMotion('')
  }, [model])

  const modelData = model ? getModelById(model) : null
  const qualityOptions = model ? getVideoQualityOptions(model) : ['720p' as VideoQuality]
  const durationOptions = model ? getVideoDurationOptions(model) : []
  const cameraOptions = model ? getVideoCameraMotionOptions(model) : null
  const cost = model ? getVideoCreditsForQuality(model, quality, parseInt(duration)) : 0
  const resolution = model ? getVideoResolutionForQuality(model, quality, aspectRatio) : { w: 1280, h: 720 }

  const handleGenerate = () => {
    if (!model || !prompt.trim() || !user) return
    generateVideo({
      model,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      type: 'text-to-video',
      userId: user.id,
      duration: parseInt(duration),
      aspectRatio,
      quality,
      seed: seed ? parseInt(seed) : undefined,
      cameraMotion: cameraMotion || undefined,
      width: resolution.w,
      height: resolution.h,
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Text to Video</h1>
        <p className="text-sm text-gray-400 mt-1">Create videos from text descriptions using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-32 lg:pb-0">
        {/* Controls */}
        <div className="space-y-4">
          <CollapsibleSection title="AI Model" icon={<Cpu className="h-4 w-4" />}>
            <ModelSelector
              capability="text-to-video"
              selectedModel={model}
              onModelSelect={setModel}
              disabled={isGenerating}
            />
          </CollapsibleSection>

          <PromptInput
            prompt={prompt}
            onPromptChange={setPrompt}
            negativePrompt={negativePrompt}
            onNegativePromptChange={setNegativePrompt}
            disabled={isGenerating}
            generationType="video"
            userId={user?.id}
            showNegativePrompt={modelData?.supportsNegativePrompt ?? false}
          />

          <CollapsibleSection title="Aspect Ratio & Quality" icon={<Ratio className="h-4 w-4" />}>
            <AspectRatioPicker
              value={aspectRatio}
              onChange={setAspectRatio}
              disabled={isGenerating}
              allowedRatios={modelData?.aspectRatios}
            />

            <VideoQualityPicker
              value={quality}
              onChange={setQuality}
              options={qualityOptions}
              modelId={model}
              disabled={isGenerating}
              duration={parseInt(duration)}
            />

            <DurationPicker
              value={duration}
              onChange={setDuration}
              disabled={isGenerating}
              options={durationOptions}
            />

            {/* Resolution display */}
            {model && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nyx-bg/50 border border-nyx-border/50">
                <Monitor className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">Resolution</span>
                <span className="text-sm font-mono text-white ml-auto">{resolution.w} × {resolution.h}</span>
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Advanced Settings" icon={<Settings2 className="h-4 w-4" />} defaultOpen={false}>
            {cameraOptions && (
              <CameraMotionPicker
                value={cameraMotion}
                onChange={setCameraMotion}
                options={cameraOptions}
                disabled={isGenerating}
              />
            )}

            <SeedInput
              value={seed}
              onChange={setSeed}
              disabled={isGenerating}
            />
          </CollapsibleSection>

          {/* Desktop-only: inline credit cost + generate */}
          <div className="hidden lg:block space-y-4">
            {model && (
              <CreditCostDisplay cost={cost} balance={balance} />
            )}

            <Button
              onClick={handleGenerate}
              disabled={!model || !prompt.trim() || isGenerating || balance < cost}
              loading={isGenerating}
              className="w-full"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Video
            </Button>

            {isGenerating && (
              <div className="rounded-lg bg-primary-500/5 border border-primary-500/20 p-3">
                <p className="text-xs text-gray-400">
                  Video generation typically takes 2-5 minutes. Premium models (Veo 3.0, Sora 2 Pro) may take longer.
                  You can stay on this page -- the result will appear automatically.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        <div>
          <GenerationResult
            state={state}
            result={result}
            error={error}
            progress={progress}
            progressPercent={progressPercent}
            progressNote={progressNote}
            onRetry={handleGenerate}
            onCancel={cancel}
          />
        </div>
      </div>

      {/* Mobile sticky generate bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden backdrop-blur-xl bg-[#0a0a0f]/80 border-t border-nyx-border">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {model && (
            <CreditCostDisplay cost={cost} balance={balance} />
          )}
          <Button
            onClick={handleGenerate}
            disabled={!model || !prompt.trim() || isGenerating || balance < cost}
            loading={isGenerating}
            className="w-full"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Video
          </Button>
        </div>
      </div>
    </div>
  )
}
