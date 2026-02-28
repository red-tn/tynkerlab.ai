import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query, ID } from 'node-appwrite'

export const AFFILIATE_COMMISSION_RATE = 0.10
export const COOKIE_DURATION_DAYS = 30
export const MIN_PAYOUT = 25

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function getAffiliateByUserId(userId: string) {
  const { databases } = createAdminClient()
  const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AFFILIATES, [
    Query.equal('userId', userId),
    Query.limit(1),
  ])
  return result.documents[0] || null
}

export async function getAffiliateByCode(code: string) {
  const { databases } = createAdminClient()
  const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AFFILIATES, [
    Query.equal('code', code),
    Query.limit(1),
  ])
  return result.documents[0] || null
}

export async function createAffiliate(userId: string) {
  const { databases } = createAdminClient()

  // Check if already enrolled
  const existing = await getAffiliateByUserId(userId)
  if (existing) return existing

  // Generate unique code
  let code = generateCode()
  let attempts = 0
  while (attempts < 5) {
    const dup = await getAffiliateByCode(code)
    if (!dup) break
    code = generateCode()
    attempts++
  }

  return databases.createDocument(DATABASE_ID, COLLECTIONS.AFFILIATES, ID.unique(), {
    userId,
    code,
    status: 'active',
    totalClicks: 0,
    totalSignups: 0,
    totalConversions: 0,
    totalEarnings: 0,
    pendingBalance: 0,
    paidOut: 0,
    createdAt: new Date().toISOString(),
  })
}

export async function recordClick(affiliateId: string) {
  const { databases } = createAdminClient()

  // Increment clicks
  const affiliate = await databases.getDocument(DATABASE_ID, COLLECTIONS.AFFILIATES, affiliateId)
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.AFFILIATES, affiliateId, {
    totalClicks: (affiliate.totalClicks || 0) + 1,
  })

  await databases.createDocument(DATABASE_ID, COLLECTIONS.AFFILIATE_EVENTS, ID.unique(), {
    affiliateId,
    type: 'click',
    saleAmount: 0,
    commission: 0,
    createdAt: new Date().toISOString(),
  })
}

export async function recordSignup(affiliateId: string, referredUserId: string) {
  const { databases } = createAdminClient()

  const affiliate = await databases.getDocument(DATABASE_ID, COLLECTIONS.AFFILIATES, affiliateId)
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.AFFILIATES, affiliateId, {
    totalSignups: (affiliate.totalSignups || 0) + 1,
  })

  await databases.createDocument(DATABASE_ID, COLLECTIONS.AFFILIATE_EVENTS, ID.unique(), {
    affiliateId,
    type: 'signup',
    referredUserId,
    saleAmount: 0,
    commission: 0,
    createdAt: new Date().toISOString(),
  })
}

export async function recordCommission(affiliateId: string, orderId: string, saleAmount: number) {
  const { databases } = createAdminClient()
  const commission = saleAmount * AFFILIATE_COMMISSION_RATE

  const affiliate = await databases.getDocument(DATABASE_ID, COLLECTIONS.AFFILIATES, affiliateId)
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.AFFILIATES, affiliateId, {
    totalConversions: (affiliate.totalConversions || 0) + 1,
    totalEarnings: (affiliate.totalEarnings || 0) + commission,
    pendingBalance: (affiliate.pendingBalance || 0) + commission,
  })

  await databases.createDocument(DATABASE_ID, COLLECTIONS.AFFILIATE_EVENTS, ID.unique(), {
    affiliateId,
    type: 'commission',
    orderId,
    saleAmount,
    commission,
    createdAt: new Date().toISOString(),
  })
}

export async function getAffiliateEvents(affiliateId: string, limit = 50) {
  const { databases } = createAdminClient()
  const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AFFILIATE_EVENTS, [
    Query.equal('affiliateId', affiliateId),
    Query.orderDesc('$createdAt'),
    Query.limit(limit),
  ])
  return result.documents
}

export async function getAllAffiliates(limit = 100) {
  const { databases } = createAdminClient()
  const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.AFFILIATES, [
    Query.orderDesc('$createdAt'),
    Query.limit(limit),
  ])
  return result
}

export async function processPayout(affiliateId: string) {
  const { databases } = createAdminClient()
  const affiliate = await databases.getDocument(DATABASE_ID, COLLECTIONS.AFFILIATES, affiliateId)

  const amount = affiliate.pendingBalance || 0
  if (amount < MIN_PAYOUT) {
    throw new Error(`Minimum payout is $${MIN_PAYOUT}. Current balance: $${amount.toFixed(2)}`)
  }

  await databases.updateDocument(DATABASE_ID, COLLECTIONS.AFFILIATES, affiliateId, {
    pendingBalance: 0,
    paidOut: (affiliate.paidOut || 0) + amount,
  })

  await databases.createDocument(DATABASE_ID, COLLECTIONS.AFFILIATE_EVENTS, ID.unique(), {
    affiliateId,
    type: 'payout',
    saleAmount: 0,
    commission: amount,
    createdAt: new Date().toISOString(),
  })

  return amount
}
