'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import { useGeneration } from '@/hooks/use-generation'
import { ImageUpload } from '@/components/studio/image-upload'
import { AudioUpload } from '@/components/studio/audio-upload'
import { AudioRecorder } from '@/components/studio/audio-recorder'
import { TTSAudioSource } from '@/components/studio/ugc-avatar/tts-audio-source'
import { UGCSettings } from '@/components/studio/ugc-avatar/ugc-settings'
import { ImageCropDialog } from '@/components/studio/ugc-avatar/image-crop-dialog'
import { CreditCostDisplay } from '@/components/studio/credit-cost-display'
import { GenerationResult } from '@/components/studio/generation-result'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles, Upload, Mic, Volume2, Pencil } from 'lucide-react'

type AudioTab = 'upload' | 'record' | 'tts'

export default function UGCAvatarPage() {
  const { user } = useAuth()
  const { balance, refetch: refetchCredits } = useCredits(user?.id)
  const {
    state, result, error, progress, progressPercent, progressNote,
    generateUGCAvatar, cancel, reset, isGenerating,
  } = useGeneration()

  useEffect(() => {
    if (state === 'completed' || state === 'failed') refetchCredits()
  }, [state, refetchCredits])

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [audioTab, setAudioTab] = useState<AudioTab>('upload')
  const [resolution, setResolution] = useState<'480p' | '720p'>('480p')
  const [duration, setDuration] = useState<number>(30)
  const [textPrompt, setTextPrompt] = useState('')
  const [seed, setSeed] = useState('')
  const [showCropDialog, setShowCropDialog] = useState(false)

  // Compute effective duration: -1 means "match audio"
  const effectiveDuration = duration === -1 && audioDuration > 0
    ? Math.ceil(audioDuration)
    : duration === -1
      ? 30 // fallback if no audio yet
      : audioDuration > 0 && duration === -1
        ? audioDuration
        : duration

  const cost = Math.max(40, Math.ceil(effectiveDuration / 60) * 40)

  const handleAudioUpload = (url: string, dur: number) => {
    setAudioUrl(url)
    setAudioDuration(dur)
  }

  const handleRecorded = (url: string, dur: number) => {
    setAudioUrl(url)
    setAudioDuration(dur)
  }

  const handleCropSave = (croppedUrl: string) => {
    setImageUrl(croppedUrl)
    setShowCropDialog(false)
  }

  const handleGenerate = () => {
    if (!user || !imageUrl || !audioUrl) return
    generateUGCAvatar({
      userId: user.id,
      imageUrl,
      audioUrl,
      textPrompt: textPrompt.trim() || undefined,
      resolution,
      durationSeconds: effectiveDuration,
    })
  }

  const audioTabs = [
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    { id: 'record' as const, label: 'Record', icon: Mic },
    { id: 'tts' as const, label: 'TTS', icon: Volume2 },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">UGC Avatar</h1>
        <p className="text-sm text-gray-400 mt-1">Create talking avatar videos from a portrait photo and audio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          {/* Portrait Upload */}
          <div className="relative">
            <ImageUpload
              onUpload={setImageUrl}
              currentImage={imageUrl}
              onClear={() => setImageUrl(null)}
              disabled={isGenerating}
            />
            {/* Edit button overlay */}
            {imageUrl && !isGenerating && (
              <button
                onClick={() => setShowCropDialog(true)}
                className="absolute top-8 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-white hover:bg-black/80 transition-colors border border-white/10"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>

          {/* Audio Source Tabs */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Audio Source</label>
            <div className="flex gap-1 p-1 rounded-lg bg-nyx-surface border border-nyx-border">
              {audioTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setAudioTab(tab.id); if (tab.id !== audioTab) { setAudioUrl(null); setAudioDuration(0) } }}
                  disabled={isGenerating}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all',
                    audioTab === tab.id
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5',
                    isGenerating && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {audioTab === 'upload' && (
              <AudioUpload
                onUpload={handleAudioUpload}
                currentAudio={audioUrl}
                onClear={() => { setAudioUrl(null); setAudioDuration(0) }}
                disabled={isGenerating}
              />
            )}

            {audioTab === 'record' && (
              <AudioRecorder
                onRecorded={handleRecorded}
                disabled={isGenerating}
              />
            )}

            {audioTab === 'tts' && (
              <TTSAudioSource
                userId={user?.id}
                onAudioReady={handleAudioUpload}
                disabled={isGenerating}
              />
            )}
          </div>

          {/* Settings */}
          <UGCSettings
            resolution={resolution}
            onResolutionChange={setResolution}
            duration={duration}
            onDurationChange={setDuration}
            textPrompt={textPrompt}
            onTextPromptChange={setTextPrompt}
            seed={seed}
            onSeedChange={setSeed}
            disabled={isGenerating}
            audioDuration={audioDuration}
          />

          {/* Credit Cost */}
          <CreditCostDisplay cost={cost} balance={balance} />

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!imageUrl || !audioUrl || isGenerating || balance < cost}
            loading={isGenerating}
            className="w-full"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Avatar Video
          </Button>

          {isGenerating && (
            <div className="rounded-lg bg-primary-500/5 border border-primary-500/20 p-3">
              <p className="text-xs text-gray-400">
                Avatar generation typically takes 2–5 minutes depending on duration. You can stay on this page — the result will appear automatically.
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

      {/* Image Crop Dialog */}
      {showCropDialog && imageUrl && (
        <ImageCropDialog
          imageUrl={imageUrl}
          onSave={handleCropSave}
          onCancel={() => setShowCropDialog(false)}
        />
      )}
    </div>
  )
}
