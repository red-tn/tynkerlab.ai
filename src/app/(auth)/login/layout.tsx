import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Sign In to Tynkerlab.ai',
  description: 'Sign in to your Tynkerlab.ai account to generate AI images, videos, and speech. Access your dashboard, gallery, and studio tools.',
  alternates: {
    canonical: 'https://tynkerlab.ai/login',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
