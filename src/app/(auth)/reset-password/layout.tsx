import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Reset Your Password — Tynkerlab.ai',
  description: 'Reset your Tynkerlab.ai account password.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
