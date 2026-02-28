import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const { databases } = createAdminClient()
    const subs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, [
      Query.equal('userId', userId),
      Query.equal('status', 'active'),
      Query.limit(1),
    ])

    if (!subs.documents[0]?.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subs.documents[0].stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
