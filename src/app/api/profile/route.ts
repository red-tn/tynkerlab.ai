import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // One-time migration: grant 50 credits to pre-existing free accounts with 0 credits
    if (
      profile.credits_balance === 0 &&
      profile.credits_monthly === 0 &&
      profile.subscription_tier === 'free'
    ) {
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ credits_balance: 50, credits_monthly: 50 })
        .eq('id', profile.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      return NextResponse.json(updated)
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, name, email } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    const supabase = createAdminClient()

    // Create profile document
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email,
        full_name: name,
        role: 'user',
        credits_balance: 50,
        credits_monthly: 50,
        subscription_tier: 'free',
        subscription_status: 'inactive',
        total_generations: 0,
        total_images: 0,
        total_videos: 0,
        total_avatars: 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const updates = await request.json()
    const supabase = createAdminClient()

    if (!updates.profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates.data)
      .eq('id', updates.profileId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createAdminClient()
    const { userId } = await request.json()

    // Delete profile document
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (profile) {
      await supabase.from('profiles').delete().eq('id', profile.id)
    }

    // Delete auth user
    await supabase.auth.admin.deleteUser(userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
