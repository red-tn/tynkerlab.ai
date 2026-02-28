'use client'

import { useState, useEffect } from 'react'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/client'
import { Query } from 'appwrite'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Shield, Zap, AlertTriangle } from 'lucide-react'

interface SiteSettings {
  maintenanceMode: boolean
  registrationEnabled: boolean
  freeCredits: number
  maxGenerationsPerMinute: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    maintenanceMode: false,
    registrationEnabled: true,
    freeCredits: 50,
    maxGenerationsPerMinute: 10,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
          Query.limit(10),
        ])
        const mapped: Record<string, any> = {}
        for (const doc of result.documents) {
          mapped[(doc as any).key] = (doc as any).value
        }
        setSettings({
          maintenanceMode: mapped.maintenanceMode === 'true',
          registrationEnabled: mapped.registrationEnabled !== 'false',
          freeCredits: parseInt(mapped.freeCredits) || 50,
          maxGenerationsPerMinute: parseInt(mapped.maxGenerationsPerMinute) || 10,
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
        { key: 'maintenanceMode', value: settings.maintenanceMode.toString() },
        { key: 'registrationEnabled', value: settings.registrationEnabled.toString() },
        { key: 'freeCredits', value: settings.freeCredits.toString() },
        { key: 'maxGenerationsPerMinute', value: settings.maxGenerationsPerMinute.toString() },
      ]

      for (const entry of entries) {
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
          Query.equal('key', entry.key), Query.limit(1),
        ])
        if (existing.documents[0]) {
          await databases.updateDocument(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, existing.documents[0].$id, {
            value: entry.value,
          })
        }
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
              checked={settings.maintenanceMode}
              onChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Registration</p>
              <p className="text-xs text-gray-500">Allow new user signups</p>
            </div>
            <Toggle
              checked={settings.registrationEnabled}
              onChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
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
            value={settings.freeCredits.toString()}
            onChange={(e) => setSettings({ ...settings, freeCredits: parseInt(e.target.value) || 0 })}
            helperText="Number of credits given to new users"
          />
          <Input
            label="Max Generations per Minute"
            type="number"
            value={settings.maxGenerationsPerMinute.toString()}
            onChange={(e) => setSettings({ ...settings, maxGenerationsPerMinute: parseInt(e.target.value) || 1 })}
            helperText="Rate limit per user per minute"
          />
        </CardContent>
      </Card>

      {settings.maintenanceMode && (
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
