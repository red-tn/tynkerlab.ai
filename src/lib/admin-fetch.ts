import { supabase } from '@/lib/supabase/client'

/**
 * Authenticated fetch for admin API routes.
 * Automatically adds the Supabase access token as a Bearer header.
 * Drop-in replacement for fetch() in admin pages.
 *
 * Note: We use getSession() here (not getUser()) because we need the
 * access_token string to send as a Bearer header. getUser() validates
 * the JWT server-side but does not return the raw token. The server-side
 * admin route (requireAdmin) performs its own getUser() validation.
 */
export async function adminFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = new Headers(init?.headers)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }
  return fetch(input, { ...init, headers })
}
