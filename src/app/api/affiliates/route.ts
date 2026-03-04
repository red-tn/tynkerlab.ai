import { NextResponse } from 'next/server'
import { getAffiliateByUserId, createAffiliate, getAffiliateEvents } from '@/lib/affiliates'
import { createAdminClient } from '@/lib/supabase/server'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'

export async function GET(request: Request) {
  try {
    const { userId } = await requireUser(request)

    const affiliate = await getAffiliateByUserId(userId)
    if (!affiliate) {
      return NextResponse.json({ enrolled: false }, { status: 200 })
    }

    const events = await getAffiliateEvents(affiliate.id, 20)

    return NextResponse.json({
      enrolled: true,
      affiliate,
      events,
    })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireUser(request)

    const affiliate = await createAffiliate(userId)
    return NextResponse.json({ enrolled: true, affiliate })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const VALID_PAYMENT_METHODS = ['venmo', 'paypal', 'zelle']

export async function PATCH(request: Request) {
  try {
    const { userId } = await requireUser(request)
    const { payment_method, payment_handle } = await request.json()

    if (!payment_method || !VALID_PAYMENT_METHODS.includes(payment_method)) {
      return NextResponse.json({ error: 'Invalid payment method. Use venmo, paypal, or zelle.' }, { status: 400 })
    }
    if (!payment_handle || typeof payment_handle !== 'string' || payment_handle.trim().length === 0) {
      return NextResponse.json({ error: 'Payment handle is required.' }, { status: 400 })
    }

    const affiliate = await getAffiliateByUserId(userId)
    if (!affiliate) {
      return NextResponse.json({ error: 'Not enrolled as affiliate' }, { status: 404 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('affiliates')
      .update({ payment_method, payment_handle: payment_handle.trim() })
      .eq('id', affiliate.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
