import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/studio', '/dashboard']
const adminPaths = ['/admin']
const authPaths = ['/login', '/signup', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Appwrite session cookie
  const hasSession = request.cookies.getAll().some(cookie =>
    cookie.name.startsWith('a_session_')
  )

  // Redirect authenticated users away from auth pages
  if (hasSession && authPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login for protected routes
  if (!hasSession && protectedPaths.some(path => pathname.startsWith(path))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes - basic check (full admin check happens client-side via AdminGuard)
  if (!hasSession && adminPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Track page views asynchronously (fire-and-forget)
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || ''
    const referrer = request.headers.get('referer') || ''
    const sessionId = request.cookies.get('nyx_session_id')?.value

    // Fire-and-forget analytics tracking via internal API
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
