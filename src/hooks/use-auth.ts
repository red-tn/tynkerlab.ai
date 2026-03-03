'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`)
      if (res.ok) {
        const profile = await res.json()
        setProfile(profile as Profile)
        return
      }

      // Profile not found — auto-create one
      if (res.status === 404) {
        const createRes = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email: userEmail || '', name: userName || '' }),
        })
        if (createRes.ok) {
          const newProfile = await createRes.json()
          setProfile(newProfile as Profile)
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    const init = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        await fetchProfile(
          currentUser.id,
          currentUser.email,
          currentUser.user_metadata?.full_name || currentUser.user_metadata?.name
        )
      }
      setIsLoading(false)
    }
    init()

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    window.location.href = '/login'
  }, [])

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    signOut,
    refreshProfile,
  }
}
