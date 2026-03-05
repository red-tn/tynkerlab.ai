import { NextResponse } from 'next/server'
import { generateSpeech, getTTSFamily } from '@/lib/together/tts'
import { deductCredits, addCredits, checkCredits } from '@/lib/credits'
import { getUserTier, requirePaidTier, TierGateError } from '@/lib/tier-gate'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/server'
import type { TTSResponseFormat, TTSVoiceSettings } from '@/types/together'

export async function POST(request: Request) {
  try {
    const startTime = Date.now()
    const { userId } = await requireUser(request)
    const body = await request.json()
    const {
      familyId,
      voice,
      input,
      responseFormat = 'mp3',
      settings = {},
    } = body as {
      familyId: string
      voice: string
      input: string
      responseFormat?: TTSResponseFormat
      settings?: Partial<TTSVoiceSettings>
    }

    if (!familyId || !voice || !input) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const family = getTTSFamily(familyId)
    if (!family) {
      return NextResponse.json({ error: 'Invalid model family' }, { status: 400 })
    }

    // Tier gate: premium TTS voices (non-Kokoro) require a paid subscription
    if (familyId !== 'kokoro') {
      const tier = await getUserTier(userId)
      try {
        requirePaidTier(tier, 'Premium TTS voices')
      } catch (e) {
        if (e instanceof TierGateError) {
          return NextResponse.json({ error: e.message }, { status: 403 })
        }
        throw e
      }
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
    const deducted = await deductCredits(
      userId,
      family.creditsPerGeneration,
      `TTS generation: ${family.name} - ${voice}`,
      generationRef,
    )

    if (!deducted) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 402 })
    }

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

      // Fire-and-forget: log API usage for cost tracking
      const rate = parseFloat(family.pricePerMillion.replace(/[^0-9.]/g, '')) || 0
      const costEstimate = (input.length / 1_000_000) * rate
      const supabase = createAdminClient()
      supabase.from('api_usage_log').insert({
        user_id: userId,
        endpoint: 'audio/speech',
        model: family.modelId,
        request_type: 'text-to-speech',
        cost_estimate: costEstimate,
        latency_ms: Date.now() - startTime,
        status_code: 200,
        request_metadata: { voice, familyId, characterCount: input.length, creditsUsed: family.creditsPerGeneration },
      }).then(() => {}, () => {})

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
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 })
    }
  } catch (error: unknown) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
