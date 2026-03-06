import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'
import { SEED_TEMPLATES } from '@/lib/templates/seed-templates'

export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()

    // Get existing template slugs to avoid duplicates
    const { data: existing } = await supabase
      .from('templates')
      .select('slug')

    const existingSlugs = new Set((existing || []).map(t => t.slug))
    const toInsert = SEED_TEMPLATES.filter(t => !existingSlugs.has(t.slug))

    if (toInsert.length === 0) {
      return NextResponse.json({ message: 'All seed templates already exist', inserted: 0 })
    }

    const { data, error } = await supabase
      .from('templates')
      .insert(toInsert)
      .select()

    if (error) throw error

    return NextResponse.json({ message: `Inserted ${data.length} templates`, inserted: data.length, templates: data })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
