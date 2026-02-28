'use client'

import { AuthGuard } from '@/components/auth-guard'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import type { ReactNode } from 'react'

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col relative z-[1]">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
