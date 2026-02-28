'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Play, Pause, Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  src: string | null
  mimeType?: string
  format?: string
  onDownload?: () => void
  className?: string
}

export function AudioPlayer({ src, mimeType = 'audio/mpeg', format = 'mp3', onDownload, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Simple waveform visualization
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const barCount = 60
    const barWidth = (w / barCount) * 0.6
    const gap = (w / barCount) * 0.4

    ctx.clearRect(0, 0, w, h)

    const progress = duration > 0 ? currentTime / duration : 0

    for (let i = 0; i < barCount; i++) {
      // Pseudo-random deterministic heights based on index
      const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453
      const barHeight = (0.2 + (seed - Math.floor(seed)) * 0.8) * h * 0.8

      const x = i * (barWidth + gap)
      const y = (h - barHeight) / 2

      const isPast = (i / barCount) <= progress

      ctx.fillStyle = isPast
        ? 'rgba(59, 130, 246, 0.8)'
        : 'rgba(255, 255, 255, 0.15)'

      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, 2)
      ctx.fill()
    }
  }, [currentTime, duration])

  useEffect(() => {
    drawWaveform()
  }, [drawWaveform])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [src])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }

  const seek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const audio = audioRef.current
    if (!canvas || !audio || !duration) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    audio.currentTime = pct * duration
    setCurrentTime(audio.currentTime)
  }

  const restart = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    setCurrentTime(0)
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
      return
    }
    if (!src) return
    const a = document.createElement('a')
    a.href = src
    a.download = `tynkerlab-tts.${format}`
    a.click()
  }

  if (!src) {
    return (
      <div className={cn('rounded-xl border border-nyx-border bg-nyx-surface p-8 text-center', className)}>
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Play className="h-10 w-10" />
          <p className="text-sm">Generated audio will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-nyx-border bg-nyx-surface p-4 space-y-3', className)}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Waveform */}
      <canvas
        ref={canvasRef}
        width={480}
        height={60}
        onClick={seek}
        className="w-full h-[60px] cursor-pointer rounded-lg"
      />

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="p-2.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white transition-colors"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>

        <button
          onClick={restart}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <div className="flex-1 text-sm font-mono text-gray-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <Button variant="secondary" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1.5" />
          Download
        </Button>
      </div>
    </div>
  )
}
