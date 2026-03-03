'use client'

import { VIDEO_STYLES, VIDEO_CAMERA_MOTION, VIDEO_PACING, VIDEO_MOODS } from '@/lib/prompt-maker/options'

export interface VideoFields {
  subject: string
  style: string
  camera_motion: string
  pacing: string
  mood: string
  details: string
}

interface VideoBuilderProps {
  fields: VideoFields
  onChange: (fields: VideoFields) => void
}

export function VideoBuilder({ fields, onChange }: VideoBuilderProps) {
  const update = (partial: Partial<VideoFields>) => onChange({ ...fields, ...partial })

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
          placeholder="A drone flying over a misty mountain range at sunrise..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 resize-none"
        />
      </div>

      {/* Dropdowns grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Style */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Style</label>
          <select
            value={fields.style}
            onChange={(e) => update({ style: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select style...</option>
            {VIDEO_STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Camera Motion */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Camera Motion</label>
          <select
            value={fields.camera_motion}
            onChange={(e) => update({ camera_motion: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select motion...</option>
            {VIDEO_CAMERA_MOTION.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Pacing */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Pacing</label>
          <select
            value={fields.pacing}
            onChange={(e) => update({ pacing: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select pacing...</option>
            {VIDEO_PACING.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Mood */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Mood</label>
          <select
            value={fields.mood}
            onChange={(e) => update({ mood: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select mood...</option>
            {VIDEO_MOODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Extra Details */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Extra Details</label>
        <textarea
          value={fields.details}
          onChange={(e) => update({ details: e.target.value })}
          placeholder="Any additional scene details, transitions, or effects..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 resize-none"
        />
      </div>
    </div>
  )
}
