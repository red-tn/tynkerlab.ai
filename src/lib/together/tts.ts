import type { TTSModelFamily, TTSVoice, TTSResponseFormat, TTSVoiceSettings } from '@/types/together'
import { getTogetherClient } from './client'

export const DEFAULT_VOICE_SETTINGS: TTSVoiceSettings = {
  stability: 50,
  similarity: 75,
  style: 0,
  speed: 1.0,
  loudness: 50,
  guidanceScale: 5,
  speakerBoost: false,
}

export const TTS_MODEL_FAMILIES: TTSModelFamily[] = [
  {
    id: 'kokoro',
    name: 'Kokoro',
    modelId: 'hexgrad/Kokoro-82M',
    description: 'Fast and affordable — great for drafts and high-volume use',
    creditsPerGeneration: 1,
    pricePerMillion: '$4',
    maxCharacters: 5000,
    voices: [
      { id: 'af_alloy', name: 'Alloy', description: 'Neutral and balanced', gender: 'female', modelFamily: 'kokoro', tags: ['versatile', 'professional'] },
      { id: 'am_echo', name: 'Echo', description: 'Warm and natural', gender: 'male', modelFamily: 'kokoro', tags: ['warm', 'narration'] },
      { id: 'bm_fable', name: 'Fable', description: 'Expressive storyteller', gender: 'male', modelFamily: 'kokoro', tags: ['storytelling', 'expressive'] },
      { id: 'am_onyx', name: 'Onyx', description: 'Deep and authoritative', gender: 'male', modelFamily: 'kokoro', tags: ['deep', 'authoritative'] },
      { id: 'af_nova', name: 'Nova', description: 'Bright and energetic', gender: 'female', modelFamily: 'kokoro', tags: ['bright', 'energetic'] },
      { id: 'af_sky', name: 'Sky', description: 'Soft and calming', gender: 'female', modelFamily: 'kokoro', tags: ['calm', 'gentle'] },
      { id: 'af_nicole', name: 'Nicole', description: 'Friendly and approachable', gender: 'female', modelFamily: 'kokoro', tags: ['friendly', 'casual'] },
      { id: 'am_adam', name: 'Adam', description: 'Wise and measured', gender: 'male', modelFamily: 'kokoro', tags: ['wise', 'measured'] },
    ],
  },
  {
    id: 'orpheus',
    name: 'Orpheus',
    modelId: 'canopylabs/orpheus-3b-0.1-ft',
    description: 'Mid-tier with emotional markers — ideal for expressive narration',
    creditsPerGeneration: 2,
    pricePerMillion: '$15',
    maxCharacters: 10000,
    voices: [
      { id: 'tara', name: 'Tara', description: 'Clear and professional', gender: 'female', modelFamily: 'orpheus', tags: ['professional', 'clear'] },
      { id: 'leah', name: 'Leah', description: 'Warm and conversational', gender: 'female', modelFamily: 'orpheus', tags: ['warm', 'conversational'] },
      { id: 'jess', name: 'Jess', description: 'Casual and friendly', gender: 'female', modelFamily: 'orpheus', tags: ['casual', 'friendly'] },
      { id: 'leo', name: 'Leo', description: 'Strong and confident', gender: 'male', modelFamily: 'orpheus', tags: ['strong', 'confident'] },
      { id: 'dan', name: 'Dan', description: 'Relaxed and approachable', gender: 'male', modelFamily: 'orpheus', tags: ['relaxed', 'approachable'] },
      { id: 'mia', name: 'Mia', description: 'Youthful and dynamic', gender: 'female', modelFamily: 'orpheus', tags: ['youthful', 'dynamic'] },
      { id: 'zac', name: 'Zac', description: 'Bold and direct', gender: 'male', modelFamily: 'orpheus', tags: ['bold', 'direct'] },
      { id: 'zoe', name: 'Zoe', description: 'Bright and cheerful', gender: 'female', modelFamily: 'orpheus', tags: ['bright', 'cheerful'] },
    ],
  },
  {
    id: 'cartesia',
    name: 'Cartesia Sonic 2',
    modelId: 'cartesia/sonic-2',
    description: 'Premium quality — best for polished, production-ready audio',
    creditsPerGeneration: 5,
    pricePerMillion: '$65',
    maxCharacters: 40000,
    voices: [
      { id: 'helpful woman', name: 'Helpful Woman', description: 'Neutral and versatile', gender: 'female', modelFamily: 'cartesia', tags: ['versatile', 'neutral'] },
      { id: 'newsman', name: 'Newsman', description: 'Resonant and warm', gender: 'male', modelFamily: 'cartesia', tags: ['resonant', 'warm'] },
      { id: 'reading lady', name: 'Reading Lady', description: 'Rich and narrative', gender: 'female', modelFamily: 'cartesia', tags: ['rich', 'narrative'] },
      { id: 'wise man', name: 'Wise Man', description: 'Bold and commanding', gender: 'male', modelFamily: 'cartesia', tags: ['bold', 'commanding'] },
      { id: 'california girl', name: 'California Girl', description: 'Clear and modern', gender: 'female', modelFamily: 'cartesia', tags: ['clear', 'modern'] },
      { id: 'calm lady', name: 'Calm Lady', description: 'Gentle and soothing', gender: 'female', modelFamily: 'cartesia', tags: ['gentle', 'soothing'] },
    ],
  },
]

export function getTTSFamily(familyId: string): TTSModelFamily | undefined {
  return TTS_MODEL_FAMILIES.find(f => f.id === familyId)
}

export function getTTSVoicesForFamily(familyId: string): TTSVoice[] {
  return getTTSFamily(familyId)?.voices ?? []
}

export function getTTSCredits(familyId: string): number {
  return getTTSFamily(familyId)?.creditsPerGeneration ?? 1
}

export function getAllTTSVoices(): TTSVoice[] {
  return TTS_MODEL_FAMILIES.flatMap(f => f.voices)
}

export async function generateSpeech(
  modelId: string,
  input: string,
  voice: string,
  responseFormat: TTSResponseFormat = 'mp3',
  settings: Partial<TTSVoiceSettings> = {},
): Promise<ArrayBuffer> {
  const merged = { ...DEFAULT_VOICE_SETTINGS, ...settings }
  const together = getTogetherClient()

  // SDK only supports mp3, wav, raw — map opus to mp3
  const format = responseFormat === 'opus' ? 'mp3' : responseFormat

  const response = await (together.audio.speech.create as Function)({
    model: modelId,
    input,
    voice,
    response_format: format,
    speed: merged.speed,
    stream: false,
  })

  return (response as Response).arrayBuffer()
}
