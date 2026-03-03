import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const total = count || 0

    return NextResponse.json({
      transactions: data || [],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
