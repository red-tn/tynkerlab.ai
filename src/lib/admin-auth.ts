import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export class AdminAuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function requireAdmin(request: Request): Promise<{ userId: string }> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AdminAuthError('Unauthorized', 401)
  }

  const token = authHeader.slice(7)

  // Verify the JWT by creating a Supabase client with the user's access token
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const { data: { user }, error } = await userClient.auth.getUser()
  if (error || !user) {
    throw new AdminAuthError('Unauthorized', 401)
  }

  // Check admin role in profiles table
  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new AdminAuthError('Forbidden', 403)
  }

  return { userId: user.id }
}
