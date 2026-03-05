'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Upload, X, Loader2, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react'
import type { Generation } from '@/types/database'

interface ImageUploadProps {
  onUpload: (url: string) => void
  currentImage?: string | null
  onClear?: () => void
  disabled?: boolean
  onAspectRatioDetected?: (ratio: string) => void
}

// Map image dimensions to the closest standard aspect ratio
function detectAspectRatio(width: number, height: number): string {
  const ratio = width / height
  const ratios: { label: string; value: number }[] = [
    { label: '1:1', value: 1 },
    { label: '3:2', value: 3 / 2 },
    { label: '2:3', value: 2 / 3 },
    { label: '4:3', value: 4 / 3 },
    { label: '3:4', value: 3 / 4 },
    { label: '16:9', value: 16 / 9 },
    { label: '9:16', value: 9 / 16 },
    { label: '4:5', value: 4 / 5 },
    { label: '5:4', value: 5 / 4 },
    { label: '21:9', value: 21 / 9 },
  ]
  let closest = ratios[0]
  let minDiff = Math.abs(ratio - ratios[0].value)
  for (const r of ratios) {
    const diff = Math.abs(ratio - r.value)
    if (diff < minDiff) {
      minDiff = diff
      closest = r
    }
  }
  return closest.label
}

export function ImageUpload({ onUpload, currentImage, onClear, disabled, onAspectRatioDetected }: ImageUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [imgAspect, setImgAspect] = useState<number | null>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [libraryImages, setLibraryImages] = useState<Generation[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [libraryLoaded, setLibraryLoaded] = useState(false)

  // Sync preview when currentImage prop changes externally
  useEffect(() => {
    if (currentImage) setPreview(currentImage)
  }, [currentImage])

  // Fetch library images when expanded
  const loadLibrary = useCallback(async () => {
    if (!user || libraryLoaded) return
    setLibraryLoading(true)
    try {
      const { data } = await supabase
        .from('generations')
        .select('id, output_url, prompt, created_at, type, width, height')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .ilike('type', '%image%')
        .not('output_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50)
      setLibraryImages((data || []) as Generation[])
      setLibraryLoaded(true)
    } catch (err) {
      console.error('Failed to load library:', err)
    } finally {
      setLibraryLoading(false)
    }
  }, [user, libraryLoaded])

  const handleLibrarySelect = (gen: Generation) => {
    if (!gen.output_url) return
    setPreview(gen.output_url)
    onUpload(gen.output_url)
    setLibraryOpen(false)
    // Detect aspect ratio from stored dimensions
    if (gen.width && gen.height && onAspectRatioDetected) {
      onAspectRatioDetected(detectAspectRatio(gen.width, gen.height))
      setImgAspect(gen.width / gen.height)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploading(true)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Detect dimensions from the file
    const img = new Image()
    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight
      setImgAspect(aspect)
      if (onAspectRatioDetected) {
        onAspectRatioDetected(detectAspectRatio(img.naturalWidth, img.naturalHeight))
      }
    }
    img.src = objectUrl

    try {
      const ext = file.name.split('.').pop() || 'png'
      const path = `${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
      onUpload(publicUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      setPreview(null)
      setImgAspect(null)
    } finally {
      setUploading(false)
    }
  }, [onUpload, onAspectRatioDetected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: disabled || uploading,
  })

  if (preview) {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Reference Image</label>
        <div
          className="relative rounded-lg overflow-hidden border border-nyx-border bg-nyx-surface flex items-center justify-center"
          style={{ maxHeight: '320px' }}
        >
          <img
            src={preview}
            alt="Uploaded"
            className="max-w-full max-h-[320px] object-contain"
            onLoad={(e) => {
              const el = e.currentTarget
              if (!imgAspect && el.naturalWidth && el.naturalHeight) {
                setImgAspect(el.naturalWidth / el.naturalHeight)
                if (onAspectRatioDetected) {
                  onAspectRatioDetected(detectAspectRatio(el.naturalWidth, el.naturalHeight))
                }
              }
            }}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
            </div>
          )}
          {!uploading && (
            <button
              onClick={() => { setPreview(null); setImgAspect(null); onClear?.() }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-300">Reference Image</label>
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
            <p className="text-sm text-gray-300">{isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}</p>
            <p className="text-xs text-gray-600 mt-1">PNG, JPG, WebP up to 10MB</p>
          </div>
        </div>
      </div>
      {/* My Library expandable section */}
      {user && (
        <div className="border border-nyx-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              const next = !libraryOpen
              setLibraryOpen(next)
              if (next) loadLibrary()
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary-400" />
              My Library
            </span>
            {libraryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {libraryOpen && (
            <div className="border-t border-nyx-border px-3 py-3">
              {libraryLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 text-primary-400 animate-spin" />
                </div>
              ) : libraryImages.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No generated images yet</p>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {libraryImages.map((gen) => (
                    <button
                      key={gen.id}
                      type="button"
                      onClick={() => handleLibrarySelect(gen)}
                      className="relative aspect-square rounded-md overflow-hidden border border-nyx-border hover:border-primary-500 transition-colors group"
                    >
                      <img
                        src={gen.output_url || ''}
                        alt={gen.prompt || ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
