import { NextResponse } from 'next/server'
import { getAffiliateByUserId, getAffiliateEvents } from '@/lib/affiliates'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const affiliate = await getAffiliateByUserId(userId)
    if (!affiliate) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 404 })
    }

    const limit = parseInt(searchParams.get('limit') || '50')
    const events = await getAffiliateEvents(affiliate.$id, limit)

    return NextResponse.json({ events })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
