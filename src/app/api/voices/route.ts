import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { ID, Query } from 'node-appwrite'
import { generateSpeech, getTTSFamily, TTS_MODEL_FAMILIES } from '@/lib/together/tts'
import { checkCredits, deductCredits } from '@/lib/credits'

const VOICE_CREATION_CREDITS = 2 // Credits to create/preview a custom voice

interface CustomVoice {
  id: string
  name: string
  gender: string
  age: string
  accent: string
  tone: string
  baseFamily: string
  baseVoice: string
  settings: {
    stability: number
    similarity: number
    style: number
    speed: number
    loudness: number
    guidanceScale: number
    speakerBoost: boolean
  }
  createdAt: string
}

// GET — fetch user's custom voices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const { databases } = createAdminClient()
    const key = `custom_voices_${userId}`

    const results = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
      Query.equal('key', key),
      Query.limit(1),
    ])

    if (results.documents.length === 0) {
      return NextResponse.json({ voices: [] })
    }

    const voices: CustomVoice[] = JSON.parse(results.documents[0].value || '[]')
    return NextResponse.json({ voices })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST — create a new custom voice (costs credits for preview generation)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, gender, age, accent, tone, preview } = body

    if (!userId || !name || !gender || !age || !tone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Match wizard choices to the best base voice + settings
    const { baseFamily, baseVoice, settings } = matchVoiceToBase(gender, age, accent, tone)

    // If preview requested, generate a sample (costs credits)
    let previewAudio: string | null = null
    if (preview) {
      const hasCredits = await checkCredits(userId, VOICE_CREATION_CREDITS)
      if (!hasCredits) {
        return NextResponse.json({ error: 'Insufficient credits for voice preview' }, { status: 402 })
      }

      const ref = `voice-preview-${Date.now()}`
      await deductCredits(userId, VOICE_CREATION_CREDITS, `Voice preview: ${name}`, ref)

      try {
        const family = getTTSFamily(baseFamily)!
        const sampleText = getSampleText(gender, age, accent, tone)
        const audioBuffer = await generateSpeech(family.modelId, sampleText, baseVoice, 'mp3', settings)
        previewAudio = Buffer.from(audioBuffer).toString('base64')
      } catch (err: any) {
        // Don't fail voice creation if preview fails — just skip it
        console.error('Preview generation failed:', err.message)
      }
    }

    const newVoice: CustomVoice = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      gender,
      age,
      accent: accent || 'neutral',
      tone,
      baseFamily,
      baseVoice,
      settings,
      createdAt: new Date().toISOString(),
    }

    // Save to site_settings
    const { databases } = createAdminClient()
    const key = `custom_voices_${userId}`

    const results = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
      Query.equal('key', key),
      Query.limit(1),
    ])

    let voices: CustomVoice[] = []
    if (results.documents.length > 0) {
      voices = JSON.parse(results.documents[0].value || '[]')
      voices.push(newVoice)
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, results.documents[0].$id, {
        value: JSON.stringify(voices),
      })
    } else {
      voices = [newVoice]
      await databases.createDocument(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, ID.unique(), {
        key,
        value: JSON.stringify(voices),
      })
    }

    return NextResponse.json({ voice: newVoice, previewAudio })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE — remove a custom voice
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const voiceId = searchParams.get('voiceId')

    if (!userId || !voiceId) {
      return NextResponse.json({ error: 'userId and voiceId required' }, { status: 400 })
    }

    const { databases } = createAdminClient()
    const key = `custom_voices_${userId}`

    const results = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
      Query.equal('key', key),
      Query.limit(1),
    ])

    if (results.documents.length === 0) {
      return NextResponse.json({ error: 'No custom voices found' }, { status: 404 })
    }

    let voices: CustomVoice[] = JSON.parse(results.documents[0].value || '[]')
    voices = voices.filter(v => v.id !== voiceId)

    await databases.updateDocument(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, results.documents[0].$id, {
      value: JSON.stringify(voices),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Voice matching logic — maps wizard choices to the best base voice + optimal settings
function matchVoiceToBase(gender: string, age: string, accent: string, tone: string) {
  // Use Kokoro as default base family (affordable, good quality)
  let baseFamily = 'kokoro'
  let baseVoice = 'alloy'

  // Gender + tone matching
  if (gender === 'male') {
    if (tone === 'deep' || tone === 'authoritative') {
      baseVoice = 'onyx'
    } else if (tone === 'warm' || tone === 'friendly') {
      baseVoice = 'echo'
    } else if (tone === 'wise' || tone === 'calm') {
      baseVoice = 'sage'
    } else {
      baseVoice = 'echo'
    }
  } else if (gender === 'female') {
    if (tone === 'bright' || tone === 'energetic') {
      baseVoice = 'nova'
    } else if (tone === 'calm' || tone === 'gentle') {
      baseVoice = 'shimmer'
    } else if (tone === 'expressive' || tone === 'storytelling') {
      baseVoice = 'fable'
    } else if (tone === 'friendly' || tone === 'casual') {
      baseVoice = 'coral'
    } else {
      baseVoice = 'nova'
    }
  } else {
    baseVoice = 'alloy'
  }

  // If premium tone is needed, use Orpheus for more expressive output
  if (tone === 'expressive' || tone === 'storytelling' || tone === 'dramatic') {
    baseFamily = 'orpheus'
    if (gender === 'male') {
      baseVoice = tone === 'dramatic' ? 'leo' : 'dan'
    } else if (gender === 'female') {
      baseVoice = tone === 'expressive' ? 'mia' : tone === 'storytelling' ? 'tara' : 'leah'
    } else {
      baseVoice = 'tara'
    }
  }

  // Build settings based on characteristics
  const settings = {
    stability: 50,
    similarity: 75,
    style: 0,
    speed: 1.0,
    loudness: 50,
    guidanceScale: 5,
    speakerBoost: false,
  }

  // Age adjustments
  if (age === 'young') {
    settings.speed = 1.05
    settings.style = 15
    settings.loudness = 55
  } else if (age === 'old') {
    settings.speed = 0.9
    settings.stability = 65
    settings.loudness = 45
  }

  // Tone adjustments
  if (tone === 'calm' || tone === 'gentle') {
    settings.stability = 70
    settings.speed = 0.92
    settings.loudness = 40
  } else if (tone === 'energetic' || tone === 'bright') {
    settings.style = 25
    settings.loudness = 60
    settings.speed = 1.08
  } else if (tone === 'authoritative' || tone === 'deep') {
    settings.stability = 75
    settings.loudness = 55
    settings.guidanceScale = 8
    settings.speakerBoost = true
  } else if (tone === 'dramatic' || tone === 'expressive') {
    settings.style = 40
    settings.stability = 35
    settings.loudness = 55
  } else if (tone === 'professional') {
    settings.stability = 70
    settings.similarity = 80
    settings.speakerBoost = true
  }

  return { baseFamily, baseVoice, settings }
}

function getSampleText(gender: string, age: string, accent: string, tone: string): string {
  const samples: Record<string, string> = {
    calm: 'Welcome to a moment of peace. Take a deep breath, and let the world slow down around you.',
    energetic: 'Hey there! Welcome to the show! We have got an amazing lineup for you today, so let\'s jump right in!',
    authoritative: 'Good evening. Tonight we bring you breaking developments that will shape the course of events ahead.',
    deep: 'In the vast silence of the cosmos, there lies a truth we are only beginning to understand.',
    warm: 'You know, sometimes the best things in life are the simple moments shared with the people we care about.',
    friendly: 'Hey! So glad you could make it. Come on in, grab a seat, and let me tell you what we have been working on.',
    gentle: 'Once upon a time, in a land where the stars shone just a little bit brighter, there lived a curious little fox.',
    bright: 'Good morning! What a beautiful day to create something new. I can feel the inspiration already!',
    expressive: 'Oh, you would not believe what happened next! The whole crowd went silent, and then... pure magic.',
    storytelling: 'The rain fell softly on the old stone walls as the traveler pushed open the heavy wooden door.',
    dramatic: 'And in that single, breathtaking moment, everything they had ever known... changed forever.',
    professional: 'Thank you for joining today\'s presentation. I will walk you through our key findings and strategic recommendations.',
    wise: 'Experience teaches us that patience is not about waiting — it is about how we behave while we wait.',
    casual: 'So yeah, I was just thinking about this the other day, and honestly? It totally makes sense when you look at it that way.',
  }
  return samples[tone] || samples.warm || 'Hello! This is a preview of your custom voice. How does it sound to you?'
}
