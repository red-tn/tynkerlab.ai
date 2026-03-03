import { Client, Account, Databases, Storage, Avatars } from 'appwrite'

const JWT_KEY = 'appwrite_jwt'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

// On mobile Safari, cross-origin cookies from Appwrite are blocked by ITP.
// Restore a stored JWT on page load so account.get() works after navigation.
if (typeof window !== 'undefined') {
  const jwt = localStorage.getItem(JWT_KEY)
  if (jwt) {
    client.setJWT(jwt)
  }
}

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const avatars = new Avatars(client)

export { client }

/** Store a JWT for cross-page session persistence (mobile Safari workaround) */
export function persistJWT(jwt: string) {
  localStorage.setItem(JWT_KEY, jwt)
  client.setJWT(jwt)
}

/** Clear the stored JWT (on sign out) */
export function clearJWT() {
  localStorage.removeItem(JWT_KEY)
  client.setJWT('')
}

/** Refresh the stored JWT (call after successful auth check to extend lifetime) */
export async function refreshJWT() {
  try {
    const result = await account.createJWT()
    persistJWT(result.jwt)
  } catch {
    // Session might not support JWT creation — that's OK
  }
}

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
export const BUCKET_UPLOADS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_UPLOADS!
export const BUCKET_GENERATIONS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_GENERATIONS!
export const BUCKET_AVATARS = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_AVATARS!

// Collection IDs
export const COLLECTIONS = {
  PROFILES: 'profiles',
  GENERATIONS: 'generations',
  CREDIT_TRANSACTIONS: 'credit_transactions',
  SUBSCRIPTIONS: 'subscriptions',
  CREDIT_PACK_PURCHASES: 'credit_pack_purchases',
  PROMPTS: 'prompts',
  PAGE_VIEWS: 'page_views',
  API_USAGE_LOG: 'api_usage_log',
  ADMIN_ACTIVITY_LOG: 'admin_activity_log',
  SITE_SETTINGS: 'site_settings',
} as const
