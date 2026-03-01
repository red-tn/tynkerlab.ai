export interface ImageGenerationParams {
  model: string
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
  steps?: number
  n?: number
  seed?: number
  imageUrl?: string // For image-to-image
  responseFormat?: 'url' | 'base64'
}

export interface ImageGenerationResult {
  url: string
  seed?: number
  width?: number
  height?: number
}

export interface VideoGenerationParams {
  model: string
  prompt: string
  width?: number
  height?: number
  aspectRatio?: string
  frameImages?: string[] // For image-to-video
}

export interface VideoJobResult {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  outputUrl?: string
  error?: string
}

export interface VideoStatusResult {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  output?: {
    video_url: string
  }
  error?: string
}

// TTS Types
export type TTSResponseFormat = 'mp3' | 'wav' | 'opus'
export type TTSGender = 'male' | 'female' | 'neutral'
export type VoiceMode = 'library' | 'design' | 'instant-clone' | 'professional-clone'

export interface TTSVoiceSettings {
  stability: number       // 0-100, how consistent the voice is
  similarity: number      // 0-100, how close to original voice
  style: number           // 0-100, style exaggeration
  speed: number           // 0.5-2.0
  loudness: number        // 0-100, output volume/energy
  guidanceScale: number   // 1-20, how closely to follow voice characteristics
  speakerBoost: boolean   // enhance speaker clarity
}

export interface TTSGenerationParams {
  model: string
  input: string
  voice: string
  responseFormat?: TTSResponseFormat
  settings?: Partial<TTSVoiceSettings>
}

export interface TTSVoice {
  id: string
  name: string
  description: string
  gender: TTSGender
  modelFamily: 'kokoro' | 'orpheus' | 'cartesia'
  tags?: string[]
}

export interface TTSModelFamily {
  id: string
  name: string
  modelId: string
  description: string
  creditsPerGeneration: number
  pricePerMillion: string
  maxCharacters: number
  voices: TTSVoice[]
}

export interface VoiceDesignParams {
  name: string
  gender: TTSGender
  age: 'young' | 'middle-aged' | 'old'
  accent: string
  description: string
}

export interface VoiceClone {
  id: string
  name: string
  type: 'instant' | 'professional'
  status: 'ready' | 'training' | 'failed'
  createdAt: string
  gender: TTSGender
  sampleCount: number
}

export interface TierCloneLimits {
  instantClones: number
  professionalClones: number
  maxSamplesPerClone: number
}

export const TIER_CLONE_LIMITS: Record<string, TierCloneLimits> = {
  free: { instantClones: 1, professionalClones: 0, maxSamplesPerClone: 1 },
  pro: { instantClones: 5, professionalClones: 2, maxSamplesPerClone: 10 },
  enterprise: { instantClones: 20, professionalClones: 10, maxSamplesPerClone: 25 },
}
