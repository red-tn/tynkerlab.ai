'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { useGeneration } from '@/hooks/use-generation'
import { getModelById, getDefaultModel, getModelResolution } from '@/lib/together/models'
import { ModelSelector } from '@/components/studio/model-selector'
import { PromptInput } from '@/components/studio/prompt-input'
import { AspectRatioPicker } from '@/components/studio/aspect-ratio-picker'
import { CreditCostDisplay } from '@/components/studio/credit-cost-display'
import { GenerationResult } from '@/components/studio/generation-result'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CollapsibleSection } from '@/components/studio/collapsible-section'
import { Sparkles, Settings2, Ratio, Monitor, Cpu } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'

export default function TextToImagePage() {
  const { user } = useAuth()
  const { balance, refetch: refetchCredits } = useCredits(user?.id)
  const { state, result, error, progress, generateImage, reset, isGenerating } = useGeneration()

  useEffect(() => {
    if (state === 'completed' || state === 'failed') refetchCredits()
  }, [state, refetchCredits])
  const searchParams = useSearchParams()

  const [model, setModel] = useState<string | null>(getDefaultModel('text-to-image'))
  const [prompt, setPrompt] = useState('')

  // Pre-fill prompt and model from URL query params
  useEffect(() => {
    const urlPrompt = searchParams.get('prompt')
    if (urlPrompt) setPrompt(urlPrompt)
    const urlModel = searchParams.get('model')
    if (urlModel) setModel(urlModel)
  }, [searchParams])
  const [negativePrompt, setNegativePrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [steps, setSteps] = useState('')
  const [seed, setSeed] = useState('')

  const modelData = model ? getModelById(model) : null
  const cost = modelData?.credits ?? 0

  // Auto-compute resolution from model + aspect ratio
  const resolution = model ? getModelResolution(model, aspectRatio) : { w: 1024, h: 1024 }

  const handleGenerate = () => {
    if (!model || !prompt.trim() || !user) return
    generateImage({
      model,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      width: resolution.w,
      height: resolution.h,
      steps: steps ? parseInt(steps) : undefined,
      seed: seed ? parseInt(seed) : undefined,
      type: 'text-to-image',
      userId: user.id,
      aspectRatio,
    } as any)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Text to Image</h1>
        <p className="text-sm text-gray-400 mt-1">Generate images from text descriptions using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-32 lg:pb-0">
        {/* Controls */}
        <div className="space-y-4">
          <CollapsibleSection title="AI Model" icon={<Cpu className="h-4 w-4" />}>
            <ModelSelector
              capability="text-to-image"
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
            userId={user?.id}
            showNegativePrompt={modelData?.supportsNegativePrompt ?? false}
          />

          <CollapsibleSection title="Aspect Ratio" icon={<Ratio className="h-4 w-4" />}>
            <AspectRatioPicker
              value={aspectRatio}
              onChange={setAspectRatio}
              disabled={isGenerating}
            />

            {/* Auto-selected resolution display */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nyx-bg/50 border border-nyx-border/50">
              <Monitor className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-400">Resolution</span>
              <span className="text-sm font-mono text-white ml-auto">{resolution.w} × {resolution.h}</span>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Advanced Settings" icon={<Settings2 className="h-4 w-4" />} defaultOpen={false}>
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
              Generate Image
            </Button>
          </div>
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
            Generate Image
          </Button>
        </div>
      </div>
    </div>
  )
}
