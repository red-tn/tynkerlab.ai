'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Mic, Square, Play, Pause, Loader2, Trash2 } from 'lucide-react'

interface AudioRecorderProps {
  onRecorded: (url: string, duration: number) => void
  disabled?: boolean
}

export function AudioRecorder({ onRecorded, disabled }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const MAX_DURATION = 300 // 5 minutes

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
      setElapsed(0)

      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= MAX_DURATION - 1) {
            mediaRecorderRef.current?.stop()
            setRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
            return MAX_DURATION
          }
          return prev + 1
        })
      }, 1000)
    } catch {
      // Permission denied or no mic
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const uploadRecording = useCallback(async () => {
    if (!audioBlob) return
    setUploading(true)

    try {
      const path = `audio/${crypto.randomUUID()}.webm`
      const { error: uploadError } = await supabase.storage.from('uploads').upload(path, audioBlob)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
      onRecorded(publicUrl, elapsed)
    } catch (err) {
      console.error('Recording upload failed:', err)
    } finally {
      setUploading(false)
    }
  }, [audioBlob, elapsed, onRecorded])

  const clearRecording = useCallback(() => {
    setAudioBlob(null)
    setAudioUrl(null)
    setElapsed(0)
    setPlaying(false)
  }, [])

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }, [playing])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // Already recorded — show playback + upload
  if (audioUrl && audioBlob) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-nyx-border bg-nyx-surface p-4">
          <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
          <div className="flex items-center gap-3">
            <button onClick={togglePlayback} className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center hover:bg-primary-500/30 transition-colors">
              {playing ? <Pause className="h-4 w-4 text-primary-400" /> : <Play className="h-4 w-4 text-primary-400" />}
            </button>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-nyx-bg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-accent-400 rounded-full" style={{ width: '100%' }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">Recorded: {formatTime(elapsed)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearRecording} disabled={uploading}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Discard
          </Button>
          <Button variant="primary" size="sm" onClick={uploadRecording} disabled={uploading} className="flex-1">
            {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
            {uploading ? 'Uploading...' : 'Use Recording'}
          </Button>
        </div>
      </div>
    )
  }

  // Recording or idle
  return (
    <div className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed border-nyx-border">
      {recording ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-mono text-red-400">{formatTime(elapsed)}</span>
            <span className="text-xs text-gray-500">/ {formatTime(MAX_DURATION)}</span>
          </div>
          <Button variant="danger" size="sm" onClick={stopRecording}>
            <Square className="h-3.5 w-3.5 mr-1" /> Stop Recording
          </Button>
        </>
      ) : (
        <>
          <Mic className="h-8 w-8 text-gray-500" />
          <p className="text-sm text-gray-400">Click to start recording</p>
          <p className="text-xs text-gray-600">Max 5 minutes</p>
          <Button variant="secondary" size="sm" onClick={startRecording} disabled={disabled}>
            <Mic className="h-3.5 w-3.5 mr-1" /> Record Audio
          </Button>
        </>
      )}
    </div>
  )
}
