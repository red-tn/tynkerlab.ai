import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')

    const { databases } = createAdminClient()
    const queries = [
      Query.equal('status', 'completed'),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset(page * limit),
    ]

    if (type === 'image') {
      queries.push(Query.contains('type', 'image'))
    } else if (type === 'video') {
      queries.push(Query.contains('type', 'video'))
    }

    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GENERATIONS, queries)

    return NextResponse.json({
      generations: result.documents,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
