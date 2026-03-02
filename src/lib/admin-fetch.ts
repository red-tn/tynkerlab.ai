import { account } from '@/lib/appwrite/client'

let cachedJwt: string | null = null
let jwtExpiry = 0

/**
 * Get a cached Appwrite JWT (15 min lifetime, refreshed at 12 min).
 */
async function getJwt(): Promise<string> {
  if (cachedJwt && Date.now() < jwtExpiry) return cachedJwt
  const result = await account.createJWT()
  cachedJwt = result.jwt
  jwtExpiry = Date.now() + 12 * 60 * 1000 // refresh 3 min before expiry
  return cachedJwt
}

/**
 * Authenticated fetch for admin API routes.
 * Automatically adds the Appwrite JWT header.
 * Drop-in replacement for fetch() in admin pages.
 */
export async function adminFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const jwt = await getJwt()
  const headers = new Headers(init?.headers)
  headers.set('x-appwrite-jwt', jwt)
  return fetch(input, { ...init, headers })
}
