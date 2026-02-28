'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { useGeneration } from '@/hooks/use-generation'
import { getModelById, getDefaultModel } from '@/lib/together/models'
import { ModelSelector } from '@/components/studio/model-selector'
import { PromptInput } from '@/components/studio/prompt-input'
import { AspectRatioPicker } from '@/components/studio/aspect-ratio-picker'
import { DurationPicker } from '@/components/studio/duration-picker'
import { CreditCostDisplay } from '@/components/studio/credit-cost-display'
import { GenerationResult } from '@/components/studio/generation-result'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function TextToVideoPage() {
  const { user } = useAuth()
  const { balance, refetch: refetchCredits } = useCredits(user?.$id)
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
  const [duration, setDuration] = useState('5')

  const modelData = model ? getModelById(model) : null
  const cost = modelData?.credits ?? 0

  const handleGenerate = () => {
    if (!model || !prompt.trim() || !user) return
    generateVideo({
      model,
      prompt: prompt.trim(),
      type: 'text-to-video',
      userId: user.$id,
      duration: parseInt(duration),
      aspectRatio,
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Text to Video</h1>
        <p className="text-sm text-gray-400 mt-1">Create videos from text descriptions using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <ModelSelector
            capability="text-to-video"
            selectedModel={model}
            onModelSelect={setModel}
            disabled={isGenerating}
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
