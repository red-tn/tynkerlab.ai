'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { useGeneration } from '@/hooks/use-generation'
import { getModelById, getDefaultModel } from '@/lib/together/models'
import { ModelSelector } from '@/components/studio/model-selector'
import { PromptInput } from '@/components/studio/prompt-input'
import { ImageUpload } from '@/components/studio/image-upload'
import { AspectRatioPicker } from '@/components/studio/aspect-ratio-picker'
import { DurationPicker } from '@/components/studio/duration-picker'
import { CreditCostDisplay } from '@/components/studio/credit-cost-display'
import { GenerationResult } from '@/components/studio/generation-result'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function ImageToVideoPage() {
  const { user } = useAuth()
  const { balance, refetch: refetchCredits } = useCredits(user?.$id)
  const { state, result, error, progress, progressPercent, progressNote, generateVideo, cancel, reset, isGenerating } = useGeneration()

  useEffect(() => {
    if (state === 'completed' || state === 'failed') refetchCredits()
  }, [state, refetchCredits])
  const searchParams = useSearchParams()

  const [model, setModel] = useState<string | null>(getDefaultModel('image-to-video'))
  const [prompt, setPrompt] = useState('')

  useEffect(() => {
    const urlModel = searchParams.get('model')
    if (urlModel) {
      const m = getModelById(urlModel)
      if (m && m.supportsFrameImages) setModel(urlModel)
    }
    const urlPrompt = searchParams.get('prompt')
    if (urlPrompt) setPrompt(urlPrompt)
  }, [searchParams])
  const [negativePrompt, setNegativePrompt] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [duration, setDuration] = useState('5')

  const modelData = model ? getModelById(model) : null
  const cost = modelData?.credits ?? 0

  const handleGenerate = () => {
    if (!model || !prompt.trim() || !imageUrl || !user) return
    generateVideo({
      model,
      prompt: prompt.trim(),
      imageUrl,
      type: 'image-to-video',
      userId: user.$id,
      duration: parseInt(duration),
      aspectRatio,
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Image to Video</h1>
        <p className="text-sm text-gray-400 mt-1">Animate images into videos using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <ModelSelector
            capability="image-to-video"
            selectedModel={model}
            onModelSelect={setModel}
            disabled={isGenerating}
          />

          <ImageUpload
            onUpload={setImageUrl}
            currentImage={imageUrl}
            onClear={() => setImageUrl(null)}
            disabled={isGenerating}
            onAspectRatioDetected={setAspectRatio}
          />

          <PromptInput
            prompt={prompt}
            onPromptChange={setPrompt}
            negativePrompt={negativePrompt}
            onNegativePromptChange={setNegativePrompt}
            disabled={isGenerating}
            generationType="video"
            userId={user?.$id}
          />

          <AspectRatioPicker
            value={aspectRatio}
            onChange={setAspectRatio}
            disabled={isGenerating}
          />

          <DurationPicker
            value={duration}
            onChange={setDuration}
            disabled={isGenerating}
          />

          {model && (
            <CreditCostDisplay cost={cost} balance={balance} />
          )}

          <Button
            onClick={handleGenerate}
            disabled={!model || !prompt.trim() || !imageUrl || isGenerating || balance < cost}
            loading={isGenerating}
            className="w-full"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Animate Image
          </Button>

          {isGenerating && (
            <div className="rounded-lg bg-primary-500/5 border border-primary-500/20 p-3">
              <p className="text-xs text-gray-400">
                Video generation typically takes 2–5 minutes. Premium models (Veo 3.0, Sora 2 Pro) may take longer.
                You can stay on this page — the result will appear automatically.
              </p>
            </div>
          )}
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
    </div>
  )
}
