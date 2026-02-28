'use client'

import { useState, useEffect, useCallback } from 'react'
import { databases, client, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/client'
import { Query } from 'appwrite'

export function useCredits(userId: string | undefined) {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const fetchBalance = useCallback(async () => {
    if (!userId) return
    try {
      const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
        Query.equal('userId', userId),
        Query.limit(1),
      ])
      if (result.documents.length > 0) {
        setBalance(result.documents[0].creditsBalance || 0)
      }
    } catch (err) {
      console.error('Failed to fetch credits:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  // Subscribe to realtime updates on the profiles collection
  useEffect(() => {
    if (!userId) return

    const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.PROFILES}.documents`
    const unsubscribe = client.subscribe(channel, (response) => {
      const payload = response.payload as any
      if (payload?.userId === userId && payload?.creditsBalance !== undefined) {
        setBalance(payload.creditsBalance)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [userId])

  return { balance, loading, refetch: fetchBalance }
}
