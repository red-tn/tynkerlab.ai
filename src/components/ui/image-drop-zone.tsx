'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { storage, BUCKET_UPLOADS } from '@/lib/appwrite/client'
import { ID } from 'appwrite'
import { cn } from '@/lib/utils'

interface ImageDropZoneProps {
  value: string
  onChange: (url: string) => void
  className?: string
  label?: string
  compact?: boolean
}

export function ImageDropZone({ value, onChange, className, label, compact }: ImageDropZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return
    setUploading(true)
    try {
      const uploaded = await storage.createFile(BUCKET_UPLOADS, ID.unique(), file)
      const fileUrl = storage.getFileView(BUCKET_UPLOADS, uploaded.$id).toString()
      onChange(fileUrl)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }, [uploadFile])

  const handleClear = useCallback(() => {
    onChange('')
  }, [onChange])

  if (value) {
    return (
      <div className={cn('relative group', className)}>
        {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
        <div className={cn(
          'relative rounded-lg overflow-hidden border border-nyx-border bg-nyx-bg',
          compact ? 'aspect-video' : 'aspect-video'
        )}>
          {value.includes('.mp4') || value.includes('.webm') ? (
            <video src={value} className="w-full h-full object-cover" muted />
          ) : (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          )}
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
          compact ? 'py-6 px-4' : 'aspect-video',
          'flex flex-col items-center justify-center gap-2',
          dragOver
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-nyx-border hover:border-primary-500/50 hover:bg-white/[0.02] bg-nyx-bg'
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 text-primary-400 animate-spin" />
            <span className="text-xs text-gray-400">Uploading...</span>
          </>
        ) : (
          <>
            <div className={cn(
              'rounded-lg bg-nyx-surface p-2',
              dragOver ? 'text-primary-400' : 'text-gray-500'
            )}>
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">
                <span className="text-primary-400 font-medium">Click to upload</span> or drag & drop
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">PNG, JPG, GIF, WEBP, MP4</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  )
}
