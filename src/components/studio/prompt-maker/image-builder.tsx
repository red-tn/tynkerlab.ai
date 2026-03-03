'use client'

import { IMAGE_STYLES, IMAGE_MODIFIERS, IMAGE_LIGHTING, IMAGE_CAMERA } from '@/lib/prompt-maker/options'
import { cn } from '@/lib/utils'

export interface ImageFields {
  subject: string
  style: string
  lighting: string
  camera: string
  modifiers: string[]
  details: string
}

interface ImageBuilderProps {
  fields: ImageFields
  onChange: (fields: ImageFields) => void
}

export function ImageBuilder({ fields, onChange }: ImageBuilderProps) {
  const update = (partial: Partial<ImageFields>) => onChange({ ...fields, ...partial })

  const toggleModifier = (mod: string) => {
    const next = fields.modifiers.includes(mod)
      ? fields.modifiers.filter((m) => m !== mod)
      : [...fields.modifiers, mod]
    update({ modifiers: next })
  }

  return (
    <div className="space-y-4">
      {/* Subject */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Subject <span className="text-red-400">*</span>
        </label>
        <textarea
          value={fields.subject}
          onChange={(e) => update({ subject: e.target.value })}
          placeholder="A majestic dragon perched on a crystal mountain..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 resize-none"
        />
      </div>

      {/* Dropdowns row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Style */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Style</label>
          <select
            value={fields.style}
            onChange={(e) => update({ style: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select style...</option>
            {IMAGE_STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Lighting */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Lighting</label>
          <select
            value={fields.lighting}
            onChange={(e) => update({ lighting: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select lighting...</option>
            {IMAGE_LIGHTING.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Camera Angle */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Camera Angle</label>
          <select
            value={fields.camera}
            onChange={(e) => update({ camera: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select angle...</option>
            {IMAGE_CAMERA.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modifiers (chip multi-select) */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Modifiers</label>
        <div className="flex flex-wrap gap-1.5">
          {IMAGE_MODIFIERS.map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => toggleModifier(mod)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
                fields.modifiers.includes(mod)
                  ? 'bg-primary-500/15 text-primary-300 border-primary-500/30'
                  : 'bg-nyx-surface border-nyx-border text-gray-400 hover:text-white hover:border-gray-600'
              )}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Extra Details */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Extra Details</label>
        <textarea
          value={fields.details}
          onChange={(e) => update({ details: e.target.value })}
          placeholder="Any additional details, references, or constraints..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 resize-none"
        />
      </div>
    </div>
  )
}
