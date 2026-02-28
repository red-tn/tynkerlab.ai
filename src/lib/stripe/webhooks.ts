import Stripe from 'stripe'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { ID, Query } from 'node-appwrite'
import { getTierByPriceId, getPackByPriceId } from './products'
import { addCredits } from '@/lib/credits'

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  const { databases } = createAdminClient()

  if (session.mode === 'subscription') {
    const subscription = await getStripeSubscription(session.subscription as string) as any
    if (!subscription) return

    const priceId = subscription.items.data[0]?.price.id
    const tier = getTierByPriceId(priceId || '')

    if (tier) {
      // Create subscription record
      await databases.createDocument(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, ID.unique(), {
        userId,
        tier: tier.id,
        status: 'active',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: false,
      })

      // Add monthly credits
      await addCredits(userId, tier.credits, `${tier.name} subscription credits`)

      // Update profile
      const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
        Query.equal('userId', userId), Query.limit(1),
      ])
      if (profiles.documents[0]) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profiles.documents[0].$id, {
          subscriptionTier: tier.id,
          subscriptionStatus: 'active',
        })
      }
    }
  } else if (session.mode === 'payment') {
    // One-time credit pack purchase
    const lineItems = await getSessionLineItems(session.id)
    const priceId = lineItems?.data[0]?.price?.id
    const pack = getPackByPriceId(priceId || '')

    if (pack) {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.CREDIT_PACK_PURCHASES, ID.unique(), {
        userId,
        packId: pack.id,
        credits: pack.credits,
        amountPaid: pack.price * 100,
        currency: 'usd',
        stripePaymentIntentId: session.payment_intent as string,
      })

      await addCredits(userId, pack.credits, `Credit pack: ${pack.name} (${pack.credits} credits)`)
    }
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { databases } = createAdminClient()
  const sub = subscription as any
  const priceId = sub.items.data[0]?.price.id

  const subs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, [
    Query.equal('stripeSubscriptionId', subscription.id), Query.limit(1),
  ])

  if (subs.documents[0]) {
    const tier = getTierByPriceId(priceId || '')
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, subs.documents[0].$id, {
      status: sub.status === 'active' ? 'active' : sub.status,
      tier: tier?.id || subs.documents[0].tier,
      stripePriceId: priceId,
      currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    })
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { databases } = createAdminClient()

  const subs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, [
    Query.equal('stripeSubscriptionId', subscription.id), Query.limit(1),
  ])

  if (subs.documents[0]) {
    const userId = subs.documents[0].userId
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, subs.documents[0].$id, {
      status: 'canceled',
    })

    // Downgrade profile to free
    const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
      Query.equal('userId', userId), Query.limit(1),
    ])
    if (profiles.documents[0]) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profiles.documents[0].$id, {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
      })
    }
  }
}

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const inv = invoice as any
  // Only process renewal invoices (not first subscription invoice — that's handled by checkout)
  if (inv.billing_reason !== 'subscription_cycle') return

  const subscriptionId = inv.subscription as string
  const { databases } = createAdminClient()

  const subs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, [
    Query.equal('stripeSubscriptionId', subscriptionId), Query.limit(1),
  ])

  if (subs.documents[0]) {
    const tier = getTierByPriceId(subs.documents[0].stripePriceId)
    if (tier) {
      await addCredits(subs.documents[0].userId, tier.credits, `Monthly renewal: ${tier.name}`)
    }
  }
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string
  const { databases } = createAdminClient()

  const subs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, [
    Query.equal('stripeSubscriptionId', subscriptionId), Query.limit(1),
  ])

  if (subs.documents[0]) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.SUBSCRIPTIONS, subs.documents[0].$id, {
      status: 'past_due',
    })

    const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
      Query.equal('userId', subs.documents[0].userId), Query.limit(1),
    ])
    if (profiles.documents[0]) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profiles.documents[0].$id, {
        subscriptionStatus: 'past_due',
      })
    }
  }
}

// Helpers — import stripe lazily to avoid circular deps
async function getStripeSubscription(subId: string) {
  const { stripe } = await import('./client')
  return stripe.subscriptions.retrieve(subId)
}

async function getSessionLineItems(sessionId: string) {
  const { stripe } = await import('./client')
  return stripe.checkout.sessions.listLineItems(sessionId)
}
