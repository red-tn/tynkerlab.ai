import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Create a Free Account — Tynkerlab.ai',
  description: 'Sign up for Tynkerlab.ai and start generating AI images, videos, and speech for free. No credit card required. Get daily credits just for checking in.',
  alternates: {
    canonical: 'https://tynkerlab.ai/signup',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
