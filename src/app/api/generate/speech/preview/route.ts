import { NextResponse } from 'next/server'
import { generateSpeech, getTTSFamily } from '@/lib/together/tts'
import type { TTSVoiceSettings } from '@/types/together'

const PREVIEW_TEXTS: Record<string, string> = {
  // Kokoro voices
  af_alloy: "Hi there, I'm Alloy. Let me help bring your words to life.",
  am_echo: "Hello, I'm Echo. I'll add warmth and character to your text.",
  bm_fable: "Greetings, I'm Fable. Let me tell your story with expression.",
  am_onyx: "Hello, I'm Onyx. My deep voice brings authority to any text.",
  af_nova: "Hey, I'm Nova! Bright and energetic, ready to go.",
  af_sky: "Hello, I'm Sky. Calm and soothing, at your service.",
  af_nicole: "Hi, I'm Nicole! Friendly and ready to chat.",
  am_adam: "Hello, I'm Adam. Measured words for thoughtful content.",
  // Orpheus voices
  tara: "Hello, I'm Tara. Clear and professional, ready when you are.",
  leah: "Hi there, I'm Leah. Warm and conversational, just for you.",
  jess: "Hey, I'm Jess! Casual and friendly, let's do this.",
  leo: "Hello, I'm Leo. Strong and confident, at your service.",
  dan: "Hey, I'm Dan. Relaxed and easy-going, ready to help.",
  mia: "Hi, I'm Mia! Young and dynamic, let's create something great.",
  zac: "Hey, I'm Zac. Bold and direct, let's get to work.",
  zoe: "Hi there, I'm Zoe! Bright and cheerful, happy to help.",
  // Cartesia Sonic 2 voices
  'helpful woman': "Hello, I'm here to help. Let me bring your words to life with clarity.",
  newsman: "Good evening. This is your news anchor voice, bringing you the latest.",
  'reading lady': "Once upon a time, in a world of sound, every word came alive.",
  'wise man': "Listen closely, for these words carry weight and meaning.",
  'california girl': "Oh my gosh, hey! I'm so excited to read your text for you!",
  'calm lady': "Take a deep breath. Everything is going to be just fine.",
}

export async function POST(request: Request) {
  try {
    const { familyId, voice, settings } = await request.json() as {
      familyId: string
      voice: string
      settings?: Partial<TTSVoiceSettings>
    }

    if (!familyId || !voice) {
      return NextResponse.json({ error: 'Missing familyId or voice' }, { status: 400 })
    }

    const family = getTTSFamily(familyId)
    if (!family) {
      return NextResponse.json({ error: 'Invalid model family' }, { status: 400 })
    }

    const text = PREVIEW_TEXTS[voice] || `Hello, I'm ${voice}. Nice to meet you.`

    const audioBuffer = await generateSpeech(family.modelId, text, voice, 'mp3', settings || {})
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
