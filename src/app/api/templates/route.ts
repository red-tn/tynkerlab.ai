import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const supabase = createAdminClient()
    let query = supabase
      .from('templates')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ templates: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slug } = body

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: template } = await supabase
      .from('templates')
      .select('usage_count')
      .eq('slug', slug)
      .single()

    if (template) {
      await supabase
        .from('templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('slug', slug)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
