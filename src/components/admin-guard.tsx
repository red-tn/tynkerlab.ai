'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminGuardProps {
  children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isAdmin, isLoading, profile } = useAuth()
  const router = useRouter()

  // Wait for both auth AND profile to fully resolve before redirecting.
  // Without this, there's a brief window where isAuthenticated=true but
  // isAdmin=false (profile still loading), triggering a spurious redirect
  // to /dashboard which pollutes analytics.
  const fullyResolved = !isLoading && (isAuthenticated ? profile !== null : true)

  useEffect(() => {
    if (!fullyResolved) return
    if (!isAuthenticated) {
      router.replace('/login')
    } else if (!isAdmin) {
      router.replace('/dashboard')
    }
  }, [fullyResolved, isAuthenticated, isAdmin, router])

  if (!fullyResolved) {
    return (
      <div className="min-h-screen relative z-[1] flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) return null

  return <>{children}</>
}
