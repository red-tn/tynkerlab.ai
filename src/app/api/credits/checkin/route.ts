import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { addCredits } from '@/lib/credits'

const DAILY_CREDITS = 3

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_checkin_date')
      .eq('user_id', userId)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const claimed = profile?.last_checkin_date === today

    return NextResponse.json({ claimed })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, credits_balance, last_checkin_date, subscription_tier')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if already claimed today
    const today = new Date().toISOString().split('T')[0]
    if (profile.last_checkin_date === today) {
      return NextResponse.json({ already_claimed: true, balance: profile.credits_balance })
    }

    // Grant daily credits
    await addCredits(userId, DAILY_CREDITS, 'Daily check-in bonus', `checkin-${today}`, 'daily_checkin')

    // Update last check-in date
    await supabase
      .from('profiles')
      .update({ last_checkin_date: today })
      .eq('id', profile.id)

    const newBalance = profile.credits_balance + DAILY_CREDITS

    return NextResponse.json({
      credits_granted: DAILY_CREDITS,
      new_balance: newBalance,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
