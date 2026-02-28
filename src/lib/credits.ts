import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query, ID } from 'node-appwrite'

export async function getBalance(userId: string): Promise<number> {
  const { databases } = createAdminClient()
  const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
    Query.equal('userId', userId),
    Query.limit(1),
  ])
  if (result.documents.length === 0) return 0
  return result.documents[0].creditsBalance || 0
}

export async function checkCredits(userId: string, amount: number): Promise<boolean> {
  const balance = await getBalance(userId)
  return balance >= amount
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  referenceId: string
): Promise<boolean> {
  const { databases } = createAdminClient()

  // Get current profile
  const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
    Query.equal('userId', userId),
    Query.limit(1),
  ])

  if (profiles.documents.length === 0) return false
  const profile = profiles.documents[0]

  if (profile.creditsBalance < amount) return false

  const newBalance = profile.creditsBalance - amount

  // Update balance
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profile.$id, {
    creditsBalance: newBalance,
  })

  // Create transaction record
  await databases.createDocument(DATABASE_ID, COLLECTIONS.CREDIT_TRANSACTIONS, ID.unique(), {
    userId,
    amount: -amount,
    type: 'generation_debit',
    description,
    referenceId,
    balanceAfter: newBalance,
  })

  return true
}

export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string,
  type: string = 'admin_adjustment'
): Promise<void> {
  const { databases } = createAdminClient()

  // Get current profile
  const profiles = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
    Query.equal('userId', userId),
    Query.limit(1),
  ])

  if (profiles.documents.length === 0) {
    throw new Error('Profile not found')
  }

  const profile = profiles.documents[0]
  const newBalance = profile.creditsBalance + amount

  // Update balance
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, profile.$id, {
    creditsBalance: newBalance,
  })

  // Create transaction record
  await databases.createDocument(DATABASE_ID, COLLECTIONS.CREDIT_TRANSACTIONS, ID.unique(), {
    userId,
    amount,
    type,
    description,
    referenceId,
    balanceAfter: newBalance,
  })
}

export async function refundCredits(
  userId: string,
  amount: number,
  description: string,
  referenceId: string
): Promise<void> {
  await addCredits(userId, amount, description, referenceId, 'refund')
}

export async function getTransactionHistory(userId: string, limit: number = 50) {
  const { databases } = createAdminClient()
  const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CREDIT_TRANSACTIONS, [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(limit),
  ])
  return result.documents
}
