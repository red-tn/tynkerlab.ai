'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { useGeneration } from '@/hooks/use-generation'
import { getModelById, getDefaultModel, getModelResolution } from '@/lib/together/models'
import { ModelSelector } from '@/components/studio/model-selector'
import { PromptInput } from '@/components/studio/prompt-input'
import { ImageUpload } from '@/components/studio/image-upload'
import { AspectRatioPicker } from '@/components/studio/aspect-ratio-picker'
import { CreditCostDisplay } from '@/components/studio/credit-cost-display'
import { GenerationResult } from '@/components/studio/generation-result'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Settings2, ChevronDown, ChevronUp, Monitor } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'

export default function ImageToImagePage() {
  const { user } = useAuth()
  const { balance, refetch: refetchCredits } = useCredits(user?.$id)
  const { state, result, error, progress, generateImage, reset, isGenerating } = useGeneration()

  useEffect(() => {
    if (state === 'completed' || state === 'failed') refetchCredits()
  }, [state, refetchCredits])
  const searchParams = useSearchParams()

  const [model, setModel] = useState<string | null>(getDefaultModel('image-to-image'))
  const [prompt, setPrompt] = useState('')

  useEffect(() => {
    const urlModel = searchParams.get('model')
    if (urlModel) {
      const m = getModelById(urlModel)
      if (m && m.supportsImageUrl) setModel(urlModel)
    }
    const urlPrompt = searchParams.get('prompt')
    if (urlPrompt) setPrompt(urlPrompt)
  }, [searchParams])
  const [negativePrompt, setNegativePrompt] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [steps, setSteps] = useState('')
  const [seed, setSeed] = useState('')

  const modelData = model ? getModelById(model) : null
  const cost = modelData?.credits ?? 0

  // Auto-compute resolution from model + aspect ratio
  const resolution = model ? getModelResolution(model, aspectRatio) : { w: 1024, h: 1024 }

  const handleGenerate = () => {
    if (!model || !prompt.trim() || !imageUrl || !user) return
    generateImage({
      model,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      width: resolution.w,
      height: resolution.h,
      steps: steps ? parseInt(steps) : undefined,
      seed: seed ? parseInt(seed) : undefined,
      imageUrl,
      type: 'image-to-image',
      userId: user.$id,
      aspectRatio,
    } as any)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Image to Image</h1>
        <p className="text-sm text-gray-400 mt-1">Transform existing images with AI-powered modifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <ModelSelector
            capability="image-to-image"
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
            userId={user?.$id}
          />

          <AspectRatioPicker
            value={aspectRatio}
            onChange={setAspectRatio}
            disabled={isGenerating}
          />

          {/* Auto-selected resolution display */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border">
            <Monitor className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-400">Resolution</span>
            <span className="text-sm font-mono text-white ml-auto">{resolution.w} × {resolution.h}</span>
          </div>

          {/* Advanced Settings */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            <Settings2 className="h-4 w-4" />
            Advanced Settings
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showAdvanced && (
            <div className="space-y-4 animate-slide-down">
              <Input
                label="Steps"
                labelExtra={<InfoTooltip text="Number of refinement passes. Higher = more detail but slower. Leave on Auto for the model's recommended value." />}
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder={modelData?.defaultSteps?.toString() || 'Auto'}
                helperText="Number of inference steps (higher = more detail, slower)"
                disabled={isGenerating}
              />
              <Input
                label="Seed"
                labelExtra={<InfoTooltip text="A number that makes generation reproducible. Same seed + same settings = same output. Leave blank for random." />}
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Random"
                helperText="Use a specific seed for reproducible results"
                disabled={isGenerating}
              />
            </div>
          )}

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
            Transform Image
          </Button>
        </div>

        {/* Result */}
        <div>
          <GenerationResult
            state={state}
            result={result}
            error={error}
            progress={progress}
            onRetry={handleGenerate}
          />
        </div>
      </div>
    </div>
  )
}
