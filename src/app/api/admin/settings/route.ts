import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    const supabase = createAdminClient()

    if (key) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', key)
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (data) {
        return NextResponse.json(data)
      }
      return NextResponse.json({ key, value: null })
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(100)

    if (error) throw error

    return NextResponse.json({ settings: data })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if setting exists
    const { data: existing, error: fetchError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', key)
      .limit(1)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (existing) {
      // Update
      const { data: doc, error: updateError } = await supabase
        .from('site_settings')
        .update({ value })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) throw updateError
      return NextResponse.json(doc)
    } else {
      // Create
      const { data: doc, error: insertError } = await supabase
        .from('site_settings')
        .insert({ key, value })
        .select()
        .single()

      if (insertError) throw insertError
      return NextResponse.json(doc)
    }
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
