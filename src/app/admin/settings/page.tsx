'use client'

import { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Shield, Zap, AlertTriangle } from 'lucide-react'

interface SiteSettings {
  maintenance_mode: boolean
  registration_enabled: boolean
  free_credits: number
  max_generations_per_minute: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    maintenance_mode: false,
    registration_enabled: true,
    free_credits: 50,
    max_generations_per_minute: 10,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminFetch('/api/admin/settings')
        if (!res.ok) throw new Error('Failed to fetch settings')
        const data = await res.json()
        const mapped: Record<string, any> = {}
        for (const doc of data.settings || []) {
          // value is jsonb so no JSON.parse needed
          mapped[doc.key] = doc.value
        }
        setSettings({
          maintenance_mode: mapped.maintenance_mode === true,
          registration_enabled: mapped.registration_enabled !== false,
          free_credits: typeof mapped.free_credits === 'number' ? mapped.free_credits : 50,
          max_generations_per_minute: typeof mapped.max_generations_per_minute === 'number' ? mapped.max_generations_per_minute : 10,
        })
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const entries = [
        { key: 'maintenance_mode', value: settings.maintenance_mode },
        { key: 'registration_enabled', value: settings.registration_enabled },
        { key: 'free_credits', value: settings.free_credits },
        { key: 'max_generations_per_minute', value: settings.max_generations_per_minute },
      ]

      for (const entry of entries) {
        const res = await adminFetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: entry.key, value: entry.value }),
        })
        if (!res.ok) throw new Error(`Failed to save ${entry.key}`)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Platform configuration and feature flags</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-primary-400" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Maintenance Mode</p>
              <p className="text-xs text-gray-500">Disable the platform for all non-admin users</p>
            </div>
            <Toggle
              checked={settings.maintenance_mode}
              onChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Registration</p>
              <p className="text-xs text-gray-500">Allow new user signups</p>
            </div>
            <Toggle
              checked={settings.registration_enabled}
              onChange={(checked) => setSettings({ ...settings, registration_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-primary-400" />
            Credits & Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Free Credits on Signup"
            type="number"
            value={settings.free_credits.toString()}
            onChange={(e) => setSettings({ ...settings, free_credits: parseInt(e.target.value) || 0 })}
            helperText="Number of credits given to new users"
          />
          <Input
            label="Max Generations per Minute"
            type="number"
            value={settings.max_generations_per_minute.toString()}
            onChange={(e) => setSettings({ ...settings, max_generations_per_minute: parseInt(e.target.value) || 1 })}
            helperText="Rate limit per user per minute"
          />
        </CardContent>
      </Card>

      {settings.maintenance_mode && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-200">
            Maintenance mode is enabled. Only admin users can access the platform.
          </p>
        </div>
      )}

      <Button onClick={handleSave} loading={saving} size="lg">
        <Settings className="h-4 w-4 mr-2" />
        {saved ? 'Saved!' : 'Save Settings'}
      </Button>
    </div>
  )
}
