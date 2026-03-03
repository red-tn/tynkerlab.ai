'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useCredits(userId: string | undefined) {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const fetchBalance = useCallback(async () => {
    if (!userId) return
    try {
      const { data } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('user_id', userId)
        .single()
      if (data) {
        setBalance(data.credits_balance || 0)
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

  // Subscribe to realtime updates on the profiles table
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`credits-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBalance = payload.new?.credits_balance
          if (newBalance !== undefined) {
            setBalance(newBalance)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { balance, loading, refetch: fetchBalance }
}
