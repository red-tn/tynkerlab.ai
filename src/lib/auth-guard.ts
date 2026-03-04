import { createSessionClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number = 401) {
    super(message)
    this.status = status
  }
}

/**
 * Verify the current user's session from cookies.
 * Use this in API routes to get the authenticated user's ID.
 * Throws AuthError if not authenticated.
 */
export async function requireUser(request: Request): Promise<{ userId: string; email: string }> {
  const supabase = await createSessionClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthError('Unauthorized', 401)
  }

  return { userId: user.id, email: user.email || '' }
}

/**
 * Helper to return a JSON error response for AuthError.
 */
export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  return null
}
