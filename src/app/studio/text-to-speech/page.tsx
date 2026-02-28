'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { getTTSFamily, DEFAULT_VOICE_SETTINGS } from '@/lib/together/tts'
import type { TTSVoiceSettings, VoiceMode } from '@/types/together'
import { VoiceSelector } from '@/components/studio/voice-selector'
import { AudioPlayer } from '@/components/studio/audio-player'
import { CreditCostDisplay } from '@/components/studio/credit-cost-display'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Volume2, Settings2, ChevronDown, ChevronUp, RotateCcw, Info } from 'lucide-react'

const FORMAT_OPTIONS = [
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV (Lossless)' },
  { value: 'opus', label: 'Opus (Compact)' },
]

function SettingSlider({ label, value, onChange, min, max, step = 1, tooltip, disabled, unit }: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  tooltip?: string
  disabled?: boolean
  unit?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-gray-400">{label}</label>
          {tooltip && (
            <div className="group relative">
              <Info className="h-3 w-3 text-gray-600 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 p-2 rounded-lg bg-nyx-bg border border-nyx-border text-[10px] text-gray-400 z-10 shadow-xl">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        <span className="text-xs font-mono text-gray-500">{value}{unit ?? ''}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-nyx-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-400 [&::-webkit-slider-thumb]:hover:bg-primary-300 [&::-webkit-slider-thumb]:transition-colors disabled:opacity-50"
      />
    </div>
  )
}

export default function TextToSpeechPage() {
  const { user, profile } = useAuth()
  const { balance, refetch: refetchCredits } = useCredits(user?.$id)

  const [familyId, setFamilyId] = useState('kokoro')
  const [voice, setVoice] = useState('alloy')
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('library')
  const [text, setText] = useState('')
  const [format, setFormat] = useState('mp3')
  const [settings, setSettings] = useState<TTSVoiceSettings>({ ...DEFAULT_VOICE_SETTINGS })
  const [showSettings, setShowSettings] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [audioMimeType, setAudioMimeType] = useState('audio/mpeg')

  const family = getTTSFamily(familyId)
  const cost = family?.creditsPerGeneration ?? 1
  const maxChars = family?.maxCharacters ?? 5000

  const updateSetting = useCallback(<K extends keyof TTSVoiceSettings>(key: K, value: TTSVoiceSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_VOICE_SETTINGS })
  }, [])

  const handleGenerate = async () => {
    if (!user || !text.trim() || generating) return
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/generate/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.$id,
          familyId,
          voice,
          input: text.trim(),
          responseFormat: format,
          settings,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      const binaryStr = atob(data.audio)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: data.mimeType })
      const url = URL.createObjectURL(blob)

      setAudioSrc(url)
      setAudioMimeType(data.mimeType)
      refetchCredits()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate speech'
      setError(message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Text to Speech</h1>
        <p className="text-sm text-gray-400 mt-1">Generate natural-sounding speech with AI voices, custom designs, and voice cloning</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Voice + Text (2 cols wide) */}
        <div className="lg:col-span-2 space-y-5">
          <VoiceSelector
            selectedFamily={familyId}
            onFamilyChange={setFamilyId}
            selectedVoice={voice}
            onVoiceChange={setVoice}
            voiceMode={voiceMode}
            onVoiceModeChange={setVoiceMode}
            disabled={generating}
            subscriptionTier={profile?.subscriptionTier}
            userId={user?.$id}
            onCustomVoiceSelected={(cv) => {
              // Apply custom voice settings to the settings panel
              if (cv.settings) {
                setSettings({ ...DEFAULT_VOICE_SETTINGS, ...cv.settings })
              }
            }}
          />

          {/* Text Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Text</label>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                placeholder="Enter the text you want to convert to speech..."
                maxLength={maxChars}
                disabled={generating}
                rows={6}
                className={cn(
                  'w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2.5 text-sm text-white',
                  'placeholder:text-gray-500 resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                  'transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
              <span className={cn(
                'absolute bottom-2.5 right-3 text-xs',
                text.length > maxChars * 0.9 ? 'text-amber-400' : 'text-gray-600'
              )}>
                {text.length.toLocaleString()}/{maxChars.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Format */}
          <Select
            label="Output Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={FORMAT_OPTIONS}
            disabled={generating}
          />

          <CreditCostDisplay cost={cost} balance={balance} />

          <Button
            onClick={handleGenerate}
            disabled={!text.trim() || generating || balance < cost}
            loading={generating}
            className="w-full"
            size="lg"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Generate Speech &mdash; {cost} credit{cost > 1 ? 's' : ''}
          </Button>

          {error && (
            <div className="rounded-lg bg-error/10 border border-error/20 p-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
        </div>

        {/* Right: Settings + Audio */}
        <div className="space-y-5">
          {/* Voice Settings Panel */}
          <div className="rounded-xl border border-nyx-border bg-nyx-surface/80 overflow-hidden">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary-400" />
                <span className="text-sm font-semibold text-white">Voice Settings</span>
              </div>
              {showSettings ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
            </button>

            {showSettings && (
              <div className="px-4 pb-4 space-y-4 border-t border-nyx-border pt-4">
                <SettingSlider
                  label="Stability"
                  value={settings.stability}
                  onChange={(v) => updateSetting('stability', v)}
                  min={0} max={100}
                  unit="%"
                  tooltip="Higher = more consistent, lower = more expressive and variable"
                  disabled={generating}
                />
                <SettingSlider
                  label="Similarity"
                  value={settings.similarity}
                  onChange={(v) => updateSetting('similarity', v)}
                  min={0} max={100}
                  unit="%"
                  tooltip="How closely the output matches the target voice characteristics"
                  disabled={generating}
                />
                <SettingSlider
                  label="Style"
                  value={settings.style}
                  onChange={(v) => updateSetting('style', v)}
                  min={0} max={100}
                  unit="%"
                  tooltip="Amplifies the voice's unique style. Higher values may reduce stability"
                  disabled={generating}
                />
                <SettingSlider
                  label="Speed"
                  value={settings.speed}
                  onChange={(v) => updateSetting('speed', v)}
                  min={0.5} max={2} step={0.05}
                  unit="x"
                  tooltip="Playback speed of the generated audio"
                  disabled={generating}
                />
                <SettingSlider
                  label="Loudness"
                  value={settings.loudness}
                  onChange={(v) => updateSetting('loudness', v)}
                  min={0} max={100}
                  unit="%"
                  tooltip="Output volume and vocal energy level"
                  disabled={generating}
                />
                <SettingSlider
                  label="Guidance Scale"
                  value={settings.guidanceScale}
                  onChange={(v) => updateSetting('guidanceScale', v)}
                  min={1} max={20} step={0.5}
                  tooltip="How closely to follow voice characteristics. Higher = more faithful to the voice"
                  disabled={generating}
                />

                {/* Speaker Boost Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-gray-400">Speaker Boost</label>
                    <div className="group relative">
                      <Info className="h-3 w-3 text-gray-600 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 p-2 rounded-lg bg-nyx-bg border border-nyx-border text-[10px] text-gray-400 z-10 shadow-xl">
                        Enhances speaker clarity and reduces background artifacts
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting('speakerBoost', !settings.speakerBoost)}
                    disabled={generating}
                    className={cn(
                      'relative w-9 h-5 rounded-full transition-colors disabled:opacity-50',
                      settings.speakerBoost ? 'bg-primary-500' : 'bg-nyx-border'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                      settings.speakerBoost && 'translate-x-4'
                    )} />
                  </button>
                </div>

                {/* Reset */}
                <button
                  onClick={resetSettings}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset to defaults
                </button>
              </div>
            )}
          </div>

          {/* Audio Player */}
          <AudioPlayer
            src={audioSrc}
            mimeType={audioMimeType}
            format={format}
          />

          {/* Generation Details */}
          {audioSrc && (
            <div className="rounded-xl border border-nyx-border bg-nyx-surface/80 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Generation Details</h3>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <span className="text-gray-500">Engine</span>
                <span className="text-gray-300">{family?.name}</span>
                <span className="text-gray-500">Voice</span>
                <span className="text-gray-300 capitalize">{voice}</span>
                <span className="text-gray-500">Format</span>
                <span className="text-gray-300 uppercase">{format}</span>
                <span className="text-gray-500">Speed</span>
                <span className="text-gray-300">{settings.speed}x</span>
                <span className="text-gray-500">Stability</span>
                <span className="text-gray-300">{settings.stability}%</span>
                <span className="text-gray-500">Similarity</span>
                <span className="text-gray-300">{settings.similarity}%</span>
                <span className="text-gray-500">Style</span>
                <span className="text-gray-300">{settings.style}%</span>
                <span className="text-gray-500">Loudness</span>
                <span className="text-gray-300">{settings.loudness}%</span>
                <span className="text-gray-500">Guidance</span>
                <span className="text-gray-300">{settings.guidanceScale}</span>
                <span className="text-gray-500">Speaker Boost</span>
                <span className="text-gray-300">{settings.speakerBoost ? 'On' : 'Off'}</span>
                <span className="text-gray-500">Characters</span>
                <span className="text-gray-300">{text.length.toLocaleString()}</span>
                <span className="text-gray-500">Credits Used</span>
                <span className="text-gray-300">{cost}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
