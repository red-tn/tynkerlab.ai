import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { addCredits } from '@/lib/credits'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = createAdminClient()
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, page * limit + limit - 1)

    if (search) {
      query = query.ilike('full_name', `%${search}%`)
    }

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      users: data,
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (fetchError) throw fetchError

    // Delete the profile document
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (deleteError) throw deleteError

    // Try to delete the auth user too
    try {
      await supabase.auth.admin.deleteUser(profile.user_id)
    } catch {
      // User may already be deleted or not exist
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { profileId, credits, role, suspended, subscriptionTier } = body

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (fetchError) throw fetchError

    const updates: Record<string, any> = {}

    if (role !== undefined) updates.role = role
    if (suspended !== undefined) updates.suspended = suspended
    if (subscriptionTier !== undefined) updates.subscription_tier = subscriptionTier

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId)

      if (updateError) throw updateError
    }

    if (credits !== undefined && credits !== 0) {
      if (credits > 0) {
        await addCredits(profile.user_id, credits, `Admin: credit adjustment`)
      } else {
        // For negative adjustments, deduct balance and log transaction
        const currentBalance = profile.credits_balance || 0
        const newBalance = Math.max(0, currentBalance + credits)
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ credits_balance: newBalance })
          .eq('id', profileId)

        if (balanceError) throw balanceError

        // Create transaction record for the negative adjustment
        const { error: txError } = await supabase
          .from('credit_transactions')
          .insert({
            user_id: profile.user_id,
            amount: credits,
            type: 'admin_adjustment',
            description: 'Admin: credit adjustment',
            balance_after: newBalance,
          })

        if (txError) throw txError
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
