'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { useGeneration } from '@/hooks/use-generation'
import {
  getModelById, getModelsForCapability, getModelResolution,
  getVideoQualityOptions, getVideoDefaultQuality, getVideoCreditsForQuality,
  getVideoDurationOptions, getVideoResolutionForQuality,
} from '@/lib/together/models'
import type { VideoQuality, ModelCapability } from '@/lib/together/models'
import { resolveTemplatePrompt } from '@/lib/templates'
import type { Template } from '@/types/database'
import { ModelSelector } from '@/components/studio/model-selector'
import { ImageUpload } from '@/components/studio/image-upload'
import { PlatformPresetPicker } from '@/components/studio/platform-preset-picker'
import { TemplateVariableInput } from '@/components/studio/template-variable-input'
import { CreditCostDisplay } from '@/components/studio/credit-cost-display'
import { GenerationResult } from '@/components/studio/generation-result'
import { DurationPicker } from '@/components/studio/duration-picker'
import { VideoQualityPicker } from '@/components/studio/video-quality-picker'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, ImageIcon, Film, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TemplateEditorPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  const { balance, refetch: refetchCredits } = useCredits(user?.id)
  const {
    state, result, error, progress, progressPercent, progressNote,
    generateImage, generateVideo, cancel, reset, isGenerating,
  } = useGeneration()

  const [template, setTemplate] = useState<Template | null>(null)
  const [loadingTemplate, setLoadingTemplate] = useState(true)
  const [model, setModel] = useState<string | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const [platform, setPlatform] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [resolvedPrompt, setResolvedPrompt] = useState('')

  // Video-specific
  const [quality, setQuality] = useState<VideoQuality>('1080p')
  const [duration, setDuration] = useState('5')

  useEffect(() => {
    if (state === 'completed' || state === 'failed') refetchCredits()
  }, [state, refetchCredits])

  // Fetch template
  useEffect(() => {
    const fetchTemplate = async () => {
      setLoadingTemplate(true)
      try {
        const res = await fetch('/api/templates')
        if (res.ok) {
          const data = await res.json()
          const t = (data.templates || []).find((t: Template) => t.slug === slug)
          if (t) {
            setTemplate(t)
            setModel(t.recommended_model)
            setAspectRatio(t.default_aspect_ratio)
            setPlatform(t.default_platform)
            // Initialize variables
            const initVars: Record<string, string> = {}
            for (const v of t.prompt_variables || []) {
              initVars[v.key] = ''
            }
            setVariables(initVars)

            // Track usage
            fetch('/api/templates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug }),
            }).catch(() => {})
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingTemplate(false)
      }
    }
    if (slug) fetchTemplate()
  }, [slug])

  // Reset video options on model change
  useEffect(() => {
    if (!model || !template || template.generation_type !== 'video') return
    const defaultQ = getVideoDefaultQuality(model)
    setQuality(defaultQ)
    const durationOpts = getVideoDurationOptions(model)
    if (!durationOpts.find(d => d.value === duration)) {
      setDuration(durationOpts[0]?.value || '5')
    }
  }, [model])

  // Update resolved prompt when variables change
  useEffect(() => {
    if (!template) return
    const { prompt } = resolveTemplatePrompt(template.base_prompt, variables, photoUrls)
    setResolvedPrompt(prompt)
  }, [template, variables, photoUrls])

  const modelData = model ? getModelById(model) : null

  // Determine capability for model selector
  const capability: ModelCapability = useMemo(() => {
    if (!template) return 'image-to-image'
    return template.generation_type === 'video' ? 'image-to-video' : 'image-to-image'
  }, [template])

  // Compute cost
  const cost = useMemo(() => {
    if (template?.credits_override) return template.credits_override
    if (!model) return 0
    if (template?.generation_type === 'video') {
      return getVideoCreditsForQuality(model, quality, parseInt(duration))
    }
    return modelData?.credits ?? 0
  }, [model, template, modelData, quality, duration])

  // Resolution
  const resolution = useMemo(() => {
    if (!model) return { w: 1024, h: 1024 }
    if (template?.generation_type === 'video') {
      return getVideoResolutionForQuality(model, quality, aspectRatio)
    }
    return getModelResolution(model, aspectRatio)
  }, [model, aspectRatio, template, quality])

  // Video options
  const qualityOptions = model ? getVideoQualityOptions(model) : []
  const durationOptions = model ? getVideoDurationOptions(model) : []

  // Check if required fields are filled
  const requiredVariablesFilled = template?.prompt_variables
    .filter(v => v.required)
    .every(v => variables[v.key]?.trim()) ?? true

  const requiredPhotosFilled = template?.photo_slots
    .filter(s => s.required)
    .every(s => photoUrls[s.key]) ?? true

  const canGenerate = model && resolvedPrompt.trim() && requiredPhotosFilled && requiredVariablesFilled && !isGenerating && balance >= cost && user

  const handleGenerate = () => {
    if (!model || !resolvedPrompt.trim() || !user || !template) return

    const { imageUrl } = resolveTemplatePrompt(template.base_prompt, variables, photoUrls)

    if (template.generation_type === 'video') {
      generateVideo({
        model,
        prompt: resolvedPrompt.trim(),
        imageUrl: imageUrl || undefined,
        type: 'image-to-video',
        userId: user.id,
        duration: parseInt(duration),
        aspectRatio,
        quality,
        width: resolution.w,
        height: resolution.h,
      })
    } else {
      generateImage({
        model,
        prompt: resolvedPrompt.trim(),
        width: resolution.w,
        height: resolution.h,
        imageUrl: imageUrl || undefined,
        type: imageUrl ? 'image-to-image' : 'text-to-image',
        userId: user.id,
        aspectRatio,
      } as any)
    }
  }

  if (loadingTemplate) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="max-w-7xl mx-auto text-center py-20">
        <p className="text-gray-400 mb-4">Template not found</p>
        <Link href="/studio/templates">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Templates
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back link */}
      <Link href="/studio/templates" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Templates
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">{template.name}</h1>
          <Badge variant={template.generation_type === 'video' ? 'info' : 'default'}>
            {template.generation_type === 'video' ? <Film className="h-3 w-3 mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
            {template.generation_type}
          </Badge>
          <Badge>{template.category}</Badge>
        </div>
        <p className="text-sm text-gray-400">{template.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          {/* Model selector */}
          <ModelSelector
            capability={capability}
            selectedModel={model}
            onModelSelect={setModel}
            disabled={isGenerating}
          />

          {/* Photo uploads */}
          {template.photo_slots.map(slot => (
            <div key={slot.key} className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">
                {slot.label}
                {slot.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <p className="text-xs text-gray-500 mb-1">{slot.description}</p>
              <ImageUpload
                onUpload={(url) => setPhotoUrls(prev => ({ ...prev, [slot.key]: url }))}
                currentImage={photoUrls[slot.key] || null}
                onClear={() => setPhotoUrls(prev => {
                  const next = { ...prev }
                  delete next[slot.key]
                  return next
                })}
                disabled={isGenerating}
              />
            </div>
          ))}

          {/* Variable inputs */}
          {template.prompt_variables.map(v => (
            <TemplateVariableInput
              key={v.key}
              variable={v}
              value={variables[v.key] || ''}
              onChange={(val) => setVariables(prev => ({ ...prev, [v.key]: val }))}
              disabled={isGenerating}
            />
          ))}

          {/* Platform presets */}
          {template.platform_presets.length > 0 && (
            <PlatformPresetPicker
              presets={template.platform_presets}
              selected={platform}
              onSelect={(p, ar) => { setPlatform(p); setAspectRatio(ar) }}
              disabled={isGenerating}
            />
          )}

          {/* Video options */}
          {template.generation_type === 'video' && model && (
            <>
              {qualityOptions.length > 1 && (
                <VideoQualityPicker
                  options={qualityOptions}
                  value={quality}
                  onChange={setQuality}
                  modelId={model}
                  duration={parseInt(duration)}
                  disabled={isGenerating}
                />
              )}
              {durationOptions.length > 0 && (
                <DurationPicker
                  options={durationOptions}
                  value={duration}
                  onChange={setDuration}
                  disabled={isGenerating}
                />
              )}
            </>
          )}

          {/* Resolved prompt preview */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">Prompt Preview</label>
            <textarea
              value={resolvedPrompt}
              onChange={(e) => setResolvedPrompt(e.target.value)}
              disabled={isGenerating}
              className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[80px] font-mono disabled:opacity-50"
            />
            <p className="text-[10px] text-gray-600">You can edit this prompt before generating</p>
          </div>

          {/* Cost & Generate */}
          <CreditCostDisplay cost={cost} balance={balance} />

          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : `Generate ${template.generation_type === 'video' ? 'Video' : 'Image'}`}
          </Button>
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
            onCancel={template.generation_type === 'video' ? cancel : undefined}
          />
        </div>
      </div>
    </div>
  )
}
