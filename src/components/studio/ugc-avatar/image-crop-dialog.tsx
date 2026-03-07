'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { Crop as CropIcon, RotateCcw, Check, X, Loader2, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut } from 'lucide-react'

interface ImageCropDialogProps {
  imageUrl: string
  onSave: (croppedUrl: string) => void
  onCancel: () => void
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 70 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  )
}

export function ImageCropDialog({ imageUrl, onSave, onCancel }: ImageCropDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [saving, setSaving] = useState(false)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [aspect, setAspect] = useState<number | undefined>(undefined)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    // Default to portrait-friendly crop for avatars
    const initialCrop = centerAspectCrop(naturalWidth, naturalHeight, 3 / 4)
    setCrop(initialCrop)
    setCompletedCrop(initialCrop)
  }, [])

  const aspectOptions = [
    { label: 'Free', value: undefined },
    { label: '3:4', value: 3 / 4 },
    { label: '1:1', value: 1 },
    { label: '9:16', value: 9 / 16 },
  ]

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect)
    if (newAspect && imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current
      setCrop(centerAspectCrop(naturalWidth, naturalHeight, newAspect))
    }
  }

  const handleReset = () => {
    setFlipH(false)
    setFlipV(false)
    setBrightness(100)
    setContrast(100)
    setAspect(undefined)
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current
      setCrop(centerAspectCrop(naturalWidth, naturalHeight, 3 / 4))
    }
  }

  const handleSave = async () => {
    if (!imgRef.current || !canvasRef.current) return
    setSaving(true)

    const image = imgRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const cropX = (completedCrop?.x ?? 0) * scaleX
    const cropY = (completedCrop?.y ?? 0) * scaleY
    const cropW = (completedCrop?.width ?? image.naturalWidth) * scaleX
    const cropH = (completedCrop?.height ?? image.naturalHeight) * scaleY

    canvas.width = cropW
    canvas.height = cropH

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
    ctx.save()

    if (flipH || flipV) {
      ctx.translate(flipH ? cropW : 0, flipV ? cropH : 0)
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    }

    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
    ctx.restore()

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.95))
      if (!blob) throw new Error('Failed to create image blob')

      const path = `edited/${crypto.randomUUID()}.png`
      const { error: uploadError } = await supabase.storage.from('uploads').upload(path, blob, { contentType: 'image/png' })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
      onSave(publicUrl)
    } catch (err) {
      console.error('Failed to save edited image:', err)
    } finally {
      setSaving(false)
    }
  }

  const imgStyle: React.CSSProperties = {
    transform: `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-nyx-surface border border-nyx-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-nyx-border">
          <div className="flex items-center gap-2">
            <CropIcon className="h-4 w-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">Edit Portrait</h3>
          </div>
          <button onClick={onCancel} className="p-1 rounded hover:bg-white/10 transition-colors" aria-label="Close">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Crop area */}
        <div className="p-4 flex items-center justify-center bg-black/30 min-h-[300px]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Edit"
              onLoad={onImageLoad}
              style={imgStyle}
              className="max-h-[50vh] max-w-full"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-t border-nyx-border space-y-3">
          {/* Aspect ratio */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-14 shrink-0">Crop</span>
            <div className="flex gap-1">
              {aspectOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleAspectChange(opt.value)}
                  className={`px-2 py-1 text-xs rounded transition-all ${
                    aspect === opt.value
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/50'
                      : 'bg-white/5 text-gray-400 border border-nyx-border hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flip buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-14 shrink-0">Flip</span>
            <button
              onClick={() => setFlipH(!flipH)}
              className={`p-1.5 rounded transition-all ${flipH ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              title="Flip horizontal"
            >
              <FlipHorizontal className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFlipV(!flipV)}
              className={`p-1.5 rounded transition-all ${flipV ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              title="Flip vertical"
            >
              <FlipVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Brightness */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-14 shrink-0">
              <ZoomIn className="h-3.5 w-3.5 inline mr-1" />Bright
            </span>
            <input
              type="range"
              min={50}
              max={150}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="flex-1 accent-primary-500 h-1"
            />
            <span className="text-xs text-gray-500 w-8 text-right">{brightness}%</span>
          </div>

          {/* Contrast */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-14 shrink-0">
              <ZoomOut className="h-3.5 w-3.5 inline mr-1" />Contrast
            </span>
            <input
              type="range"
              min={50}
              max={150}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="flex-1 accent-primary-500 h-1"
            />
            <span className="text-xs text-gray-500 w-8 text-right">{contrast}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-nyx-border">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
