import { createAdminClient } from '@/lib/supabase/server'

export const AFFILIATE_COMMISSION_RATE = 0.10
export const COOKIE_DURATION_DAYS = 30
export const MIN_PAYOUT = 25

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function getAffiliateByUserId(userId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

export async function getAffiliateByCode(code: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('affiliates')
    .select('*')
    .eq('code', code)
    .single()
  return data
}

export async function createAffiliate(userId: string) {
  const supabase = createAdminClient()

  // Check if already enrolled
  const existing = await getAffiliateByUserId(userId)
  if (existing) return existing

  // Generate unique code
  let code = generateCode()
  let attempts = 0
  while (attempts < 5) {
    const dup = await getAffiliateByCode(code)
    if (!dup) break
    code = generateCode()
    attempts++
  }

  const { data } = await supabase
    .from('affiliates')
    .insert({
      user_id: userId,
      code,
      status: 'active',
      total_clicks: 0,
      total_signups: 0,
      total_conversions: 0,
      total_earnings: 0,
      pending_balance: 0,
      paid_out: 0,
    })
    .select()
    .single()

  return data
}

export async function recordClick(affiliateId: string) {
  const supabase = createAdminClient()

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('total_clicks')
    .eq('id', affiliateId)
    .single()

  await supabase
    .from('affiliates')
    .update({ total_clicks: (affiliate?.total_clicks || 0) + 1 })
    .eq('id', affiliateId)

  await supabase.from('affiliate_events').insert({
    affiliate_id: affiliateId,
    type: 'click',
    sale_amount: 0,
    commission: 0,
  })
}

export async function recordSignup(affiliateId: string, referredUserId: string) {
  const supabase = createAdminClient()

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('total_signups')
    .eq('id', affiliateId)
    .single()

  await supabase
    .from('affiliates')
    .update({ total_signups: (affiliate?.total_signups || 0) + 1 })
    .eq('id', affiliateId)

  await supabase.from('affiliate_events').insert({
    affiliate_id: affiliateId,
    type: 'signup',
    referred_user_id: referredUserId,
    sale_amount: 0,
    commission: 0,
  })
}

export async function recordCommission(affiliateId: string, orderId: string, saleAmount: number) {
  const supabase = createAdminClient()
  const commission = saleAmount * AFFILIATE_COMMISSION_RATE

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('total_conversions, total_earnings, pending_balance')
    .eq('id', affiliateId)
    .single()

  await supabase
    .from('affiliates')
    .update({
      total_conversions: (affiliate?.total_conversions || 0) + 1,
      total_earnings: (affiliate?.total_earnings || 0) + commission,
      pending_balance: (affiliate?.pending_balance || 0) + commission,
    })
    .eq('id', affiliateId)

  await supabase.from('affiliate_events').insert({
    affiliate_id: affiliateId,
    type: 'commission',
    order_id: orderId,
    sale_amount: saleAmount,
    commission,
  })
}

export async function getAffiliateEvents(affiliateId: string, limit = 50) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('affiliate_events')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getAllAffiliates(limit = 100) {
  const supabase = createAdminClient()
  const { data, count } = await supabase
    .from('affiliates')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data: data || [], total: count || 0 }
}

export async function processPayout(affiliateId: string) {
  const supabase = createAdminClient()

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('pending_balance, paid_out')
    .eq('id', affiliateId)
    .single()

  const amount = affiliate?.pending_balance || 0
  if (amount < MIN_PAYOUT) {
    throw new Error(`Minimum payout is $${MIN_PAYOUT}. Current balance: $${amount.toFixed(2)}`)
  }

  await supabase
    .from('affiliates')
    .update({
      pending_balance: 0,
      paid_out: (affiliate?.paid_out || 0) + amount,
    })
    .eq('id', affiliateId)

  await supabase.from('affiliate_events').insert({
    affiliate_id: affiliateId,
    type: 'payout',
    sale_amount: 0,
    commission: amount,
  })

  return amount
}
