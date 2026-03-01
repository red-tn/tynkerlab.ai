import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Track page views asynchronously (fire-and-forget)
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || ''
    const referrer = request.headers.get('referer') || ''
    const sessionId = request.cookies.get('nyx_session_id')?.value

    const analyticsUrl = new URL('/api/analytics/pageview', request.url)
    fetch(analyticsUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, ip, referrer, sessionId }),
    }).catch(() => {})
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
}
