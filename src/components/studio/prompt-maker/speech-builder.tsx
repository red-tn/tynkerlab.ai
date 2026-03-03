'use client'

import { SPEECH_ROLES, SPEECH_GOALS, SPEECH_TONES, SPEECH_FORMATS } from '@/lib/prompt-maker/options'

export interface SpeechFields {
  topic: string
  role: string
  goal: string
  tone: string
  format: string
}

interface SpeechBuilderProps {
  fields: SpeechFields
  onChange: (fields: SpeechFields) => void
}

export function SpeechBuilder({ fields, onChange }: SpeechBuilderProps) {
  const update = (partial: Partial<SpeechFields>) => onChange({ ...fields, ...partial })

  return (
    <div className="space-y-4">
      {/* Topic / Content */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">
          Topic / Content <span className="text-red-400">*</span>
        </label>
        <textarea
          value={fields.topic}
          onChange={(e) => update({ topic: e.target.value })}
          placeholder="The importance of renewable energy in combating climate change..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 resize-none"
        />
      </div>

      {/* Dropdowns grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Act As */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Act As</label>
          <select
            value={fields.role}
            onChange={(e) => update({ role: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select role...</option>
            {SPEECH_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Goal */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Goal</label>
          <select
            value={fields.goal}
            onChange={(e) => update({ goal: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select goal...</option>
            {SPEECH_GOALS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Tone</label>
          <select
            value={fields.tone}
            onChange={(e) => update({ tone: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select tone...</option>
            {SPEECH_TONES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Format */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Format</label>
          <select
            value={fields.format}
            onChange={(e) => update({ format: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">Select format...</option>
            {SPEECH_FORMATS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
