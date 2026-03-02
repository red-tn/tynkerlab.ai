import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/appwrite/server'
import { ID, Permission, Role } from 'node-appwrite'
import { generateSpeech, TTS_MODEL_FAMILIES } from '@/lib/together/tts'
import { getVoicePreviewFileId, VOICE_PREVIEW_TEXTS } from '@/lib/together/voice-previews'

export async function POST(request: Request) {
  try {
    // Verify admin via JWT header
    const jwt = request.headers.get('x-appwrite-jwt')
    if (!jwt) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { storage } = createAdminClient()
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_UPLOADS!

    const results: { voice: string; status: string }[] = []

    for (const family of TTS_MODEL_FAMILIES) {
      for (const voice of family.voices) {
        const fileId = getVoicePreviewFileId(family.id, voice.id)
        const text = VOICE_PREVIEW_TEXTS[voice.id]
          || `Hello, I'm ${voice.name}. Nice to meet you.`

        // Check if file already exists
        try {
          await storage.getFile(bucketId, fileId)
          results.push({ voice: `${family.id}/${voice.id}`, status: 'exists' })
          continue
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

          await storage.createFile(
            bucketId,
            fileId,
            file,
            [Permission.read(Role.any())]
          )

          results.push({ voice: `${family.id}/${voice.id}`, status: 'created' })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'unknown error'
          results.push({ voice: `${family.id}/${voice.id}`, status: `error: ${msg}` })
        }
      }
    }

    return NextResponse.json({ results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
