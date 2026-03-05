import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const modelType = searchParams.get('type')

    const supabase = createAdminClient()
    let query = supabase
      .from('prompts')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('usage_count', { ascending: false })
      .limit(20)

    if (modelType === 'image' || modelType === 'video') {
      query = query.eq('model_type', modelType)
    }

    const { data } = await query

    return NextResponse.json({ prompts: data || [] })
  } catch (error: any) {
    return NextResponse.json({ prompts: [] })
  }
}
