'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen relative z-[1] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-error mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-gray-400 mb-8">
          An unexpected error occurred. Please try again or contact support if the issue persists.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="ghost" onClick={() => window.location.href = '/'}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
