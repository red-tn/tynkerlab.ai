'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { TTS_MODEL_FAMILIES } from '@/lib/together/tts'
import { getVoicePreviewUrl } from '@/lib/together/voice-previews'
import type { TTSGender, TTSVoiceSettings, VoiceMode } from '@/types/together'
import { cn } from '@/lib/utils'
import { Volume2, Coins, Wand2, Trash2, Loader2, Play, Square, Pencil, Save, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  voiceSettings?: TTSVoiceSettings
  disabled?: boolean
  subscriptionTier?: string
  userId?: string
  onCustomVoiceSelected?: (voice: CustomVoice) => void
}

const EDIT_SLIDERS = [
  { key: 'speed' as const, label: 'Speed', min: 0.5, max: 2.0, step: 0.05, format: (v: number) => `${v.toFixed(2)}x` },
  { key: 'stability' as const, label: 'Stability', min: 0, max: 100, step: 1, format: (v: number) => `${v}%` },
  { key: 'loudness' as const, label: 'Loudness', min: 0, max: 100, step: 1, format: (v: number) => `${v}%` },
  { key: 'style' as const, label: 'Style', min: 0, max: 100, step: 1, format: (v: number) => `${v}%` },
  { key: 'similarity' as const, label: 'Similarity', min: 0, max: 100, step: 1, format: (v: number) => `${v}%` },
]

export function VoiceSelector({
  selectedFamily, onFamilyChange,
  selectedVoice, onVoiceChange,
  voiceMode, onVoiceModeChange,
  voiceSettings,
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

  // Voice preview state (shared for library + custom)
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null)
  const previewCacheRef = useRef<Map<string, string>>(new Map())
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  // Custom voice edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSettings, setEditSettings] = useState<Record<string, number | boolean> | null>(null)
  const [editName, setEditName] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const stopPreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
    }
    setPreviewingVoice(null)
  }, [])

  // Clear cache when settings change so previews reflect new settings
  const settingsKey = JSON.stringify(voiceSettings || {})
  const prevSettingsKeyRef = useRef(settingsKey)
  useEffect(() => {
    if (prevSettingsKeyRef.current !== settingsKey) {
      previewCacheRef.current.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
      previewCacheRef.current.clear()
      prevSettingsKeyRef.current = settingsKey
    }
  }, [settingsKey])

  const playFromUrl = useCallback((url: string, key: string) => {
    setPreviewingVoice(key)
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio()
    }
    previewAudioRef.current.src = url
    previewAudioRef.current.onended = () => setPreviewingVoice(null)
    previewAudioRef.current.play().catch(() => setPreviewingVoice(null))
  }, [])

  // Library voice preview (tries storage then API)
  const handlePreview = useCallback(async (familyId: string, voiceId: string) => {
    const key = `${familyId}:${voiceId}`

    if (previewingVoice === key) {
      stopPreview()
      return
    }
    stopPreview()

    const cached = previewCacheRef.current.get(key)
    if (cached) {
      playFromUrl(cached, key)
      return
    }

    setLoadingPreview(key)
    try {
      const storageUrl = getVoicePreviewUrl(familyId, voiceId)
      const headRes = await fetch(storageUrl, { method: 'HEAD' })
      if (headRes.ok) {
        previewCacheRef.current.set(key, storageUrl)
        playFromUrl(storageUrl, key)
        setLoadingPreview(null)
        return
      }
    } catch {
      // fall through
    }

    try {
      const res = await fetch('/api/generate/speech/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId, voice: voiceId, settings: voiceSettings }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Preview failed')

      const binaryStr = atob(data.audio)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/mpeg' })
      const url = URL.createObjectURL(blob)

      previewCacheRef.current.set(key, url)
      playFromUrl(url, key)
    } catch {
      // silently fail
    } finally {
      setLoadingPreview(null)
    }
  }, [previewingVoice, stopPreview, voiceSettings, playFromUrl])

  // Custom voice preview (uses base family/voice + its settings via the preview API)
  const handleCustomPreview = useCallback(async (voice: CustomVoice, overrideSettings?: Record<string, number | boolean>) => {
    const key = `custom:${voice.id}`

    if (previewingVoice === key) {
      stopPreview()
      return
    }
    stopPreview()

    // Don't cache custom previews during editing (settings may change)
    const useSettings = overrideSettings || voice.settings

    setLoadingPreview(key)
    try {
      const res = await fetch('/api/generate/speech/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: voice.baseFamily,
          voice: voice.baseVoice,
          settings: useSettings,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Preview failed')

      const binaryStr = atob(data.audio)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/mpeg' })
      const url = URL.createObjectURL(blob)

      playFromUrl(url, key)
    } catch {
      // silently fail
    } finally {
      setLoadingPreview(null)
    }
  }, [previewingVoice, stopPreview, playFromUrl])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause()
        previewAudioRef.current = null
      }
    }
  }, [])

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
      if (editingId === voiceId) { setEditingId(null); setEditSettings(null) }
    } catch {} finally {
      setDeletingId(null)
    }
  }

  const handleSelectCustom = (voice: CustomVoice) => {
    setSelectedCustomId(voice.id)
    onFamilyChange(voice.baseFamily)
    onVoiceChange(voice.baseVoice)
    onCustomVoiceSelected?.(voice)
  }

  const handleVoiceCreated = (voice: CustomVoice) => {
    setCustomVoices(prev => [...prev, voice])
    setShowWizard(false)
    handleSelectCustom(voice)
  }

  // Open edit mode for a custom voice
  const startEdit = (voice: CustomVoice) => {
    if (editingId === voice.id) {
      // Toggle off
      setEditingId(null)
      setEditSettings(null)
      return
    }
    setEditingId(voice.id)
    setEditSettings({ ...voice.settings })
    setEditName(voice.name)
  }

  // Save edited custom voice settings
  const saveEdit = async (voiceId: string) => {
    if (!userId || !editSettings) return
    setSavingEdit(true)
    try {
      const res = await fetch('/api/voices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          voiceId,
          settings: editSettings,
          name: editName.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Update local state
      setCustomVoices(prev => prev.map(v => v.id === voiceId ? data.voice : v))
      // If this is the selected voice, re-apply settings upstream
      if (selectedCustomId === voiceId) {
        onCustomVoiceSelected?.(data.voice)
      }
      setEditingId(null)
      setEditSettings(null)
    } catch {
      // silently fail
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-nyx-surface border border-nyx-border">
        <button
          type="button"
          onClick={() => { setTab('library'); setSelectedCustomId(null); setEditingId(null) }}
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
            {filteredVoices.map((v) => {
              const previewKey = `${selectedFamily}:${v.id}`
              const isPlaying = previewingVoice === previewKey
              const isLoading = loadingPreview === previewKey
              return (
                <div
                  key={v.id}
                  className={cn(
                    'flex items-start gap-2 p-2.5 rounded-lg border transition-all text-left cursor-pointer',
                    selectedVoice === v.id && !selectedCustomId
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-border-bright hover:text-gray-300',
                    disabled && 'opacity-50 pointer-events-none'
                  )}
                  onClick={() => { if (!disabled) { onVoiceChange(v.id); setSelectedCustomId(null) } }}
                >
                  {/* Preview button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreview(selectedFamily, v.id)
                    }}
                    disabled={disabled || isLoading}
                    className={cn(
                      'shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all mt-0.5',
                      isPlaying
                        ? 'bg-primary-500 text-white'
                        : 'bg-primary-500/15 text-primary-400 hover:bg-primary-500/30'
                    )}
                    title={isPlaying ? 'Stop preview' : 'Preview voice'}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isPlaying ? (
                      <Square className="h-2.5 w-2.5 fill-current" />
                    ) : (
                      <Play className="h-3 w-3 ml-0.5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{v.name}</p>
                      <span className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-full uppercase',
                        v.gender === 'male' ? 'bg-blue-500/10 text-blue-400' :
                        v.gender === 'female' ? 'bg-pink-500/10 text-pink-400' :
                        'bg-gray-500/10 text-gray-400'
                      )}>{v.gender}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{v.description}</p>
                    {v.tags && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {v.tags.map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
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
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {customVoices.map((voice) => {
                    const previewKey = `custom:${voice.id}`
                    const isPlaying = previewingVoice === previewKey
                    const isLoading = loadingPreview === previewKey
                    const isEditing = editingId === voice.id

                    return (
                      <div key={voice.id} className="space-y-0">
                        {/* Voice card */}
                        <div
                          className={cn(
                            'flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer',
                            selectedCustomId === voice.id
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-nyx-border bg-nyx-surface hover:border-nyx-border-bright',
                            isEditing && 'rounded-b-none'
                          )}
                          onClick={() => !disabled && handleSelectCustom(voice)}
                        >
                          {/* Preview button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCustomPreview(voice)
                            }}
                            disabled={disabled || isLoading}
                            className={cn(
                              'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all',
                              isPlaying
                                ? 'bg-primary-500 text-white'
                                : 'bg-primary-500/15 text-primary-400 hover:bg-primary-500/30'
                            )}
                            title={isPlaying ? 'Stop preview' : 'Preview voice'}
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isPlaying ? (
                              <Square className="h-3 w-3 fill-current" />
                            ) : (
                              <Play className="h-3.5 w-3.5 ml-0.5" />
                            )}
                          </button>

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

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEdit(voice)
                            }}
                            className={cn(
                              'p-1.5 rounded-md transition-colors',
                              isEditing
                                ? 'text-primary-400 bg-primary-500/10'
                                : 'text-gray-600 hover:text-primary-400 hover:bg-primary-500/10'
                            )}
                            title="Edit voice settings"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete button */}
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

                        {/* Inline edit panel */}
                        {isEditing && editSettings && (
                          <div className="border border-t-0 border-nyx-border rounded-b-lg bg-nyx-bg/60 p-3 space-y-3">
                            {/* Name edit */}
                            <div className="space-y-1">
                              <label className="text-xs text-gray-400">Name</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                maxLength={50}
                                className="w-full rounded-md bg-nyx-surface border border-nyx-border px-2.5 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
                              />
                            </div>

                            {/* Sliders */}
                            {EDIT_SLIDERS.map(({ key, label, min, max, step, format }) => (
                              <div key={key} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs text-gray-400">{label}</label>
                                  <span className="text-xs text-primary-300 font-mono">{format(editSettings[key] as number)}</span>
                                </div>
                                <input
                                  type="range"
                                  min={min}
                                  max={max}
                                  step={step}
                                  value={editSettings[key] as number}
                                  onChange={(e) => setEditSettings({ ...editSettings, [key]: parseFloat(e.target.value) })}
                                  className="w-full h-1.5 rounded-full appearance-none bg-nyx-border cursor-pointer accent-primary-500
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-400
                                    [&::-webkit-slider-thumb]:hover:bg-primary-300 [&::-webkit-slider-thumb]:transition-colors"
                                />
                              </div>
                            ))}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                disabled={isLoading}
                                loading={isLoading}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCustomPreview(voice, editSettings)
                                }}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Preview
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditSettings({ ...voice.settings })
                                  setEditName(voice.name)
                                }}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Reset
                              </Button>

                              <div className="flex-1" />

                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-gray-500"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingId(null)
                                  setEditSettings(null)
                                }}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>

                              <Button
                                size="sm"
                                className="text-xs"
                                disabled={savingEdit}
                                loading={savingEdit}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  saveEdit(voice.id)
                                }}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
