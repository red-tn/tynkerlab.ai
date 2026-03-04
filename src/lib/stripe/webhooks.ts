import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { getTierByPriceId, getPackByPriceId } from './products'
import { addCredits } from '@/lib/credits'
import { getAffiliateByCode, getAffiliateByPromotionCodeId, recordCommission } from '@/lib/affiliates'

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  const supabase = createAdminClient()

  if (session.mode === 'subscription') {
    const subscription = await getStripeSubscription(session.subscription as string) as any
    if (!subscription) return

    const priceId = subscription.items.data[0]?.price.id
    const tier = getTierByPriceId(priceId || '')

    if (tier) {
      // Create subscription record
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier: tier.id,
          status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: false,
        })

      if (subError) throw subError

      // Add monthly credits
      await addCredits(userId, tier.credits, `${tier.name} subscription credits`)

      // Update profile
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)

      if (profiles && profiles[0]) {
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier.id,
            subscription_status: 'active',
          })
          .eq('id', profiles[0].id)
      }

      // Affiliate commission on initial subscription
      attributeAffiliateCommission(
        userId,
        session.id,
        session.amount_total || 0,
        session,
      ).catch(() => {})
    }
  } else if (session.mode === 'payment') {
    // One-time credit pack purchase
    const lineItems = await getSessionLineItems(session.id)
    const priceId = lineItems?.data[0]?.price?.id
    const pack = getPackByPriceId(priceId || '')

    if (pack) {
      const { error: packError } = await supabase
        .from('credit_pack_purchases')
        .insert({
          user_id: userId,
          pack_id: pack.id,
          credits: pack.credits,
          amount_paid: pack.price * 100,
          currency: 'usd',
          stripe_payment_intent_id: session.payment_intent as string,
        })

      if (packError) throw packError

      await addCredits(userId, pack.credits, `Credit pack: ${pack.name} (${pack.credits} credits)`)

      // Affiliate commission on credit pack purchase
      attributeAffiliateCommission(
        userId,
        session.id,
        session.amount_total || 0,
        session,
      ).catch(() => {})
    }
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createAdminClient()
  const sub = subscription as any
  const priceId = sub.items.data[0]?.price.id

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .limit(1)

  if (subs && subs[0]) {
    const tier = getTierByPriceId(priceId || '')
    await supabase
      .from('subscriptions')
      .update({
        status: sub.status === 'active' ? 'active' : sub.status,
        tier: tier?.id || subs[0].tier,
        stripe_price_id: priceId,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
      })
      .eq('id', subs[0].id)
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createAdminClient()

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .limit(1)

  if (subs && subs[0]) {
    const userId = subs[0].user_id
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('id', subs[0].id)

    // Downgrade profile to free
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (profiles && profiles[0]) {
      await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
        })
        .eq('id', profiles[0].id)
    }
  }
}

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const inv = invoice as any
  // Only process renewal invoices (not first subscription invoice — that's handled by checkout)
  if (inv.billing_reason !== 'subscription_cycle') return

  const subscriptionId = inv.subscription as string
  const supabase = createAdminClient()

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .limit(1)

  if (subs && subs[0]) {
    const tier = getTierByPriceId(subs[0].stripe_price_id)
    if (tier) {
      await addCredits(subs[0].user_id, tier.credits, `Monthly renewal: ${tier.name}`)

      // Recurring affiliate commission
      attributeAffiliateCommission(
        subs[0].user_id,
        inv.id,
        inv.amount_paid || 0,
      ).catch(() => {})
    }
  }
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string
  const supabase = createAdminClient()

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .limit(1)

  if (subs && subs[0]) {
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('id', subs[0].id)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', subs[0].user_id)
      .limit(1)

    if (profiles && profiles[0]) {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('id', profiles[0].id)
    }
  }
}

// ---------------------------------------------------------------------------
// Affiliate commission attribution
// ---------------------------------------------------------------------------
async function attributeAffiliateCommission(
  userId: string,
  orderId: string,
  amountCents: number,
  session?: Stripe.Checkout.Session | null,
) {
  if (amountCents <= 0) return
  const saleAmount = amountCents / 100

  const supabase = createAdminClient()

  // Strategy 1: cookie-based — check profiles.referred_by
  const { data: profile } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('user_id', userId)
    .single()

  if (profile?.referred_by) {
    const affiliate = await getAffiliateByCode(profile.referred_by)
    if (affiliate && affiliate.status === 'active') {
      await recordCommission(affiliate.id, orderId, saleAmount)
      return
    }
  }

  // Strategy 2: promo-code-based — check if session used a promotion code
  if (session) {
    try {
      const { stripe } = await import('./client')
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['total_details.breakdown'],
      }) as any
      const discount = fullSession.total_details?.breakdown?.discounts?.[0]
      const promoCodeId = discount?.discount?.promotion_code
      if (promoCodeId && typeof promoCodeId === 'string') {
        const affiliate = await getAffiliateByPromotionCodeId(promoCodeId)
        if (affiliate && affiliate.status === 'active') {
          await recordCommission(affiliate.id, orderId, saleAmount)
          return
        }
      }
    } catch {
      // Promo code lookup failed — not critical
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
