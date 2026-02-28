import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query, ID } from 'node-appwrite'

const SETTINGS_KEY = 'voice_config'

async function getVoiceConfig(databases: any): Promise<Record<string, any>> {
  try {
    const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
      Query.equal('key', SETTINGS_KEY),
      Query.limit(1),
    ])
    if (docs.documents.length > 0) {
      return JSON.parse(docs.documents[0].value || '{}')
    }
  } catch {}
  return {}
}

async function saveVoiceConfig(databases: any, config: Record<string, any>) {
  const docs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SITE_SETTINGS, [
    Query.equal('key', SETTINGS_KEY),
    Query.limit(1),
  ])

  const value = JSON.stringify(config).slice(0, 5000)

  if (docs.documents.length > 0) {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.SITE_SETTINGS,
      docs.documents[0].$id,
      { value }
    )
  } else {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.SITE_SETTINGS,
      ID.unique(),
      { key: SETTINGS_KEY, value }
    )
  }
}

export async function GET() {
  try {
    const { databases } = createAdminClient()
    const config = await getVoiceConfig(databases)
    return NextResponse.json({ config })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { databases } = createAdminClient()
    const body = await request.json()
    const { voiceKey, enabled, displayName, featured } = body

    if (!voiceKey) {
      return NextResponse.json({ error: 'voiceKey required' }, { status: 400 })
    }

    const config = await getVoiceConfig(databases)

    if (!config[voiceKey]) {
      config[voiceKey] = {}
    }

    if (typeof enabled === 'boolean') config[voiceKey].enabled = enabled
    if (typeof displayName === 'string') config[voiceKey].displayName = displayName
    if (typeof featured === 'boolean') config[voiceKey].featured = featured

    await saveVoiceConfig(databases, config)

    return NextResponse.json({ config })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
