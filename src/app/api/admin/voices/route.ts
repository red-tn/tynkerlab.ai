import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

const SETTINGS_KEY = 'voice_config'

async function getVoiceConfig(supabase: any): Promise<Record<string, any>> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', SETTINGS_KEY)
      .limit(1)
      .maybeSingle()

    if (error) throw error
    if (data) {
      return data.value || {}
    }
  } catch {}
  return {}
}

async function saveVoiceConfig(supabase: any, config: Record<string, any>) {
  const { data: existing, error: fetchError } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', SETTINGS_KEY)
    .limit(1)
    .maybeSingle()

  if (fetchError) throw fetchError

  if (existing) {
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({ value: config })
      .eq('id', existing.id)

    if (updateError) throw updateError
  } else {
    const { error: insertError } = await supabase
      .from('site_settings')
      .insert({ key: SETTINGS_KEY, value: config })

    if (insertError) throw insertError
  }
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()
    const config = await getVoiceConfig(supabase)
    return NextResponse.json({ config })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()
    const body = await request.json()
    const { voiceKey, enabled, displayName, featured } = body

    if (!voiceKey) {
      return NextResponse.json({ error: 'voiceKey required' }, { status: 400 })
    }

    const config = await getVoiceConfig(supabase)

    if (!config[voiceKey]) {
      config[voiceKey] = {}
    }

    if (typeof enabled === 'boolean') config[voiceKey].enabled = enabled
    if (typeof displayName === 'string') config[voiceKey].displayName = displayName
    if (typeof featured === 'boolean') config[voiceKey].featured = featured

    await saveVoiceConfig(supabase, config)

    return NextResponse.json({ config })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
