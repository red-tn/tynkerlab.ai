export interface WaveSpeedJobParams {
  image: string    // public URL of portrait image
  audio: string    // public URL of audio file
  prompt?: string  // optional expression/pose guidance
  resolution: '480p' | '720p'
  seed?: number
}

export interface WaveSpeedJobResult {
  id: string
  pollingUrl: string
}

export interface WaveSpeedStatusResult {
  id: string
  status: 'created' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  error?: string
}
