import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { ID, Query } from 'node-appwrite'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const { databases } = createAdminClient()
    const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
      Query.equal('userId', userId),
      Query.limit(1),
    ])

    if (profiles.documents.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const profile = profiles.documents[0]

    // One-time migration: grant 50 credits to pre-existing free accounts with 0 credits
    if (
      profile.creditsBalance === 0 &&
      profile.creditsMonthly === 0 &&
      profile.subscriptionTier === 'free'
    ) {
      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        profile.$id,
        { creditsBalance: 50, creditsMonthly: 50 }
      )
      return NextResponse.json(updated)
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, name, email } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    const { databases } = createAdminClient()

    // Create profile document
    const profile = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      ID.unique(),
      {
        userId,
        email,
        fullName: name,
        role: 'user',
        creditsBalance: 50,
        creditsMonthly: 50,
        subscriptionTier: 'free',
        subscriptionStatus: 'inactive',
        totalGenerations: 0,
        totalImages: 0,
        totalVideos: 0,
      }
    )

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const updates = await request.json()
    const { databases } = createAdminClient()

    if (!updates.profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 })
    }

    const profile = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      updates.profileId,
      updates.data
    )

    return NextResponse.json(profile)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { databases, users } = createAdminClient()
    const { userId } = await request.json()

    // Delete profile document
    const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
      Query.equal('userId', userId),
    ])
    if (profiles.documents[0]) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROFILES, profiles.documents[0].$id)
    }

    // Delete auth user
    await users.delete(userId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
