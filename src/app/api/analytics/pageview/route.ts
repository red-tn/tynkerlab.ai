import { NextResponse } from 'next/server'
import { trackPageView } from '@/lib/analytics'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { path, ip, referrer, sessionId } = body

    // Fire-and-forget — don't await
    trackPageView({ path, ip, referrer, sessionId })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
