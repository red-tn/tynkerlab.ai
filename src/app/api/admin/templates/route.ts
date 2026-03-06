import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category')

    const supabase = createAdminClient()
    let query = supabase
      .from('templates')
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(page * limit, page * limit + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ templates: data, total: count })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json()

    if (!body.name || !body.basePrompt || !body.recommendedModel) {
      return NextResponse.json({ error: 'Name, base prompt, and recommended model are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('templates')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        category: body.category || 'product',
        generation_type: body.generationType || 'image',
        recommended_model: body.recommendedModel,
        base_prompt: body.basePrompt,
        prompt_variables: body.promptVariables || [],
        photo_slots: body.photoSlots || [],
        platform_presets: body.platformPresets || [],
        default_aspect_ratio: body.defaultAspectRatio || '1:1',
        default_platform: body.defaultPlatform || 'instagram_feed',
        credits_override: body.creditsOverride ?? null,
        tags: body.tags || [],
        is_published: body.isPublished ?? false,
        is_featured: body.isFeatured ?? false,
        sort_order: body.sortOrder ?? 0,
        ...(body.previewImageUrl ? { preview_image_url: body.previewImageUrl } : {}),
        ...(body.createdBy ? { created_by: body.createdBy } : {}),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
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
    const { data, error } = await supabase
      .from('templates')
      .update(snakeUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
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
      .from('templates')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
