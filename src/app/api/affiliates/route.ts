import { NextResponse } from 'next/server'
import { getAffiliateByUserId, createAffiliate, getAffiliateEvents } from '@/lib/affiliates'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'

export async function GET(request: Request) {
  try {
    const { userId } = await requireUser(request)

    const affiliate = await getAffiliateByUserId(userId)
    if (!affiliate) {
      return NextResponse.json({ enrolled: false }, { status: 200 })
    }

    const events = await getAffiliateEvents(affiliate.id, 20)

    return NextResponse.json({
      enrolled: true,
      affiliate,
      events,
    })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireUser(request)

    const affiliate = await createAffiliate(userId)
    return NextResponse.json({ enrolled: true, affiliate })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
