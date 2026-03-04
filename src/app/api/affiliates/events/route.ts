import { NextResponse } from 'next/server'
import { getAffiliateByUserId, getAffiliateEvents } from '@/lib/affiliates'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'

export async function GET(request: Request) {
  try {
    const { userId } = await requireUser(request)

    const affiliate = await getAffiliateByUserId(userId)
    if (!affiliate) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const events = await getAffiliateEvents(affiliate.id, limit)

    return NextResponse.json({ events })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
