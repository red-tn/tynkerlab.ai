import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireUser, AuthError, authErrorResponse } from '@/lib/auth-guard'

export async function GET(request: Request) {
  try {
    const { userId } = await requireUser(request)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = createAdminClient()
    let query = supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (type && type !== 'all') {
      const typeMap: Record<string, string[]> = {
        purchases: ['credit_purchase', 'subscription_credit'],
        generations: ['generation_debit'],
        subscriptions: ['subscription_credit'],
        adjustments: ['admin_adjustment'],
        refunds: ['refund'],
      }
      const types = typeMap[type]
      if (types) {
        query = query.in('type', types)
      }
    }

    const from = page * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const total = count || 0

    return NextResponse.json({
      transactions: data || [],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    const authErr = authErrorResponse(error)
    if (authErr) return authErr
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
