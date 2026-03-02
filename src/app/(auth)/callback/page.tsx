'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { account } from '@/lib/appwrite/client'
import { Logo } from '@/components/brand/logo'

export default function CallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Signing you in...')

  useEffect(() => {
    const redirect = searchParams.get('redirect') || '/dashboard'

    // The Appwrite SDK automatically picks up the OAuth session
    // from the URL hash/cookies set by Appwrite during the redirect.
    // On mobile, cross-origin cookies may be blocked (Safari ITP),
    // so we retry with backoff to give the SDK time to persist
    // the session via localStorage fallback.
    const checkSession = async (attempt = 0) => {
      try {
        await account.get()
        // Session is valid — redirect to destination
        window.location.href = redirect
      } catch {
        if (attempt < 5) {
          setStatus(attempt > 1 ? 'Still working...' : 'Signing you in...')
          setTimeout(() => checkSession(attempt + 1), 800 + attempt * 400)
        } else {
          // All retries exhausted
          window.location.href = `/login?error=oauth_failed`
        }
      }
    }

    // Initial delay to let the SDK process the OAuth response
    setTimeout(() => checkSession(0), 1000)
  }, [searchParams])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative z-[1]">
      <Logo size={48} className="animate-pulse mb-4" />
      <p className="text-sm text-gray-400">{status}</p>
    </div>
  )
}
