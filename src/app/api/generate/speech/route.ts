import { NextResponse } from 'next/server'
import { generateSpeech, getTTSFamily } from '@/lib/together/tts'
import { deductCredits, addCredits, checkCredits } from '@/lib/credits'
import type { TTSResponseFormat, TTSVoiceSettings } from '@/types/together'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      familyId,
      voice,
      input,
      responseFormat = 'mp3',
      settings = {},
    } = body as {
      userId: string
      familyId: string
      voice: string
      input: string
      responseFormat?: TTSResponseFormat
      settings?: Partial<TTSVoiceSettings>
    }

    if (!userId || !familyId || !voice || !input) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const family = getTTSFamily(familyId)
    if (!family) {
      return NextResponse.json({ error: 'Invalid model family' }, { status: 400 })
    }

    if (input.length > family.maxCharacters) {
      return NextResponse.json(
        { error: `Text exceeds ${family.maxCharacters.toLocaleString()} character limit for ${family.name}` },
        { status: 400 }
      )
    }

    // Check credits
    const hasCredits = await checkCredits(userId, family.creditsPerGeneration)
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
    }

    // Deduct credits
    const generationRef = `tts-${Date.now()}`
    await deductCredits(
      userId,
      family.creditsPerGeneration,
      `TTS generation: ${family.name} - ${voice}`,
      generationRef,
    )

    try {
      // Generate speech with full voice settings
      const audioBuffer = await generateSpeech(
        family.modelId,
        input,
        voice,
        responseFormat,
        settings,
      )

      // Convert to base64
      const base64 = Buffer.from(audioBuffer).toString('base64')

      const mimeTypes: Record<string, string> = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        opus: 'audio/opus',
      }

      return NextResponse.json({
        audio: base64,
        mimeType: mimeTypes[responseFormat] || 'audio/mpeg',
        format: responseFormat,
        model: family.name,
        voice,
        characterCount: input.length,
        creditsUsed: family.creditsPerGeneration,
      })
    } catch (genError: unknown) {
      // Refund credits on generation failure
      await addCredits(
        userId,
        family.creditsPerGeneration,
        `TTS refund: generation failed - ${family.name}`,
        undefined,
        'refund',
      )
      const message = genError instanceof Error ? genError.message : 'TTS generation failed'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
