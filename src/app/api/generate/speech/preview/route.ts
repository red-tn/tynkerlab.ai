import { NextResponse } from 'next/server'
import { generateSpeech, getTTSFamily } from '@/lib/together/tts'

const PREVIEW_TEXTS: Record<string, string> = {
  alloy: "Hi there, I'm Alloy. Let me help bring your words to life.",
  echo: "Hello, I'm Echo. I'll add warmth and character to your text.",
  fable: "Greetings, I'm Fable. Let me tell your story with expression.",
  onyx: "Hello, I'm Onyx. My deep voice brings authority to any text.",
  nova: "Hey, I'm Nova! Bright and energetic, ready to go.",
  shimmer: "Hello, I'm Shimmer. Calm and soothing, at your service.",
  coral: "Hi, I'm Coral! Friendly and ready to chat.",
  sage: "Hello, I'm Sage. Measured words for thoughtful content.",
  tara: "Hello, I'm Tara. Clear and professional, ready when you are.",
  leah: "Hi there, I'm Leah. Warm and conversational, just for you.",
  jess: "Hey, I'm Jess! Casual and friendly, let's do this.",
  leo: "Hello, I'm Leo. Strong and confident, at your service.",
  dan: "Hey, I'm Dan. Relaxed and easy-going, ready to help.",
  mia: "Hi, I'm Mia! Young and dynamic, let's create something great.",
}

export async function POST(request: Request) {
  try {
    const { familyId, voice } = await request.json() as { familyId: string; voice: string }

    if (!familyId || !voice) {
      return NextResponse.json({ error: 'Missing familyId or voice' }, { status: 400 })
    }

    const family = getTTSFamily(familyId)
    if (!family) {
      return NextResponse.json({ error: 'Invalid model family' }, { status: 400 })
    }

    const text = PREVIEW_TEXTS[voice] || `Hello, I'm ${voice}. Nice to meet you.`

    const audioBuffer = await generateSpeech(family.modelId, text, voice, 'mp3', {})
    const base64 = Buffer.from(audioBuffer).toString('base64')

    return NextResponse.json({
      audio: base64,
      mimeType: 'audio/mpeg',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Preview generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
