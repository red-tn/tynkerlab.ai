'use client'

import { AdminGuard } from '@/components/admin-guard'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen relative z-[1] flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
