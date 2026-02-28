'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Wand2, ChevronRight, ChevronLeft, Loader2, Play, Check, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VoiceWizardProps {
  userId: string
  onVoiceCreated: (voice: any) => void
  onCancel: () => void
  disabled?: boolean
}

const GENDERS = [
  { id: 'male', label: 'Male', icon: '♂' },
  { id: 'female', label: 'Female', icon: '♀' },
  { id: 'neutral', label: 'Neutral', icon: '⚪' },
]

const AGES = [
  { id: 'young', label: 'Young', desc: 'Youthful, fresh tone' },
  { id: 'middle-aged', label: 'Adult', desc: 'Balanced, mature tone' },
  { id: 'old', label: 'Senior', desc: 'Wise, seasoned tone' },
]

const ACCENTS = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'american', label: 'American' },
  { id: 'british', label: 'British' },
  { id: 'australian', label: 'Australian' },
]

const TONES: Record<string, { id: string; label: string; desc: string }[]> = {
  male: [
    { id: 'warm', label: 'Warm', desc: 'Friendly and approachable' },
    { id: 'deep', label: 'Deep', desc: 'Rich bass tone' },
    { id: 'authoritative', label: 'Authoritative', desc: 'Commanding presence' },
    { id: 'calm', label: 'Calm', desc: 'Soothing and relaxed' },
    { id: 'energetic', label: 'Energetic', desc: 'Upbeat and lively' },
    { id: 'professional', label: 'Professional', desc: 'Clear and polished' },
    { id: 'wise', label: 'Wise', desc: 'Thoughtful and measured' },
    { id: 'dramatic', label: 'Dramatic', desc: 'Theatrical and bold' },
  ],
  female: [
    { id: 'warm', label: 'Warm', desc: 'Friendly and inviting' },
    { id: 'bright', label: 'Bright', desc: 'Clear and uplifting' },
    { id: 'gentle', label: 'Gentle', desc: 'Soft and soothing' },
    { id: 'energetic', label: 'Energetic', desc: 'Dynamic and lively' },
    { id: 'professional', label: 'Professional', desc: 'Polished and confident' },
    { id: 'expressive', label: 'Expressive', desc: 'Emotionally rich' },
    { id: 'storytelling', label: 'Storytelling', desc: 'Narrative and engaging' },
    { id: 'casual', label: 'Casual', desc: 'Relaxed conversational' },
  ],
  neutral: [
    { id: 'warm', label: 'Warm', desc: 'Friendly and balanced' },
    { id: 'calm', label: 'Calm', desc: 'Soothing and even' },
    { id: 'professional', label: 'Professional', desc: 'Clear and polished' },
    { id: 'energetic', label: 'Energetic', desc: 'Upbeat and engaging' },
  ],
}

type WizardStep = 'gender' | 'age' | 'tone' | 'name'

export function VoiceWizard({ userId, onVoiceCreated, onCancel, disabled }: VoiceWizardProps) {
  const [step, setStep] = useState<WizardStep>('gender')
  const [gender, setGender] = useState<string>('')
  const [age, setAge] = useState<string>('')
  const [accent, setAccent] = useState<string>('neutral')
  const [tone, setTone] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [previewAudio, setPreviewAudio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const steps: WizardStep[] = ['gender', 'age', 'tone', 'name']
  const stepIndex = steps.indexOf(step)
  const canGoNext = step === 'gender' ? !!gender :
    step === 'age' ? !!age :
    step === 'tone' ? !!tone :
    step === 'name' ? !!name.trim() : false

  const goNext = () => {
    const nextIdx = stepIndex + 1
    if (nextIdx < steps.length) setStep(steps[nextIdx])
  }

  const goBack = () => {
    const prevIdx = stepIndex - 1
    if (prevIdx >= 0) setStep(steps[prevIdx])
    else onCancel()
  }

  const handlePreview = async () => {
    setPreviewing(true)
    setError(null)
    try {
      const res = await fetch('/api/voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: name.trim() || `${tone} ${gender}`,
          gender,
          age,
          accent,
          tone,
          preview: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.previewAudio) {
        setPreviewAudio(data.previewAudio)
        // Play it
        const binary = atob(data.previewAudio)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: 'audio/mpeg' })
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.play()
      }
      // Voice was also saved
      onVoiceCreated(data.voice)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPreviewing(false)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: name.trim(),
          gender,
          age,
          accent,
          tone,
          preview: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onVoiceCreated(data.voice)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors',
              i < stepIndex ? 'bg-primary-500 text-white' :
              i === stepIndex ? 'bg-primary-500/20 text-primary-300 ring-1 ring-primary-500' :
              'bg-nyx-surface text-gray-600'
            )}>
              {i < stepIndex ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'w-6 h-0.5 mx-0.5',
                i < stepIndex ? 'bg-primary-500' : 'bg-nyx-border'
              )} />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-gray-500 capitalize">{step}</span>
      </div>

      {/* Step Content */}
      {step === 'gender' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">Choose a voice gender</p>
          <div className="grid grid-cols-3 gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => { setGender(g.id); setTone('') }}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
                  gender === g.id
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-border-bright hover:text-gray-300',
                )}
              >
                <span className="text-lg">{g.icon}</span>
                <span className="text-sm font-medium">{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'age' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">Select voice age range</p>
          <div className="grid grid-cols-3 gap-2">
            {AGES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAge(a.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
                  age === a.id
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-border-bright hover:text-gray-300',
                )}
              >
                <span className="text-sm font-medium">{a.label}</span>
                <span className="text-[10px] text-gray-500">{a.desc}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1.5 mt-3">
            <label className="text-xs text-gray-500">Accent (optional)</label>
            <div className="flex gap-1.5 flex-wrap">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAccent(a.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    accent === a.id
                      ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30'
                      : 'text-gray-500 hover:text-gray-300 border border-nyx-border'
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'tone' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">Pick a vocal tone</p>
          <div className="grid grid-cols-2 gap-2">
            {(TONES[gender] || TONES.neutral).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={cn(
                  'flex flex-col items-start gap-0.5 p-2.5 rounded-lg border transition-all text-left',
                  tone === t.id
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-nyx-border bg-nyx-surface text-gray-400 hover:border-nyx-border-bright hover:text-gray-300',
                )}
              >
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-[10px] text-gray-500">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'name' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">Name your voice</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`My ${tone} ${gender} voice`}
            maxLength={50}
            className="w-full rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
          />

          {/* Summary */}
          <div className="rounded-lg bg-nyx-bg/50 border border-nyx-border p-3 space-y-1.5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Voice Summary</p>
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <span className="text-gray-500">Gender</span>
              <span className="text-gray-300 capitalize">{gender}</span>
              <span className="text-gray-500">Age</span>
              <span className="text-gray-300 capitalize">{age === 'middle-aged' ? 'Adult' : age}</span>
              <span className="text-gray-500">Accent</span>
              <span className="text-gray-300 capitalize">{accent}</span>
              <span className="text-gray-500">Tone</span>
              <span className="text-gray-300 capitalize">{tone}</span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-error/10 border border-error/20 p-2">
              <p className="text-xs text-error">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-nyx-border">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ChevronLeft className="h-3 w-3" />
          {stepIndex === 0 ? 'Cancel' : 'Back'}
        </button>

        {step === 'name' ? (
          <div className="flex gap-2">
            <Button
              onClick={handlePreview}
              disabled={!name.trim() || previewing || creating}
              loading={previewing}
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Preview
              <span className="ml-1 flex items-center gap-0.5 text-primary-400">
                <Coins className="h-3 w-3" /> 2
              </span>
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || creating || previewing}
              loading={creating}
              size="sm"
              className="text-xs"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Save Voice
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className={cn(
              'flex items-center gap-1 text-xs font-medium transition-colors',
              canGoNext ? 'text-primary-400 hover:text-primary-300' : 'text-gray-600 cursor-not-allowed'
            )}
          >
            Next
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
