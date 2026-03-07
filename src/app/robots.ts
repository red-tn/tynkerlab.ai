import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tynkerlab.ai'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/pricing',
          '/blog/',
          '/prompts',
          '/help',
          '/contact',
          '/affiliates',
          '/terms',
          '/privacy',
          '/cookies',
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/studio/',
          '/callback',
          '/reset-password',
          '/login',
          '/signup',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
