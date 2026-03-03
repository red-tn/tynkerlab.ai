import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('usage_count', { ascending: false })
      .limit(12)

    return NextResponse.json({ prompts: data || [] })
  } catch (error: any) {
    return NextResponse.json({ prompts: [] })
  }
}
