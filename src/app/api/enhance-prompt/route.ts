import { NextResponse } from 'next/server'
import { checkCredits, deductCredits, addCredits } from '@/lib/credits'

const SYSTEM_PROMPTS: Record<string, Record<string, string>> = {
  conservative: {
    image: `You are an AI prompt enhancer for image generation. Given a user's prompt, refine it while preserving their original intent. Fix grammar, add minor descriptive detail (lighting, composition, quality keywords like "highly detailed", "professional photography"), and ensure clarity. Do NOT drastically change the concept. Return ONLY the enhanced prompt text, no explanations.`,
    video: `You are an AI prompt enhancer for video generation. Given a user's prompt, refine it while preserving their original intent. Add motion descriptors, camera movement suggestions (dolly, pan, tracking shot), and temporal detail. Keep the core concept intact. Return ONLY the enhanced prompt text, no explanations.`,
    tts: `You are a text editor. Given text intended for text-to-speech, clean it up: fix grammar, improve flow and readability, adjust punctuation for natural speech pauses. Keep the meaning identical. Return ONLY the improved text, no explanations.`,
  },
  aggressive: {
    image: `You are a creative AI prompt artist. Given a user's basic prompt, transform it into a richly detailed, cinematic image generation prompt. Add specific artistic style, lighting conditions (golden hour, volumetric fog, rim lighting), composition details, camera angle, mood/atmosphere, texture details, and quality modifiers (8k, ultra-detailed, masterpiece). Be creative and expansive while keeping the user's core subject. Return ONLY the enhanced prompt text, no explanations.`,
    video: `You are a creative AI video director. Given a user's basic prompt, transform it into a richly detailed cinematic video generation prompt. Add specific camera movements (slow dolly forward, aerial crane shot), scene transitions, atmospheric effects (lens flare, depth of field, motion blur), pacing cues, color grading descriptions, and cinematic quality modifiers. Return ONLY the enhanced prompt text, no explanations.`,
    tts: `You are a dramatic speech writer. Given text intended for text-to-speech, rewrite it to be more engaging, dramatic, and compelling for audio delivery. Add rhetorical devices, vary sentence structure for rhythm, use vivid language, and optimize for spoken delivery with natural pauses and emphasis. Return ONLY the improved text, no explanations.`,
  },
}

export async function POST(request: Request) {
  try {
    const { prompt, mode = 'conservative', generationType = 'image', userId } = await request.json()

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check and deduct 2 credits for AI Enhance
    const hasCredits = await checkCredits(userId, 2)
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits. AI Enhance costs 2 credits.' }, { status: 402 })
    }

    const deducted = await deductCredits(userId, 2, 'AI Enhance prompt', `enhance-${Date.now()}`)
    if (!deducted) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
    }

    const systemPrompt = SYSTEM_PROMPTS[mode]?.[generationType]
      ?? SYSTEM_PROMPTS.conservative.image

    const response = await fetch('https://api.together.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt.trim() },
        ],
        max_tokens: 1024,
        temperature: mode === 'aggressive' ? 0.8 : 0.3,
      }),
    })

    if (!response.ok) {
      // Refund credits on API failure
      await addCredits(userId, 2, 'Refund: AI Enhance failed', `enhance-refund-${Date.now()}`, 'refund')
      const err = await response.text()
      throw new Error(`LLM call failed: ${err}`)
    }

    const data = await response.json()
    const enhanced = data.choices?.[0]?.message?.content?.trim()

    if (!enhanced) {
      // Refund credits if no result
      await addCredits(userId, 2, 'Refund: AI Enhance no result', `enhance-refund-${Date.now()}`, 'refund')
      throw new Error('No enhanced prompt returned')
    }

    return NextResponse.json({ enhanced, original: prompt.trim(), mode })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
