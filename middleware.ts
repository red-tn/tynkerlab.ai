import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const AFFILIATE_COOKIE = 'tynk_affiliate_ref'
const AFFILIATE_COOKIE_DAYS = 30
const SESSION_COOKIE = 'nyx_session_id'
const SESSION_COOKIE_DAYS = 365

export async function middleware(request: NextRequest) {
  // Refresh Supabase auth session (rotates cookies)
  const response = await updateSession(request)

  const { pathname, searchParams } = request.nextUrl

  // Generate session ID cookie if one doesn't exist (anonymous visitor tracking)
  let sessionId = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_DAYS * 24 * 60 * 60,
      path: '/',
    })
  }

  // Affiliate ref cookie capture (first-click attribution)
  const refCode = searchParams.get('ref')
  if (refCode && /^[A-Za-z0-9]{4,20}$/.test(refCode)) {
    const existingRef = request.cookies.get(AFFILIATE_COOKIE)?.value
    if (!existingRef) {
      // Set cookie on response (first-click wins — don't overwrite)
      response.cookies.set(AFFILIATE_COOKIE, refCode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: AFFILIATE_COOKIE_DAYS * 24 * 60 * 60,
        path: '/',
      })

      // Fire-and-forget click recording
      try {
        const clickUrl = new URL('/api/affiliates/click', request.url)
        fetch(clickUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: refCode }),
          signal: AbortSignal.timeout(3000),
        }).catch(() => {})
      } catch {}
    }
  }

  // Track page views asynchronously (fire-and-forget, never block)
  // Skip: admin pages, prefetch requests (Next.js <Link> hover/viewport), RSC data fetches
  const isPrefetch = request.headers.get('next-router-prefetch') === '1'
    || request.headers.get('purpose') === 'prefetch'
  const isRSC = request.headers.get('rsc') === '1'
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/admin') && !isPrefetch && !isRSC) {
    try {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || ''
      const referrer = request.headers.get('referer') || ''

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
    '/((?!api|_next/static|_next/image|favicon\\.ico|icon\\.[a-z]+|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf|eot|map)).*)',
  ],
}
