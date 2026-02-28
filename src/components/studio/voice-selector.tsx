'use client'

import { useState, useMemo, useEffect } from 'react'
import { TTS_MODEL_FAMILIES } from '@/lib/together/tts'
import type { TTSGender, VoiceMode } from '@/types/together'
import { cn } from '@/lib/utils'
import { Volume2, Coins, Wand2, Trash2, Loader2 } from 'lucide-react'
import { VoiceWizard } from './voice-wizard'

const GENDERS: { id: TTSGender | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'neutral', label: 'Neutral' },
]

interface CustomVoice {
  id: string
  name: string
  gender: string
  age: string
  accent: string
  tone: string
  baseFamily: string
  baseVoice: string
  settings: any
  createdAt: string
}

interface VoiceSelectorProps {
  selectedFamily: string
  onFamilyChange: (familyId: string) => void
  selectedVoice: string
  onVoiceChange: (voiceId: string) => void
  voiceMode: VoiceMode
  onVoiceModeChange: (mode: VoiceMode) => void
  disabled?: boolean
  subscriptionTier?: string
  userId?: string
  onCustomVoiceSelected?: (voice: CustomVoice) => void
}

export function VoiceSelector({
  selectedFamily, onFamilyChange,
  selectedVoice, onVoiceChange,
  voiceMode, onVoiceModeChange,
  disabled,
  subscriptionTier = 'free',
  userId,
  onCustomVoiceSelected,
}: VoiceSelectorProps) {
  const [genderFilter, setGenderFilter] = useState<TTSGender | 'all'>('all')
  const [tab, setTab] = useState<'library' | 'custom'>('library')
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([])
  const [loadingCustom, setLoadingCustom] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(null)

  const family = useMemo(
    () => TTS_MODEL_FAMILIES.find(f => f.id === selectedFamily),
    [selectedFamily]
  )

  const filteredVoices = useMemo(() => {
    const voices = family?.voices ?? []
    if (genderFilter === 'all') return voices
    return voices.filter(v => v.gender === genderFilter)
  }, [family, genderFilter])

  // Fetch custom voices
  useEffect(() => {
    if (!userId) return
    setLoadingCustom(true)
    fetch(`/api/voices?userId=${userId}`)
      .then(r => r.json())
      .then(data => setCustomVoices(data.voices || []))
      .catch(() => {})
      .finally(() => setLoadingCustom(false))
  }, [userId])

  const handleDeleteCustom = async (voiceId: string) => {
    if (!userId) return
    setDeletingId(voiceId)
    try {
      await fetch(`/api/voices?userId=${userId}&voiceId=${voiceId}`, { method: 'DELETE' })
      setCustomVoices(prev => prev.filter(v => v.id !== voiceId))
      if (selectedCustomId === voiceId) setSelectedCustomId(null)
    } catch {} finally {
      setDeletingId(null)
    }
  }

  const handleSelectCustom = (voice: CustomVoice) => {
    setSelectedCustomId(voice.id)
    // Set the base family and voice for TTS generation
    onFamilyChange(voice.baseFamily)
    onVoiceChange(voice.baseVoice)
    onCustomVoiceSelected?.(voice)
  }

  const handleVoiceCreated = (voice: CustomVoice) => {
    setCustomVoices(prev => [...prev, voice])
    setShowWizard(false)
    handleSelectCustom(voice)
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-nyx-surface border border-nyx-border">
        <button
          type="button"
          onClick={() => { setTab('library'); setSelectedCustomId(null) }}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            tab === 'library'
              ? 'bg-primary-500/15 text-primary-300'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          <Volume2 className="h-3.5 w-3.5" />
          Voice Library
        </button>
        <button
          type="button"
          onClick={() => setTab('custom')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
            tab === 'custom'
              ? 'bg-primary-500/15 text-primary-300'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          <Wand2 className="h-3.5 w-3.5" />
          My Voices
          {customVoices.length > 0 && (
            <span className="text-[9px] bg-primary-500/20 text-primary-400 px-1.5 py-0.5 rounded-full">
              {customVoices.length}
            </span>
          )}
        </button>
      </div>

      {/* Library Tab */}
      {tab === 'library' && (
        <div className="space-y-3">
          {/* Model Family Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Voice Engine</label>
            <div className="grid grid-cols-3 gap-2">
              {TTS_MODEL_FAMILIES.map((fam) => (
                <button
                  key={fam.id}
                  type="button"
                  onClick={() => {
                    if (disabled) return
                    onFamilyChange(fam.id)
                    const firstVoice = fam.voices.find(v => genderFilter === 'all' || v.gender === genderFilter) || fam.voices[0]
                    onVoiceChange(firstVoice?.id ?? '')
                    setSelectedCustomId(null)
                  }}
                  disabled={disabled}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-center',
                    selectedFamily === fam.id && !selectedCustomId
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-border-bright hover:text-gray-300',
                    'disabled:opacity-50'
                  )}
                >
                  <span className="text-sm font-semibold">{fam.name}</span>
                  <span className="flex items-center gap-1 text-[10px]">
                    <Coins className="h-3 w-3 text-primary-400" />
                    {fam.creditsPerGeneration} credit{fam.creditsPerGeneration > 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
            {family && (
              <p className="text-xs text-gray-500">{family.description}</p>
            )}
          </div>

          {/* Gender Filter */}
          <div className="flex gap-1.5">
            {GENDERS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGenderFilter(g.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  genderFilter === g.id
                    ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30'
                    : 'text-gray-500 hover:text-gray-300 border border-transparent'
                )}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Voice Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {filteredVoices.map((voice) => (
              <button
                key={voice.id}
                type="button"
                onClick={() => { if (!disabled) { onVoiceChange(voice.id); setSelectedCustomId(null) } }}
                disabled={disabled}
                className={cn(
                  'flex items-start gap-2 p-2.5 rounded-lg border transition-all text-left',
                  selectedVoice === voice.id && !selectedCustomId
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-border-bright hover:text-gray-300',
                  'disabled:opacity-50'
                )}
              >
                <Volume2 className="h-4 w-4 shrink-0 text-primary-400 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{voice.name}</p>
                    <span className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded-full uppercase',
                      voice.gender === 'male' ? 'bg-blue-500/10 text-blue-400' :
                      voice.gender === 'female' ? 'bg-pink-500/10 text-pink-400' :
                      'bg-gray-500/10 text-gray-400'
                    )}>{voice.gender}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate">{voice.description}</p>
                  {voice.tags && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {voice.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
            {filteredVoices.length === 0 && (
              <div className="col-span-2 text-center py-6 text-gray-500 text-sm">
                No voices match this filter
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Voices Tab */}
      {tab === 'custom' && (
        <div className="space-y-3">
          {showWizard ? (
            <div className="rounded-lg border border-primary-500/20 bg-primary-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wand2 className="h-4 w-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-white">Create Your Voice</h3>
              </div>
              <VoiceWizard
                userId={userId!}
                onVoiceCreated={handleVoiceCreated}
                onCancel={() => setShowWizard(false)}
                disabled={disabled}
              />
            </div>
          ) : (
            <>
              {/* Create button */}
              <button
                type="button"
                onClick={() => setShowWizard(true)}
                disabled={disabled || !userId}
                className={cn(
                  'w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed transition-all',
                  'border-primary-500/30 hover:border-primary-500/60 hover:bg-primary-500/5 text-primary-400 hover:text-primary-300',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Wand2 className="h-4 w-4" />
                <span className="text-sm font-medium">Create New Voice</span>
                <span className="flex items-center gap-0.5 text-[10px] ml-1">
                  <Coins className="h-3 w-3" /> 2 for preview
                </span>
              </button>

              {/* Custom voices list */}
              {loadingCustom ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
                </div>
              ) : customVoices.length === 0 ? (
                <div className="text-center py-8">
                  <Wand2 className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No custom voices yet</p>
                  <p className="text-xs text-gray-600 mt-1">Create your first voice to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {customVoices.map((voice) => (
                    <div
                      key={voice.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                        selectedCustomId === voice.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-nyx-border bg-nyx-surface hover:border-nyx-border-bright'
                      )}
                      onClick={() => !disabled && handleSelectCustom(voice)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/15 flex items-center justify-center">
                        <Wand2 className="h-4 w-4 text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{voice.name}</p>
                          <span className={cn(
                            'text-[9px] px-1.5 py-0.5 rounded-full uppercase',
                            voice.gender === 'male' ? 'bg-blue-500/10 text-blue-400' :
                            voice.gender === 'female' ? 'bg-pink-500/10 text-pink-400' :
                            'bg-gray-500/10 text-gray-400'
                          )}>{voice.gender}</span>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          {voice.tone} &middot; {voice.age === 'middle-aged' ? 'adult' : voice.age} &middot; {voice.accent}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCustom(voice.id)
                        }}
                        disabled={deletingId === voice.id}
                        className="p-1.5 rounded-md text-gray-600 hover:text-error hover:bg-error/10 transition-colors"
                      >
                        {deletingId === voice.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
