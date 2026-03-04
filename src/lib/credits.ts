import { createAdminClient } from '@/lib/supabase/server'

export async function getBalance(userId: string): Promise<number> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('user_id', userId)
    .single()
  return data?.credits_balance ?? 0
}

export async function checkCredits(userId: string, amount: number): Promise<boolean> {
  const balance = await getBalance(userId)
  return balance >= amount
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  referenceId: string
): Promise<boolean> {
  const supabase = createAdminClient()

  // Use the atomic deduct_credits function for race-condition safety
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_reference_id: referenceId,
  })

  if (error) {
    console.error('deductCredits error:', error)
    return false
  }

  return data === true
}

export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string,
  type: string = 'admin_adjustment'
): Promise<boolean> {
  const supabase = createAdminClient()

  // Use the atomic add_credits function for race-condition safety
  const { data, error } = await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_reference_id: referenceId || null,
    p_type: type,
  })

  if (error) {
    console.error('addCredits error:', error)
    // Fallback to non-atomic method if RPC doesn't exist yet
    return addCreditsFallback(userId, amount, description, referenceId, type)
  }

  return data === true
}

// Fallback for environments where add_credits RPC hasn't been deployed yet
async function addCreditsFallback(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string,
  type: string = 'admin_adjustment'
): Promise<boolean> {
  const supabase = createAdminClient()

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, credits_balance')
    .eq('user_id', userId)
    .single()

  if (fetchError || !profile) return false

  const newBalance = profile.credits_balance + amount

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits_balance: newBalance })
    .eq('id', profile.id)

  if (updateError) return false

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount,
    type,
    description,
    reference_id: referenceId || null,
    balance_after: newBalance,
  })

  return true
}

export async function refundCredits(
  userId: string,
  amount: number,
  description: string,
  referenceId: string
): Promise<boolean> {
  return addCredits(userId, amount, description, referenceId, 'refund')
}

export async function getTransactionHistory(userId: string, limit: number = 50) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}
