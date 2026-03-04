import { NextResponse } from 'next/server'
import { getAffiliateByCode, recordClick } from '@/lib/affiliates'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    const affiliate = await getAffiliateByCode(code)
    if (!affiliate || affiliate.status !== 'active') {
      return NextResponse.json({ ok: false })
    }

    await recordClick(affiliate.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
