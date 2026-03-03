import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')

    const supabase = createAdminClient()
    let query = supabase
      .from('generations')
      .select('*', { count: 'exact' })
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .range(page * limit, page * limit + limit - 1)

    if (type === 'image') {
      query = query.ilike('type', '%image%')
    } else if (type === 'video') {
      query = query.ilike('type', '%video%')
    }

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      generations: data,
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
