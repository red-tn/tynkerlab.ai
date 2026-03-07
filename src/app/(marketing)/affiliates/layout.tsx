import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Affiliate Program — Earn 10% Commission Promoting AI Tools',
  description: 'Join the Tynkerlab.ai affiliate program and earn 10% recurring commission on every sale. Free to join, 30-day cookie window, real-time dashboard.',
  alternates: {
    canonical: 'https://tynkerlab.ai/affiliates',
  },
  openGraph: {
    title: 'Tynkerlab.ai Affiliate Program — Earn 10% Recurring Commission',
    description: 'Earn 10% recurring commission on every sale you refer. Free to join, 30-day cookie window, no earnings cap.',
    url: 'https://tynkerlab.ai/affiliates',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tynkerlab.ai Affiliate Program',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tynkerlab.ai Affiliate Program — Earn 10% Recurring Commission',
    description: 'Earn 10% recurring commission on every sale you refer. Free to join, 30-day cookie window, no earnings cap.',
  },
}

export default function AffiliatesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
