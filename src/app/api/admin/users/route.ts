import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'
import { addCredits } from '@/lib/credits'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')

    const { databases } = createAdminClient()
    const queries = [
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
      Query.offset(page * limit),
    ]

    if (search) {
      queries.push(Query.search('fullName', search))
    }

    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, queries)

    return NextResponse.json({
      users: result.documents,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    }

    const { databases, users } = createAdminClient()
    const profile = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId)

    // Delete the profile document
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId)

    // Try to delete the Appwrite auth user too
    try {
      await users.delete(profile.userId)
    } catch {
      // User may already be deleted or not exist
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { profileId, credits, role, suspended, subscriptionTier } = body

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
    }

    const { databases } = createAdminClient()
    const profile = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId)

    const updates: Record<string, any> = {}

    if (role !== undefined) updates.role = role
    if (suspended !== undefined) updates.suspended = suspended
    if (subscriptionTier !== undefined) updates.subscriptionTier = subscriptionTier

    if (Object.keys(updates).length > 0) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId, updates)
    }

    if (credits !== undefined && credits !== 0) {
      if (credits > 0) {
        await addCredits(profile.userId, credits, `Admin: credit adjustment`)
      } else {
        // For negative adjustments, deduct balance and log transaction
        const currentBalance = profile.creditsBalance || 0
        const newBalance = Math.max(0, currentBalance + credits)
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profileId, {
          creditsBalance: newBalance,
        })
        // Create transaction record for the negative adjustment
        const { ID } = await import('node-appwrite')
        await databases.createDocument(DATABASE_ID, COLLECTIONS.CREDIT_TRANSACTIONS, ID.unique(), {
          userId: profile.userId,
          amount: credits,
          type: 'admin_adjustment',
          description: 'Admin: credit adjustment',
          balanceAfter: newBalance,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
