import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Contact Us — Get Support for Tynkerlab.ai',
  description: 'Contact the Tynkerlab.ai team for support, bug reports, sales inquiries, or press requests. We\'re here to help.',
  alternates: {
    canonical: 'https://tynkerlab.ai/contact',
  },
  openGraph: {
    title: 'Contact Tynkerlab.ai — Get Support',
    description: 'Contact the Tynkerlab.ai team for support, bug reports, sales inquiries, or press requests.',
    url: 'https://tynkerlab.ai/contact',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Contact Tynkerlab.ai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Tynkerlab.ai — Get Support',
    description: 'Contact the Tynkerlab.ai team for support, bug reports, sales inquiries, or press requests.',
  },
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
