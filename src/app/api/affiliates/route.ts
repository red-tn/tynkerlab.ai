import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'
import { getAffiliateByUserId, createAffiliate, getAffiliateEvents } from '@/lib/affiliates'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const affiliate = await getAffiliateByUserId(userId)
    if (!affiliate) {
      return NextResponse.json({ enrolled: false }, { status: 200 })
    }

    const events = await getAffiliateEvents(affiliate.$id, 20)

    return NextResponse.json({
      enrolled: true,
      affiliate,
      events,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const affiliate = await createAffiliate(userId)
    return NextResponse.json({ enrolled: true, affiliate })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
