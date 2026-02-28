'use client'

import { useState, useEffect } from 'react'
import { TTS_MODEL_FAMILIES } from '@/lib/together/tts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Toggle } from '@/components/ui/toggle'
import { Volume2, Star, Coins } from 'lucide-react'

interface VoiceConfig {
  enabled?: boolean
  displayName?: string
  featured?: boolean
}

export default function AdminVoicesPage() {
  const [config, setConfig] = useState<Record<string, VoiceConfig>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/voices')
      .then(r => r.json())
      .then(d => setConfig(d.config || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateVoice = async (voiceKey: string, updates: Partial<VoiceConfig>) => {
    setSaving(voiceKey)
    try {
      const res = await fetch('/api/admin/voices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceKey, ...updates }),
      })
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  const getVoiceConfig = (key: string): VoiceConfig => config[key] || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Voice Management</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage TTS voices across all model families. Enable/disable voices and mark them as featured.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading voice catalog...</div>
      ) : (
        <div className="space-y-8">
          {TTS_MODEL_FAMILIES.map((family) => (
            <div key={family.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">{family.name}</h2>
                <Badge variant="default" className="text-[10px]">{family.description}</Badge>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Coins className="h-3 w-3" />
                  {family.creditsPerGeneration} credit{family.creditsPerGeneration > 1 ? 's' : ''} / generation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {family.voices.map((voice) => {
                  const key = `${family.id}:${voice.id}`
                  const voiceCfg = getVoiceConfig(key)
                  const isEnabled = voiceCfg.enabled !== false
                  const isFeatured = voiceCfg.featured === true
                  const isSaving = saving === key

                  return (
                    <div
                      key={key}
                      className={`relative rounded-xl border p-4 transition-all ${
                        isEnabled
                          ? 'border-nyx-border bg-nyx-surface'
                          : 'border-nyx-border/50 bg-nyx-surface/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-primary-400" />
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {voiceCfg.displayName || voice.name}
                            </p>
                            <p className="text-[10px] text-gray-500">{voice.description}</p>
                          </div>
                        </div>
                        {isFeatured && (
                          <Badge variant="warning" className="text-[10px]">
                            <Star className="h-2.5 w-2.5 mr-0.5" /> Featured
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Toggle
                            checked={isEnabled}
                            onChange={(checked) => updateVoice(key, { enabled: checked })}
                          />
                          <span className="text-xs text-gray-400">
                            {isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <button
                          onClick={() => updateVoice(key, { featured: !isFeatured })}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                            isFeatured
                              ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                              : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10'
                          }`}
                        >
                          <Star className="h-3 w-3" />
                          {isFeatured ? 'Unfavorite' : 'Feature'}
                        </button>
                      </div>

                      {isSaving && (
                        <div className="absolute inset-0 rounded-xl bg-nyx-bg/50 flex items-center justify-center">
                          <div className="h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
