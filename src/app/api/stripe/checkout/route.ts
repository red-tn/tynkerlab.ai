import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { priceId, userId, userEmail, mode } = body

    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: mode === 'subscription' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customer_email: userEmail || undefined,
      metadata: { userId },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
