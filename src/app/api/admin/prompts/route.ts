import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = createAdminClient()
    const { data, count, error } = await supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, page * limit + limit - 1)

    if (error) throw error

    return NextResponse.json({
      prompts: data,
      total: count,
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { title, promptText, category, modelType, isPublished } = body

    if (!title || !promptText) {
      return NextResponse.json({ error: 'Title and prompt text are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: doc, error } = await supabase
      .from('prompts')
      .insert({
        title,
        prompt_text: promptText,
        category: category || 'general',
        model_type: modelType || 'image',
        is_published: isPublished ?? true,
        usage_count: 0,
        ...(body.modelUsed ? { model_used: body.modelUsed } : {}),
        ...(body.previewImageUrl ? { preview_image_url: body.previewImageUrl } : {}),
        ...(body.isFeatured !== undefined ? { is_featured: body.isFeatured } : {}),
        ...(body.createdBy ? { created_by: body.createdBy } : {}),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(doc)
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Convert camelCase field names to snake_case for Supabase
    const snakeUpdates: Record<string, any> = {}
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
      snakeUpdates[snakeKey] = value
    }

    const supabase = createAdminClient()
    const { data: doc, error } = await supabase
      .from('prompts')
      .update(snakeUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(doc)
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
