'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Logo } from '@/components/brand/logo'

function CallbackHandler() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Signing you in...')

  useEffect(() => {
    const redirect = searchParams.get('redirect') || '/dashboard'

    const handleCallback = async () => {
      try {
        // Supabase OAuth returns a code in the URL that needs to be exchanged
        const code = searchParams.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        }

        // Verify we have a session
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No session')

        // Ensure profile exists
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          }),
        })

        window.location.replace(redirect)
      } catch {
        window.location.replace('/login?error=oauth_failed')
      }
    }

    handleCallback()
  }, [searchParams])

  return (
    <>
      <Logo size={48} className="animate-pulse mb-4" />
      <p className="text-sm text-gray-400">{status}</p>
    </>
  )
}

export default function CallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative z-[1]">
      <Suspense fallback={
        <>
          <Logo size={48} className="animate-pulse mb-4" />
          <p className="text-sm text-gray-400">Signing you in...</p>
        </>
      }>
        <CallbackHandler />
      </Suspense>
    </div>
  )
}
