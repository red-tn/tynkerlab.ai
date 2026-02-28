import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'

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

    const { databases } = createAdminClient()
    const queries = [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset(page * limit),
    ]

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
        queries.push(Query.equal('type', types))
      }
    }

    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CREDIT_TRANSACTIONS, queries)

    return NextResponse.json({
      transactions: result.documents,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
