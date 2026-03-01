'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { account } from '@/lib/appwrite/client'
import { Logo } from '@/components/brand/logo'

export default function CallbackPage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = searchParams.get('redirect') || '/dashboard'

    // The Appwrite SDK automatically picks up the OAuth session
    // from the URL hash/cookies set by Appwrite during the redirect.
    // We just need to verify the session exists, then navigate.
    const checkSession = async () => {
      try {
        await account.get()
        // Session is valid — redirect to destination
        window.location.href = redirect
      } catch {
        // No session — OAuth may have failed
        window.location.href = `/login?error=oauth_failed`
      }
    }

    // Small delay to let Appwrite SDK process the session
    setTimeout(checkSession, 500)
  }, [searchParams])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative z-[1]">
      <Logo size={48} className="animate-pulse mb-4" />
      <p className="text-sm text-gray-400">Signing you in...</p>
    </div>
  )
}
