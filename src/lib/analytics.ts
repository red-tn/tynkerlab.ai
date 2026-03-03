import { createAdminClient } from '@/lib/supabase/server'
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
    const supabase = createAdminClient()
    await supabase.from('page_views').insert({
      path: params.path,
      user_id: params.userId || null,
      is_admin: params.isAdmin || false,
      session_id: params.sessionId || null,
      referrer: params.referrer || null,
      ip_hash: params.ip ? hashIP(params.ip) : null,
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
    const supabase = createAdminClient()
    await supabase.from('admin_activity_log').insert({
      admin_id: params.userId || 'system',
      action: params.event,
      details: params.metadata || {},
    })
  } catch (err) {
    console.error('Event tracking error:', err)
  }
}
