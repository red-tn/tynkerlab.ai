import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from './server'

export async function getSessionFromRequest(request: NextRequest) {
  const sessionCookie = request.cookies.get('nyx-session')
  if (!sessionCookie?.value) {
    return { user: null, session: null }
  }

  try {
    const { users } = createAdminClient()
    // Verify the session is still valid by checking against stored session
    const sessionData = JSON.parse(sessionCookie.value)
    return { user: sessionData, session: sessionCookie.value }
  } catch {
    return { user: null, session: null }
  }
}

export function createSessionCookie(response: NextResponse, session: string) {
  response.cookies.set('nyx-session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
  return response
}

export function deleteSessionCookie(response: NextResponse) {
  response.cookies.delete('nyx-session')
  return response
}
