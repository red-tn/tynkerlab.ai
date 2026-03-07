'use client'

import { AuthGuard } from '@/components/auth-guard'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileStudioNav } from '@/components/layout/mobile-studio-nav'
import { WelcomeModal } from '@/components/onboarding/welcome-modal'
import { useAuth } from '@/hooks/use-auth'
import { useCredits } from '@/hooks/use-credits'
import type { ReactNode } from 'react'

function StudioContent({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { balance } = useCredits(user?.id)

  return (
    <div className="min-h-screen flex flex-col relative z-[1]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 pb-40 lg:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <MobileStudioNav />
      <WelcomeModal creditsBalance={balance} />
    </div>
  )
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <StudioContent>{children}</StudioContent>
    </AuthGuard>
  )
}
