import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    // Proxy to Together.ai usage API
    const res = await fetch('https://api.together.ai/v1/dashboard/usage', {
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch Together.ai usage' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    if (error?.status === 401 || error?.status === 403) {
      return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
