import { NextResponse } from 'next/server'
import { checkCredits, getBalance } from '@/lib/credits'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'

export async function POST(request: Request) {
  try {
    const { userId } = await requireUser(request)
    const { amount } = await request.json()

    const balance = await getBalance(userId)
    const hasEnough = amount ? balance >= amount : true

    return NextResponse.json({
      balance,
      hasEnough,
      required: amount || 0,
      deficit: amount ? Math.max(0, amount - balance) : 0,
    })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
