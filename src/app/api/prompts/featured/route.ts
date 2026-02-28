import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'

export async function GET() {
  try {
    const { databases } = createAdminClient()
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROMPTS, [
      Query.equal('isPublished', true),
      Query.equal('isFeatured', true),
      Query.orderDesc('usageCount'),
      Query.limit(12),
    ])

    return NextResponse.json({ prompts: result.documents })
  } catch (error: any) {
    return NextResponse.json({ prompts: [] })
  }
}
