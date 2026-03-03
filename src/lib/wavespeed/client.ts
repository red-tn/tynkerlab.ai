import type { WaveSpeedJobParams, WaveSpeedJobResult, WaveSpeedStatusResult } from '@/types/wavespeed'

const BASE_URL = 'https://api.wavespeed.ai/api/v3'

function getApiKey(): string {
  const key = process.env.WAVESPEED_API_KEY
  if (!key) throw new Error('WAVESPEED_API_KEY not set')
  return key
}

export async function createAvatarJob(params: WaveSpeedJobParams): Promise<WaveSpeedJobResult> {
  const res = await fetch(`${BASE_URL}/wavespeed-ai/infinitetalk`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: params.image,
      audio: params.audio,
      prompt: params.prompt || '',
      resolution: params.resolution,
      seed: params.seed ?? -1,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`WaveSpeed API error (${res.status}): ${text}`)
  }

  const json = await res.json()

  if (json.code !== 200 || !json.data?.id) {
    throw new Error(json.message || 'Failed to create avatar job')
  }

  return {
    id: json.data.id,
    pollingUrl: json.data.urls?.get || `${BASE_URL}/predictions/${json.data.id}/result`,
  }
}

export async function checkJobStatus(taskId: string): Promise<WaveSpeedStatusResult> {
  const res = await fetch(`${BASE_URL}/predictions/${taskId}/result`, {
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`WaveSpeed polling error (${res.status}): ${text}`)
  }

  const json = await res.json()
  const data = json.data || json

  return {
    id: taskId,
    status: data.status || 'processing',
    videoUrl: data.outputs?.[0] || undefined,
    error: data.error || undefined,
  }
}
