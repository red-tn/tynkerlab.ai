import { NextResponse } from 'next/server'
import { checkCredits, deductCredits, addCredits } from '@/lib/credits'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/server'

const SYSTEM_PROMPTS: Record<string, string> = {
  image:
    'You are an expert AI image prompt engineer. Given structured inputs (style, subject, modifiers, lighting, camera angle, details), compose a single cohesive, richly detailed image generation prompt. Weave elements naturally, add complementary details. Output ONLY the prompt text.',
  video:
    'You are an expert AI video prompt engineer. Given structured inputs (style, subject, camera motion, pacing, mood, details), compose a cohesive video prompt with camera direction, temporal progression, motion dynamics. Output ONLY the prompt text.',
  speech:
    'You are an expert speechwriter. Given structured inputs (role, goals, tone, format, topic), write compelling text optimized for TTS delivery. Natural rhythm, varied sentences, strategic punctuation. Output ONLY the speech text.',
}

function assembleUserMessage(type: string, fields: Record<string, any>): string {
  const lines: string[] = []
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (Array.isArray(value) && value.length === 0)) continue
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    const val = Array.isArray(value) ? value.join(', ') : String(value)
    lines.push(`${label}: ${val}`)
  }
  return lines.join('\n')
}

export async function POST(request: Request) {
  try {
    const startTime = Date.now()
    const { userId } = await requireUser(request)
    const { type, fields } = await request.json()

    if (!type || !fields) {
      return NextResponse.json({ error: 'Type and fields are required' }, { status: 400 })
    }

    // Check and deduct 2 credits
    const hasCredits = await checkCredits(userId, 2)
    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits. Prompt generation costs 2 credits.' },
        { status: 402 }
      )
    }

    const deducted = await deductCredits(userId, 2, 'Prompt Maker generation', `prompt-maker-${Date.now()}`)
    if (!deducted) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
    }

    const systemPrompt = SYSTEM_PROMPTS[type] ?? SYSTEM_PROMPTS.image
    const userMessage = assembleUserMessage(type, fields)

    const response = await fetch('https://api.together.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      await addCredits(userId, 2, 'Refund: Prompt Maker failed', `prompt-maker-refund-${Date.now()}`, 'refund')
      throw new Error('LLM call failed')
    }

    const data = await response.json()
    const prompt = data.choices?.[0]?.message?.content?.trim()

    if (!prompt) {
      await addCredits(userId, 2, 'Refund: Prompt Maker no result', `prompt-maker-refund-${Date.now()}`, 'refund')
      throw new Error('No prompt returned')
    }

    // Fire-and-forget: log API usage for cost tracking
    const totalTokens = data.usage?.total_tokens || 0
    const costEstimate = (totalTokens / 1_000_000) * 0.88
    const supabase = createAdminClient()
    supabase.from('api_usage_log').insert({
      user_id: userId,
      endpoint: 'chat/completions',
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      request_type: 'prompt-maker',
      tokens_used: totalTokens,
      cost_estimate: costEstimate,
      latency_ms: Date.now() - startTime,
      status_code: 200,
      request_metadata: { type, creditsUsed: 2 },
    }).then(() => {}, () => {})

    return NextResponse.json({ prompt, type })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
