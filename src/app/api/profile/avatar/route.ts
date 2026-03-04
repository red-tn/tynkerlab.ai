import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getTogetherClient } from '@/lib/together/client'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'

export async function POST(request: Request) {
  try {
    const { userId } = await requireUser(request)
    const contentType = request.headers.get('content-type') || ''

    // Handle file upload (multipart form data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'file is required' }, { status: 400 })
      }

      // Validate file size (5MB max)
      const MAX_AVATAR_SIZE = 5 * 1024 * 1024
      if (file.size > MAX_AVATAR_SIZE) {
        return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 })
      }

      // Validate file type
      const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Only PNG, JPEG, GIF, and WebP images are allowed' }, { status: 400 })
      }

      const supabase = createAdminClient()
      const ext = file.name.split('.').pop() || 'png'
      const filePath = `avatar-${userId}-${Date.now()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, buffer, { contentType: file.type, upsert: true })

      if (uploadError) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }

      const { data: { publicUrl: avatarUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', userId)

      return NextResponse.json({ avatarUrl })
    }

    // Handle AI avatar generation (JSON body)
    const { prompt } = await request.json()
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Generate avatar using Together.ai
    const together = getTogetherClient()
    const response = await together.images.generate({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt: `Professional portrait avatar: ${prompt}. High quality, centered face, clean background.`,
      width: 512,
      height: 512,
      steps: 4,
      n: 1,
      response_format: 'url',
    })

    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    // Download the image and upload to Supabase Storage
    const supabase = createAdminClient()
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const filePath = `avatar-${userId}-${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, Buffer.from(imageBuffer), { contentType: 'image/png', upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const { data: { publicUrl: avatarUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath)

    // Update profile with new avatar
    await supabase
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        avatar_prompt: prompt,
      })
      .eq('user_id', userId)

    return NextResponse.json({ avatarUrl })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    console.error('Avatar generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
