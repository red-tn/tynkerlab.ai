'use client'

import { AuthGuard } from '@/components/auth-guard'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col relative z-[1]">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {children}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  )
}
