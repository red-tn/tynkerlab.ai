import { NextResponse } from 'next/server'
import { checkCredits, getBalance } from '@/lib/credits'

export async function POST(request: Request) {
  try {
    const { userId, amount } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const balance = await getBalance(userId)
    const hasEnough = amount ? balance >= amount : true

    return NextResponse.json({
      balance,
      hasEnough,
      required: amount || 0,
      deficit: amount ? Math.max(0, amount - balance) : 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
