import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch the generation to verify ownership and get file info
    const { data: gen, error: fetchError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !gen) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    if (gen.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Try to delete the file from storage if it exists
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_UPLOADS || 'uploads'
    if (gen.output_url) {
      try {
        // Extract file path from Supabase storage URL: .../object/public/{bucket}/{path}
        const match = gen.output_url.match(/\/object\/public\/[^/]+\/(.+)$/)
        if (match) {
          await supabase.storage.from(bucket).remove([match[1]])
        }
      } catch {
        // File may already be deleted or URL format different — continue
      }
    }

    // Delete the generation document
    await supabase.from('generations').delete().eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
