'use client'

import { useState, useMemo } from 'react'
import { TTS_MODEL_FAMILIES, getTTSFamily } from '@/lib/together/tts'
import { DEFAULT_VOICE_SETTINGS } from '@/lib/together/tts'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Volume2, Coins, Play, Square, X, Music, Loader2 } from 'lucide-react'

interface TTSAudioSourceProps {
  userId?: string
  onAudioReady: (url: string, duration: number) => void
  disabled?: boolean
}

export function TTSAudioSource({ userId, onAudioReady, disabled }: TTSAudioSourceProps) {
  const [familyId, setFamilyId] = useState('kokoro')
  const [voiceId, setVoiceId] = useState('af_alloy')
  const [text, setText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [previewVoice, setPreviewVoice] = useState<string | null>(null)
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null)

  const family = useMemo(() => getTTSFamily(familyId), [familyId])
  const voices = family?.voices ?? []
  const cost = family?.creditsPerGeneration ?? 1
  const maxChars = family?.maxCharacters ?? 5000

  const handleFamilyChange = (id: string) => {
    setFamilyId(id)
    const fam = getTTSFamily(id)
    if (fam && fam.voices.length > 0) {
      setVoiceId(fam.voices[0].id)
    }
  }

  const handlePreviewVoice = async (vid: string) => {
    if (previewVoice === vid && previewAudio) {
      previewAudio.pause()
      setPreviewVoice(null)
      setPreviewAudio(null)
      return
    }

    try {
      setPreviewVoice(vid)
      const res = await fetch('/api/generate/speech/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId, voice: vid }),
      })
      if (!res.ok) throw new Error('Preview failed')
      const data = await res.json()
      const binaryStr = atob(data.audio)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
      const blob = new Blob([bytes], { type: data.mimeType })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => { setPreviewVoice(null); setPreviewAudio(null) }
      audio.play()
      setPreviewAudio(audio)
    } catch {
      setPreviewVoice(null)
      setPreviewAudio(null)
    }
  }

  const handleGenerate = async () => {
    if (!userId || !text.trim() || generating) return
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/generate/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          familyId,
          voice: voiceId,
          input: text.trim(),
          responseFormat: 'mp3',
          settings: DEFAULT_VOICE_SETTINGS,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      // Decode base64 to blob
      const binaryStr = atob(data.audio)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/mpeg' })

      // Upload to Supabase for a public URL
      const path = `audio/tts-${crypto.randomUUID()}.mp3`
      const { error: uploadError } = await supabase.storage.from('uploads').upload(path, blob)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)

      // Detect duration
      const objectUrl = URL.createObjectURL(blob)
      const audio = new Audio(objectUrl)
      const dur = await new Promise<number>((resolve) => {
        audio.addEventListener('loadedmetadata', () => resolve(Math.ceil(audio.duration)), { once: true })
        // Fallback
        setTimeout(() => resolve(5), 3000)
      })

      setAudioUrl(publicUrl)
      setAudioDuration(dur)
      onAudioReady(publicUrl, dur)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleClear = () => {
    setAudioUrl(null)
    setAudioDuration(0)
    setError(null)
  }

  // If we already have generated audio, show it
  if (audioUrl) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-lg border border-nyx-border bg-nyx-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
              <Music className="h-5 w-5 text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <audio controls src={audioUrl} className="w-full h-8" />
              {audioDuration > 0 && (
                <p className="text-xs text-gray-500 mt-1">Duration: {Math.floor(audioDuration / 60)}:{String(audioDuration % 60).padStart(2, '0')}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClear}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-gray-600 text-center">TTS audio generated. Clear to regenerate with different settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Engine selector */}
      <div className="grid grid-cols-3 gap-2">
        {TTS_MODEL_FAMILIES.map(fam => (
          <button
            key={fam.id}
            onClick={() => handleFamilyChange(fam.id)}
            disabled={disabled || generating}
            className={cn(
              'rounded-lg border p-2.5 text-center transition-all text-xs',
              familyId === fam.id
                ? 'border-primary-500/40 bg-primary-500/10 text-primary-300'
                : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-borderBright hover:text-white',
              (disabled || generating) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="font-medium block">{fam.name}</span>
            <span className="flex items-center justify-center gap-1 mt-0.5 text-[10px] text-gray-500">
              <Coins className="h-2.5 w-2.5" /> {fam.creditsPerGeneration} cr
            </span>
          </button>
        ))}
      </div>

      {/* Voice selector */}
      <div>
        <label className="block text-xs text-gray-500 mb-1.5">Voice</label>
        <div className="grid grid-cols-2 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
          {voices.map(v => (
            <button
              key={v.id}
              onClick={() => setVoiceId(v.id)}
              disabled={disabled || generating}
              className={cn(
                'flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition-all text-xs',
                voiceId === v.id
                  ? 'border-primary-500/40 bg-primary-500/5 text-white'
                  : 'border-nyx-border text-gray-400 hover:border-nyx-borderBright hover:text-gray-200',
                (disabled || generating) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="flex-1 truncate">{v.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handlePreviewVoice(v.id) }}
                className="p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-primary-400 transition-colors flex-shrink-0"
                title="Preview voice"
              >
                {previewVoice === v.id ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-gray-500">Text</label>
          <span className={cn('text-[10px]', text.length > maxChars ? 'text-error' : 'text-gray-600')}>{text.length}/{maxChars}</span>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={disabled || generating}
          placeholder="Enter text to convert to speech..."
          rows={3}
          maxLength={maxChars}
          className="w-full rounded-lg border border-nyx-border bg-nyx-bg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-primary-500/40 disabled:opacity-50"
        />
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={!userId || !text.trim() || generating || text.length > maxChars || disabled}
        loading={generating}
        className="w-full"
        size="sm"
      >
        <Volume2 className="h-3.5 w-3.5 mr-1.5" />
        Generate Speech — {cost} credit{cost > 1 ? 's' : ''}
      </Button>

      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 p-2">
          <p className="text-xs text-error">{error}</p>
        </div>
      )}
    </div>
  )
}
