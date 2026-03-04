import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'

export async function POST(request: Request) {
  try {
    const { userId } = await requireUser(request)
    const body = await request.json()
    const { title, promptText, category, modelType, modelUsed, previewImageUrl, userName } = body

    if (!title || !promptText) {
      return NextResponse.json({ error: 'Title and prompt are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: doc, error } = await supabase
      .from('prompts')
      .insert({
        title,
        prompt_text: promptText,
        category: category || 'general',
        model_type: modelType || 'image',
        model_used: modelUsed || null,
        preview_image_url: previewImageUrl || null,
        is_published: false,
        is_featured: false,
        usage_count: 0,
        submission_status: 'pending',
        submitted_by: userId,
        submitter_name: userName || 'Anonymous',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json(doc)
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
