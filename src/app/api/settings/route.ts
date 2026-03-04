import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Whitelist of keys that can be read without authentication
const PUBLIC_KEYS = ['homepage_tools', 'active_icon_set', 'voice_config']

// Public read-only endpoint for site settings (no auth required).
// Used by the homepage and other public pages to load settings like homepage_tools.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'key parameter is required' }, { status: 400 })
    }

    if (!PUBLIC_KEYS.includes(key)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createAdminClient()

    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', key)
      .limit(1)
      .single()

    if (data) {
      return NextResponse.json(data)
    }

    return NextResponse.json({ key, value: null })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
