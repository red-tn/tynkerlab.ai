import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { ID } from 'node-appwrite'
import crypto from 'crypto'

export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env.IP_HASH_SALT || 'tynkerlab')).digest('hex').slice(0, 16)
}

export async function trackPageView(params: {
  path: string
  userId?: string
  isAdmin?: boolean
  sessionId?: string
  referrer?: string
  ip?: string
}) {
  try {
    const { databases } = createAdminClient()
    await databases.createDocument(DATABASE_ID, COLLECTIONS.PAGE_VIEWS, ID.unique(), {
      path: params.path,
      userId: params.userId || null,
      isAdmin: params.isAdmin || false,
      sessionId: params.sessionId || null,
      referrer: params.referrer || null,
      ipHash: params.ip ? hashIP(params.ip) : null,
    })
  } catch (err) {
    // Silently fail — analytics shouldn't break the app
    console.error('Analytics error:', err)
  }
}

export async function trackEvent(params: {
  userId?: string
  event: string
  metadata?: Record<string, any>
}) {
  try {
    const { databases } = createAdminClient()
    await databases.createDocument(DATABASE_ID, COLLECTIONS.ADMIN_ACTIVITY_LOG, ID.unique(), {
      userId: params.userId || null,
      action: params.event,
      details: JSON.stringify(params.metadata || {}),
    })
  } catch (err) {
    console.error('Event tracking error:', err)
  }
}
