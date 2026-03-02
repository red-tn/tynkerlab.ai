import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'

// Public read-only endpoint for site settings (no auth required).
// Used by the homepage and other public pages to load settings like homepage_tools.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'key parameter is required' }, { status: 400 })
    }

    const { databases } = createAdminClient()

    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
      Query.equal('key', key),
      Query.limit(1),
    ])

    if (result.documents.length > 0) {
      return NextResponse.json(result.documents[0])
    }

    return NextResponse.json({ key, value: null })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
