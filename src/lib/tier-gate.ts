import { createAdminClient } from '@/lib/supabase/server'

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('user_id', userId)
    .single()
  return (data?.subscription_tier as SubscriptionTier) || 'free'
}

export function requirePaidTier(tier: SubscriptionTier, feature: string): void {
  if (tier === 'free') {
    throw new TierGateError(feature)
  }
}

export class TierGateError extends Error {
  public feature: string
  constructor(feature: string) {
    super(`${feature} requires a paid subscription. Please upgrade to Creator or Pro Creator to access this feature.`)
    this.name = 'TierGateError'
    this.feature = feature
  }
}
