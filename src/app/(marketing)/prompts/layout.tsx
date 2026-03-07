import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'AI Prompt Inspiration Gallery — Browse & Copy Creative Prompts',
  description: 'Browse thousands of AI-generated images and videos with copyable prompts. Get inspired and jumpstart your next AI art, video, or creative project on Tynkerlab.ai.',
  alternates: {
    canonical: 'https://tynkerlab.ai/prompts',
  },
  openGraph: {
    title: 'AI Prompt Inspiration Gallery — Tynkerlab.ai',
    description: 'Browse AI-generated images and videos with copyable prompts. Get inspired and jumpstart your next AI creation.',
    url: 'https://tynkerlab.ai/prompts',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tynkerlab.ai Prompt Inspiration Gallery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Prompt Inspiration Gallery — Tynkerlab.ai',
    description: 'Browse AI-generated images and videos with copyable prompts. Get inspired for your next AI creation.',
  },
}

export default function PromptsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
