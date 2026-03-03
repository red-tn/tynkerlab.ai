import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Refresh Supabase auth session (rotates cookies)
  const response = await updateSession(request)

  const { pathname } = request.nextUrl

  // Track page views asynchronously (fire-and-forget, never block)
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    try {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || ''
      const referrer = request.headers.get('referer') || ''
      const sessionId = request.cookies.get('nyx_session_id')?.value

      const analyticsUrl = new URL('/api/analytics/pageview', request.url)
      fetch(analyticsUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname, ip, referrer, sessionId }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {})
    } catch {}
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
}
