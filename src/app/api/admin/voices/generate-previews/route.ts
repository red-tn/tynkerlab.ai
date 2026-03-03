import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'
import { generateSpeech, TTS_MODEL_FAMILIES } from '@/lib/together/tts'
import { getVoicePreviewFileId, VOICE_PREVIEW_TEXTS } from '@/lib/together/voice-previews'

export async function POST(request: Request) {
  try {
    await requireAdmin(request)

    const supabase = createAdminClient()
    const bucketId = 'uploads'

    const results: { voice: string; status: string }[] = []

    for (const family of TTS_MODEL_FAMILIES) {
      for (const voice of family.voices) {
        const fileId = getVoicePreviewFileId(family.id, voice.id)
        const text = VOICE_PREVIEW_TEXTS[voice.id]
          || `Hello, I'm ${voice.name}. Nice to meet you.`

        // Check if file already exists
        try {
          const { data, error } = await supabase.storage.from(bucketId).download(fileId)
          if (data && !error) {
            results.push({ voice: `${family.id}/${voice.id}`, status: 'exists' })
            continue
          }
        } catch {
          // File doesn't exist — generate it
        }

        try {
          const audioBuffer = await generateSpeech(
            family.modelId, text, voice.id, 'mp3', {}
          )
          const file = new File(
            [Buffer.from(audioBuffer)],
            `${fileId}.mp3`,
            { type: 'audio/mpeg' }
          )

          const { error: uploadError } = await supabase.storage
            .from(bucketId)
            .upload(fileId, file)

          if (uploadError) throw uploadError

          results.push({ voice: `${family.id}/${voice.id}`, status: 'created' })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'unknown error'
          results.push({ voice: `${family.id}/${voice.id}`, status: `error: ${msg}` })
        }
      }
    }

    return NextResponse.json({ results })
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: (error as any).message }, { status: (error as any).status })
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
