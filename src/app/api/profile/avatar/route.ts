import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getTogetherClient } from '@/lib/together/client'

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json()
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
      .from('avatars')
      .upload(filePath, Buffer.from(imageBuffer), { contentType: 'image/png' })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl: avatarUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update profile with new avatar
    if (userId) {
      await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          avatar_prompt: prompt,
        })
        .eq('user_id', userId)
    }

    return NextResponse.json({ avatarUrl })
  } catch (error: any) {
    console.error('Avatar generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
