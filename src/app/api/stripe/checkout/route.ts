import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'

export async function POST(request: Request) {
  try {
    const { userId, email } = await requireUser(request)
    const body = await request.json()
    const { priceId, mode } = body

    if (!priceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!priceId.startsWith('price_')) {
      return NextResponse.json({ error: 'Invalid price ID. Please check Stripe configuration.' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: mode === 'subscription' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customer_email: email || undefined,
      metadata: { userId },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
