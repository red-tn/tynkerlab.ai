import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { ID, Query } from 'node-appwrite'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    const { databases } = createAdminClient()

    if (key) {
      const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
        Query.equal('key', key),
        Query.limit(1),
      ])
      if (result.documents.length > 0) {
        return NextResponse.json(result.documents[0])
      }
      return NextResponse.json({ key, value: null })
    }

    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
      Query.limit(100),
    ])
    return NextResponse.json({ settings: result.documents })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    const { databases } = createAdminClient()

    // Check if setting exists
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
      Query.equal('key', key),
      Query.limit(1),
    ])

    if (existing.documents.length > 0) {
      // Update
      const doc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SITE_SETTINGS,
        existing.documents[0].$id,
        { value }
      )
      return NextResponse.json(doc)
    } else {
      // Create
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SITE_SETTINGS,
        ID.unique(),
        { key, value }
      )
      return NextResponse.json(doc)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
