'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { Upload, X, Loader2, Music } from 'lucide-react'

interface AudioUploadProps {
  onUpload: (url: string, duration: number) => void
  currentAudio?: string | null
  onClear?: () => void
  disabled?: boolean
}

export function AudioUpload({ onUpload, currentAudio, onClear, disabled }: AudioUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(currentAudio || null)
  const [duration, setDuration] = useState<number>(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploading(true)

    const objectUrl = URL.createObjectURL(file)
    setAudioUrl(objectUrl)

    // Detect duration
    const audio = new Audio()
    audio.addEventListener('loadedmetadata', () => {
      setDuration(Math.ceil(audio.duration))
    })
    audio.src = objectUrl

    try {
      const ext = file.name.split('.').pop() || 'mp3'
      const path = `audio/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)

      // Wait for duration detection
      await new Promise<void>((resolve) => {
        if (audio.duration && !isNaN(audio.duration)) {
          resolve()
        } else {
          audio.addEventListener('loadedmetadata', () => resolve(), { once: true })
        }
      })

      const dur = Math.ceil(audio.duration)
      setDuration(dur)
      setAudioUrl(publicUrl)
      onUpload(publicUrl, dur)
    } catch (err) {
      console.error('Audio upload failed:', err)
      setAudioUrl(null)
      setDuration(0)
    } finally {
      setUploading(false)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
      'audio/mp4': ['.m4a'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    disabled: disabled || uploading,
  })

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
              {duration > 0 && (
                <p className="text-xs text-gray-500 mt-1">Duration: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</p>
              )}
            </div>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary-400 animate-spin" />
            </div>
          )}
          {!uploading && (
            <button
              onClick={() => { setAudioUrl(null); setDuration(0); onClear?.() }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary-500 bg-primary-500/5' : 'border-nyx-border hover:border-nyx-borderBright',
        (disabled || uploading) && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {uploading ? <Loader2 className="h-8 w-8 text-primary-400 animate-spin" /> : <Upload className="h-8 w-8 text-gray-500" />}
        <div>
          <p className="text-sm text-gray-300">{isDragActive ? 'Drop audio here' : 'Drag & drop or click to upload'}</p>
          <p className="text-xs text-gray-600 mt-1">MP3, WAV, OGG, M4A up to 50MB</p>
        </div>
      </div>
    </div>
  )
}
