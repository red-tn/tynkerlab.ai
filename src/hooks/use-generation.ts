'use client'

import { useState, useCallback } from 'react'
import { useGenerationStore } from '@/stores/generation-store'

type GenerationState = 'idle' | 'generating' | 'polling' | 'completed' | 'failed'

interface GenerationResult {
  url: string
  type: 'image' | 'video'
  width?: number
  height?: number
  seed?: number
}

interface UseGenerationOptions {
  onComplete?: (result: GenerationResult) => void
  onError?: (error: string) => void
}

export function useGeneration(options?: UseGenerationOptions) {
  const [state, setState] = useState<GenerationState>('idle')
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [progressNote, setProgressNote] = useState<string>('')
  const [jobId, setJobId] = useState<string | null>(null)

  const reset = useCallback(() => {
    setState('idle')
    setResult(null)
    setError(null)
    setProgress('')
    setProgressPercent(0)
    setProgressNote('')
    setJobId(null)
  }, [])

  const generateImage = useCallback(async (params: {
    model: string
    prompt: string
    negativePrompt?: string
    width?: number
    height?: number
    steps?: number
    seed?: number
    imageUrl?: string
    type: 'text-to-image' | 'image-to-image'
  }) => {
    reset()
    setState('generating')
    setProgress('Generating image...')

    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await res.json()
      const genResult: GenerationResult = {
        url: data.url,
        type: 'image',
        width: data.width,
        height: data.height,
        seed: data.seed,
      }

      setResult(genResult)
      setState('completed')
      options?.onComplete?.(genResult)
    } catch (err: any) {
      const errorMsg = err.message || 'Generation failed'
      setError(errorMsg)
      setState('failed')
      options?.onError?.(errorMsg)
    }
  }, [reset, options])

  const generateVideo = useCallback(async (params: {
    model: string
    prompt: string
    width?: number
    height?: number
    imageUrl?: string
    type: 'text-to-video' | 'image-to-video'
    userId?: string
    duration?: number
    aspectRatio?: string
    negativePrompt?: string
  }) => {
    reset()
    setState('generating')
    setProgress('Submitting video job...')

    try {
      // Submit job
      const submitRes = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!submitRes.ok) {
        const data = await submitRes.json()
        throw new Error(data.error || 'Failed to submit video job')
      }

      const { jobId: vid } = await submitRes.json()
      setJobId(vid)

      useGenerationStore.getState().addGeneration({
        id: vid,
        jobId: vid,
        type: 'video',
        model: params.model,
        prompt: params.prompt,
        startedAt: Date.now(),
        userId: params.userId || '',
      })

      setState('polling')
      setProgress('Warming up the AI...')
      setProgressPercent(5)
      setProgressNote('Your video is in the queue')

      // Poll for completion — up to 10 minutes (video can be slow)
      const maxAttempts = 120 // 10 minutes at 5s intervals
      let attempts = 0

      // Phase-based progress with friendly messages
      const phases = [
        { at: 0,  pct: 8,  msg: 'Warming up the AI',        note: 'Your video is being prepared' },
        { at: 2,  pct: 12, msg: 'Analyzing your prompt',     note: 'Understanding what you want' },
        { at: 4,  pct: 18, msg: 'Setting the scene',         note: 'Building the visual foundation' },
        { at: 6,  pct: 25, msg: 'Generating frames',         note: 'Bringing your vision to life' },
        { at: 10, pct: 35, msg: 'Rendering in progress',     note: 'This is the fun part' },
        { at: 14, pct: 42, msg: 'Adding motion & detail',    note: 'Making every frame count' },
        { at: 18, pct: 50, msg: 'Halfway there',             note: 'Looking great so far' },
        { at: 22, pct: 58, msg: 'Refining the details',      note: 'Polishing each frame' },
        { at: 26, pct: 65, msg: 'Smoothing transitions',     note: 'Making it flow perfectly' },
        { at: 30, pct: 72, msg: 'Almost done',               note: 'Your video is nearly ready' },
        { at: 36, pct: 80, msg: 'Making your video perfect', note: 'Final quality pass' },
        { at: 42, pct: 85, msg: 'Finishing touches',         note: 'Just a little longer' },
        { at: 50, pct: 90, msg: 'Wrapping up',               note: 'Preparing your download' },
        { at: 60, pct: 92, msg: 'Still working on it',       note: 'Premium models take a bit longer — worth the wait' },
        { at: 80, pct: 95, msg: 'Hang tight',                note: 'Complex scenes take extra time' },
      ]

      // Rotating fun tips shown below the progress
      const tips = [
        'Tip: Detailed prompts produce better results',
        'Did you know? You can use negative prompts to refine output',
        'Tip: 16:9 is ideal for cinematic scenes',
        'Fun fact: AI generates videos frame by frame',
        'Tip: Try different models for different visual styles',
        'Tip: Shorter prompts can sometimes yield more creative results',
        'Did you know? You can download and share your creations instantly',
      ]

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++

        const secs = attempts * 5
        const mins = Math.floor(secs / 60)
        const remainSecs = secs % 60
        const timeStr = mins > 0 ? `${mins}m ${remainSecs}s` : `${secs}s`
        const phase = [...phases].reverse().find(p => attempts >= p.at) || phases[0]
        setProgress(`${phase.msg}...`)
        setProgressPercent(Math.min(phase.pct + Math.floor(Math.random() * 3), 97))
        // Rotate tips every 15 seconds
        const tipIndex = Math.floor(attempts / 3) % tips.length
        setProgressNote(attempts % 3 === 0 ? tips[tipIndex] : phase.note)

        const pollRes = await fetch(`/api/generate/video?jobId=${vid}`)
        if (!pollRes.ok) continue

        const status = await pollRes.json()

        if (status.status === 'completed' && status.url) {
          const genResult: GenerationResult = {
            url: status.url,
            type: 'video',
          }
          setResult(genResult)
          setState('completed')
          useGenerationStore.getState().removeGeneration(vid)
          options?.onComplete?.(genResult)
          return
        }

        if (status.status === 'failed') {
          useGenerationStore.getState().removeGeneration(vid)
          throw new Error(status.error || 'Video generation failed')
        }
      }

      // Timed out — request refund from server
      try {
        await fetch('/api/generate/video', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: vid }),
        })
      } catch {}
      useGenerationStore.getState().removeGeneration(vid)
      throw new Error('Video generation timed out — your credits have been refunded')
    } catch (err: any) {
      const errorMsg = err.message || 'Video generation failed'
      setError(errorMsg)
      setState('failed')
      setProgressPercent(0)
      options?.onError?.(errorMsg)
    }
  }, [reset, options])

  const cancel = useCallback(async () => {
    if (jobId && (state === 'generating' || state === 'polling')) {
      try {
        await fetch('/api/generate/video', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        })
      } catch {}
      setError('Generation cancelled — credits refunded')
      setState('failed')
      setProgressPercent(0)
      setProgressNote('')
      useGenerationStore.getState().removeGeneration(jobId)
    }
    reset()
  }, [jobId, state, reset])

  return {
    state,
    result,
    error,
    progress,
    progressPercent,
    progressNote,
    jobId,
    generateImage,
    generateVideo,
    cancel,
    reset,
    isGenerating: state === 'generating' || state === 'polling',
  }
}
