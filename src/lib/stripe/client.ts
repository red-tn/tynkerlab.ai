import Stripe from 'stripe'
import { loadStripe, type Stripe as StripeClient } from '@stripe/stripe-js'

// Server-side Stripe instance (lazy singleton)
let _stripe: Stripe | null = null

export function getServerStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-12-18.acacia' as any,
      typescript: true,
    })
  }
  return _stripe
}

// Keep a convenient `stripe` export for backwards compat
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getServerStripe() as any)[prop]
  },
})

// Client-side Stripe instance (singleton)
let stripePromise: Promise<StripeClient | null> | null = null

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
