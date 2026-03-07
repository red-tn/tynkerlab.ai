import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { JsonLd } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'Pricing — Free AI Generator Plans & Credit Packs',
  description: 'Start free with daily credits or upgrade to Creator ($20/mo) or Pro Creator ($99/mo). Access 56+ AI image, video, and speech models. No credit card required to start.',
  alternates: {
    canonical: 'https://tynkerlab.ai/pricing',
  },
  openGraph: {
    title: 'Tynkerlab.ai Pricing — Free, Creator & Pro Creator Plans',
    description: 'Start free with daily credits or upgrade to unlock all AI models, HD output, and premium voices. Transparent pricing with no hidden fees.',
    url: 'https://tynkerlab.ai/pricing',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tynkerlab.ai Pricing Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tynkerlab.ai Pricing — Free, Creator & Pro Creator Plans',
    description: 'Start free with daily credits or upgrade to unlock all AI models, HD output, and premium voices.',
  },
}

const pricingFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are credits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Credits are the currency used to generate images and videos. Different AI models cost different amounts of credits depending on their quality and compute requirements.',
      },
    },
    {
      '@type': 'Question',
      name: 'What can free users access?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free users can generate images with all 32 image models, use Templates, and use Kokoro TTS. Outputs include a small watermark. Video generation, premium TTS voices, and UGC Avatars require a Creator or Pro Creator plan. Free users earn 3 credits daily via check-in.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do unused credits roll over?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Monthly subscription credits reset each billing cycle. Credit pack purchases never expire and remain in your account until used.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I switch plans?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! You can upgrade or downgrade your plan anytime. Upgrades take effect immediately, and downgrades apply at the end of your current billing period.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept all major credit and debit cards through Stripe, including Visa, Mastercard, American Express, and more.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a refund policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If a generation fails, credits are automatically refunded to your account. For subscription refunds, please contact our support team.',
      },
    },
  ],
}

const pricingProductSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Tynkerlab.ai Creator Plan',
  description: 'AI image and video generation platform with 2,000 monthly credits, access to 56+ models, HD output, and premium TTS voices.',
  brand: {
    '@type': 'Brand',
    name: 'Tynkerlab.ai',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Plan',
      price: '0',
      priceCurrency: 'USD',
      description: '50 monthly credits, all 32 image models, daily check-in credits.',
      url: 'https://tynkerlab.ai/pricing',
    },
    {
      '@type': 'Offer',
      name: 'Creator Plan',
      price: '20',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'RecurringChargeSpecification',
        billingDuration: 'P1M',
      },
      description: '2,000 monthly credits, all 56+ models including video, HD output, premium TTS voices.',
      url: 'https://tynkerlab.ai/pricing',
    },
    {
      '@type': 'Offer',
      name: 'Pro Creator Plan',
      price: '99',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'RecurringChargeSpecification',
        billingDuration: 'P1M',
      },
      description: '15,000 monthly credits, all features, professional voice cloning, API access.',
      url: 'https://tynkerlab.ai/pricing',
    },
  ],
}

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={pricingFaqSchema} />
      <JsonLd data={pricingProductSchema} />
      {children}
    </>
  )
}
