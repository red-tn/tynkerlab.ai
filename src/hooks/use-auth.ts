'use client'

import { useState, useEffect, useCallback } from 'react'
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/client'
import { Models, Query } from 'appwrite'
import type { Profile } from '@/types/database'

interface AuthState {
  user: Models.User<Models.Preferences> | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
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
      await fetchProfile(user.$id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await account.get()
        setUser(currentUser)
        await fetchProfile(currentUser.$id, currentUser.email, currentUser.name)
      } catch {
        setUser(null)
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    try {
      await account.deleteSession('current')
    } catch {
      // Session may already be expired
    }
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
