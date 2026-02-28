'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { storage, BUCKET_UPLOADS } from '@/lib/appwrite/client'
import { ID } from 'appwrite'
import { Upload, X, Loader2 } from 'lucide-react'

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
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [imgAspect, setImgAspect] = useState<number | null>(null)

  // Sync preview when currentImage prop changes externally
  useEffect(() => {
    if (currentImage) setPreview(currentImage)
  }, [currentImage])

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
      const uploaded = await storage.createFile(BUCKET_UPLOADS, ID.unique(), file)
      const url = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_UPLOADS}/files/${uploaded.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      onUpload(url)
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
    </div>
  )
}
