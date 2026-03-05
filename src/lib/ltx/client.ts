import { createAdminClient } from '@/lib/supabase/server'

const LTX_API_BASE = 'https://api.ltx.video/v1'

let _apiKey: string | null = null
function getApiKey(): string {
  if (!_apiKey) {
    _apiKey = process.env.LTX_API_KEY || ''
    if (!_apiKey) throw new Error('LTX_API_KEY environment variable is not set')
  }
  return _apiKey
}

interface LtxVideoParams {
  prompt: string
  model: 'ltx-2-fast' | 'ltx-2-pro'
  duration: number
  width: number
  height: number
  fps?: number
  generateAudio?: boolean
  imageUrl?: string
}

/**
 * Generate a video via the LTX-2 API.
 * Returns the raw MP4 buffer (LTX responds synchronously with binary video).
 */
export async function generateLtxVideo(params: LtxVideoParams): Promise<Buffer> {
  const endpoint = params.imageUrl ? '/image-to-video' : '/text-to-video'

  const body: Record<string, unknown> = {
    prompt: params.prompt,
    model: params.model,
    duration: params.duration,
    resolution: `${params.width}x${params.height}`,
    fps: params.fps || 25,
    generate_audio: params.generateAudio ?? true,
  }

  if (params.imageUrl) {
    body.image_url = params.imageUrl
  }

  const res = await fetch(`${LTX_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(300000), // 5 min timeout for long clips
  })

  if (!res.ok) {
    let errorMsg = `LTX API error: ${res.status}`
    try {
      const errBody = await res.json()
      errorMsg = errBody.error?.message || errBody.message || errorMsg
    } catch {
      // Binary or unparseable response — use status code message
    }
    throw new Error(errorMsg)
  }

  const blob = await res.blob()
  return Buffer.from(await blob.arrayBuffer())
}

/**
 * Generate an LTX video and upload the result directly to Supabase storage.
 * Returns the public URL of the uploaded video.
 */
export async function generateAndUploadLtxVideo(
  params: LtxVideoParams,
  bucket: string,
  storagePath: string,
): Promise<string> {
  const buffer = await generateLtxVideo(params)

  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: 'video/mp4',
      upsert: true,
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath)

  return publicUrl
}
