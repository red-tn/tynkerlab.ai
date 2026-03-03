'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { getEnabledModels, type AIModel, type ModelCategory } from '@/lib/together/models'
import { TTS_MODEL_FAMILIES } from '@/lib/together/tts'
import { ModelCategoryIcon } from '@/components/studio/model-icons'
import { TextToImageIcon, TextToVideoIcon, TextToSpeechIcon, UGCAvatarIcon } from '@/components/brand/dynamic-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Coins, Volume2, ChevronDown, Image, Film, Mic, User, Camera, Waves, Clock, Monitor } from 'lucide-react'

type TabKey = 'image' | 'video' | 'speech' | 'ugc'

interface CategoryGroup {
  category: ModelCategory
  label: string
  models: AIModel[]
  minCredits: number
  maxCredits: number
}

function groupByCategory(models: AIModel[]): CategoryGroup[] {
  const map = new Map<ModelCategory, AIModel[]>()
  for (const m of models) {
    const arr = map.get(m.category) || []
    arr.push(m)
    map.set(m.category, arr)
  }
  return Array.from(map.entries()).map(([category, models]) => ({
    category,
    label: models[0].categoryLabel,
    models,
    minCredits: Math.min(...models.map(m => m.credits)),
    maxCredits: Math.max(...models.map(m => m.credits)),
  }))
}

function getCapabilityTags(models: AIModel[]): string[] {
  const caps = new Set<string>()
  for (const m of models) {
    for (const c of m.capabilities) caps.add(c)
    if (m.supportsImageUrl) caps.add('image-input')
    if (m.supportsNegativePrompt) caps.add('negative-prompt')
    if (m.hasAudio) caps.add('audio')
    if (m.supportsFrameImages) caps.add('frame-images')
    if (m.supportsCameraMotion) caps.add('camera-motion')
  }
  return Array.from(caps)
}

const CAP_LABELS: Record<string, string> = {
  'text-to-image': 'Text to Image',
  'image-to-image': 'Image to Image',
  'text-to-video': 'Text to Video',
  'image-to-video': 'Image to Video',
  'image-input': 'Image Input',
  'negative-prompt': 'Negative Prompt',
  'audio': 'Audio Generation',
  'frame-images': 'Frame Images',
  'camera-motion': 'Camera Motion',
}

function getStudioHref(model: AIModel): string {
  if (model.type === 'image') {
    const isI2I = model.capabilities.includes('image-to-image') && !model.capabilities.includes('text-to-image')
    return isI2I ? '/studio/image-to-image' : '/studio/text-to-image'
  }
  const isI2V = model.capabilities.includes('image-to-video') && !model.capabilities.includes('text-to-video')
  return isI2V ? '/studio/image-to-video' : '/studio/text-to-video'
}

// ---------------------------------------------------------------------------
// Provider Card (accordion)
// ---------------------------------------------------------------------------

function ProviderCard({ group, type }: { group: CategoryGroup; type: 'image' | 'video' }) {
  const [open, setOpen] = useState(false)
  const creditRange = group.minCredits === group.maxCredits
    ? `${group.minCredits}`
    : `${group.minCredits}–${group.maxCredits}`

  return (
    <div className="rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden transition-all duration-200 hover:border-primary-500/20">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <ModelCategoryIcon category={group.category} className="h-6 w-6 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white text-sm">{group.label}</span>
            <Badge variant="outline" className="text-[10px]">{group.models.length} {type === 'image' ? 'models' : 'models'}</Badge>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Coins className="h-3 w-3 text-primary-400" />
            <span className="text-xs text-gray-500">{creditRange} credits</span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-nyx-border px-4 pb-4 pt-2 space-y-2">
          {group.models.map(model => (
            <Link
              key={model.id}
              href={getStudioHref(model)}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group/model"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-200 group-hover/model:text-white transition-colors">{model.displayName}</span>
                  {model.badge && (
                    <Badge variant={model.badge === 'NEW' ? 'info' : model.badge === 'CHEAPEST' ? 'success' : 'default'} className="text-[9px]">
                      {model.badge}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {model.capabilities.map(cap => (
                    <span key={cap} className="text-[10px] text-gray-600">{CAP_LABELS[cap] || cap}</span>
                  ))}
                  {model.hasAudio && <span className="text-[10px] text-primary-400">+ Audio</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Coins className="h-3 w-3 text-primary-400" />
                <span className="text-xs font-medium text-gray-400">{model.credits}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-gray-600 group-hover/model:text-primary-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Feature badges for a model type
// ---------------------------------------------------------------------------

function FeatureBadges({ models }: { models: AIModel[] }) {
  const tags = getCapabilityTags(models)
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary-500/5 border border-primary-500/10 px-3 py-1 text-[11px] text-primary-300">
          {CAP_LABELS[tag] || tag}
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Image / Video Tab Content
// ---------------------------------------------------------------------------

function ModelGrid({ type }: { type: 'image' | 'video' }) {
  const models = useMemo(() => getEnabledModels(type), [type])
  const groups = useMemo(() => groupByCategory(models), [models])

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => (
          <ProviderCard key={group.category} group={group} type={type} />
        ))}
      </div>
      <FeatureBadges models={models} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Speech Tab Content
// ---------------------------------------------------------------------------

function SpeechContent() {
  const totalVoices = TTS_MODEL_FAMILIES.reduce((sum, f) => sum + f.voices.length, 0)

  return (
    <div>
      <p className="text-sm text-gray-400 mb-6">{totalVoices} voices across {TTS_MODEL_FAMILIES.length} engines — from fast drafts to production-ready audio.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TTS_MODEL_FAMILIES.map(family => (
          <Link key={family.id} href="/studio/text-to-speech" className="group block">
            <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5 h-full transition-all duration-200 hover:border-primary-500/20 hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="h-5 w-5 text-primary-400" />
                <h4 className="font-semibold text-white text-sm">{family.name}</h4>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">{family.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Voices</span>
                  <span className="text-gray-300">{family.voices.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Max characters</span>
                  <span className="text-gray-300">{family.maxCharacters.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Credits / generation</span>
                  <span className="text-primary-400 font-medium">{family.creditsPerGeneration}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {family.voices.slice(0, 4).map(v => (
                  <span key={v.id} className="rounded-full bg-white/[0.04] border border-nyx-border px-2 py-0.5 text-[10px] text-gray-400">{v.name}</span>
                ))}
                {family.voices.length > 4 && (
                  <span className="rounded-full bg-white/[0.04] border border-nyx-border px-2 py-0.5 text-[10px] text-gray-500">+{family.voices.length - 4} more</span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Try it <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// UGC Avatar Tab Content
// ---------------------------------------------------------------------------

function UGCAvatarContent() {
  const features = [
    { icon: Camera, label: 'Portrait sync', desc: 'Sync lip movement to any portrait photo' },
    { icon: Waves, label: 'Lip movement', desc: 'Accurate lip sync with natural movement' },
    { icon: Monitor, label: '480p / 720p', desc: 'Choose output resolution for your video' },
    { icon: Clock, label: 'Up to 5 min', desc: 'Generate long-form talking head videos' },
    { icon: Mic, label: 'Record / upload audio', desc: 'Use your own voice or upload audio' },
    { icon: User, label: 'Expression guidance', desc: 'Control facial expressions and emotion' },
  ]

  return (
    <div className="flex justify-center">
      <div className="max-w-xl w-full rounded-xl border border-nyx-border bg-nyx-surface p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/10 flex items-center justify-center">
            <UGCAvatarIcon size={28} />
          </div>
          <div>
            <h4 className="font-semibold text-white">UGC Avatar</h4>
            <p className="text-xs text-gray-500">Create talking avatar videos from a photo</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02]">
              <Icon className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-gray-200 block">{label}</span>
                <span className="text-[10px] text-gray-500 leading-tight block">{desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6 px-3 py-2.5 rounded-lg bg-primary-500/5 border border-primary-500/10">
          <span className="text-xs text-gray-400">Pricing</span>
          <span className="text-sm font-semibold text-primary-300">40 credits / minute</span>
        </div>

        <Link href="/studio/ugc-avatar">
          <Button className="w-full">
            Try UGC Avatar <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function SupportedModelsSection() {
  const [activeTab, setActiveTab] = useState<TabKey>('image')

  const imageModels = useMemo(() => getEnabledModels('image'), [])
  const videoModels = useMemo(() => getEnabledModels('video'), [])
  const totalVoices = TTS_MODEL_FAMILIES.reduce((sum, f) => sum + f.voices.length, 0)
  const totalModels = imageModels.length + videoModels.length

  const tabs: { key: TabKey; label: string; count: string; Icon: React.FC<{ size?: number; className?: string }> }[] = [
    { key: 'image', label: 'Image', count: `${imageModels.length}`, Icon: TextToImageIcon },
    { key: 'video', label: 'Video', count: `${videoModels.length}`, Icon: TextToVideoIcon },
    { key: 'speech', label: 'Speech', count: `${totalVoices} voices`, Icon: TextToSpeechIcon },
    { key: 'ugc', label: 'UGC Avatar', count: '', Icon: UGCAvatarIcon },
  ]

  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <Badge variant="default" className="mb-4 gradient-primary text-white px-3 py-1">
          <Sparkles className="h-3 w-3 mr-1.5" />
          {totalModels}+ AI Models
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Supported Models &amp; Features</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Browse every AI model available on the platform — from image generators and video creators to lifelike speech engines.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {tabs.map(({ key, label, count, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === key
                ? 'gradient-primary text-white shadow-lg shadow-primary-500/20'
                : 'bg-nyx-surface border border-nyx-border text-gray-400 hover:text-white hover:border-nyx-borderBright'
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
            {count && <span className={`text-[11px] ${activeTab === key ? 'text-white/80' : 'text-gray-600'}`}>({count})</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'image' && <ModelGrid type="image" />}
        {activeTab === 'video' && <ModelGrid type="video" />}
        {activeTab === 'speech' && <SpeechContent />}
        {activeTab === 'ugc' && <UGCAvatarContent />}
      </div>

      {/* CTA */}
      <div className="text-center mt-10">
        <Link href="/studio/text-to-image">
          <Button variant="secondary" size="lg">
            Explore All Models in Studio <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
