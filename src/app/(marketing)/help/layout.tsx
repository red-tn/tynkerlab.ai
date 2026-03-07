import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Help Center — Tynkerlab.ai FAQs & Guides',
  description: 'Find answers about AI image generation, video creation, text-to-speech, billing, credits, and account management on Tynkerlab.ai.',
  alternates: {
    canonical: 'https://tynkerlab.ai/help',
  },
  openGraph: {
    title: 'Tynkerlab.ai Help Center — FAQs & Guides',
    description: 'Find answers about AI image generation, video creation, text-to-speech, billing, and account management.',
    url: 'https://tynkerlab.ai/help',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tynkerlab.ai Help Center',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tynkerlab.ai Help Center — FAQs & Guides',
    description: 'Find answers about AI image generation, video creation, text-to-speech, billing, and account management.',
  },
}

export default function HelpLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
