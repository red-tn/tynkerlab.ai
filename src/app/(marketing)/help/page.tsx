'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Wand2, ImageIcon, Video, Image, Volume2, Coins, Sparkles,
  CreditCard, HelpCircle, ChevronDown, ChevronUp, Search,
  ArrowRight, Shield, Zap, Crown, Library, Paintbrush,
  Settings2, Upload, Mic,
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Sparkles,
    items: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Get Started" on the homepage or navigate to /signup. You can sign up with email/password, Google, or GitHub. You\'ll receive 50 free credits upon signup.',
      },
      {
        question: 'What are credits and how do they work?',
        answer: 'Credits are the currency used to generate content. Each generation costs a certain number of credits depending on the tool and model used. Free accounts get 50 credits, Pro gets 2,000/month, and Enterprise gets 10,000/month.',
      },
      {
        question: 'How do I get more credits?',
        answer: 'You can purchase credit packs from the pricing page ($5, $20, $50, or $125), or upgrade your subscription to Pro or Enterprise for monthly credit allotments.',
      },
    ] as FAQItem[],
  },
  {
    id: 'studio-tools',
    title: 'Studio Tools',
    icon: Wand2,
    items: [
      {
        question: 'What tools are available?',
        answer: 'Tynkerlab.ai offers five AI generation tools: Text to Image (generate from text), Image to Image (transform existing images), Text to Video (create videos from text), Image to Video (animate still images), and Text to Speech (generate AI voice audio).',
      },
      {
        question: 'What AI models can I use?',
        answer: 'We offer 54+ AI models including Google Imagen 3, FLUX Pro/Schnell, Stable Diffusion XL, Sora, Kling, Minimax, and more. Each model has different strengths — some excel at photorealism, others at artistic styles.',
      },
      {
        question: 'How does the AI Prompt Enhancement work?',
        answer: 'Click the sparkle button above any prompt textarea. Choose "Subtle" for minor polish or "Creative" for a full rewrite. The AI rewrites your prompt for optimal generation results. This feature is free (0 credits).',
      },
      {
        question: 'What aspect ratios and resolutions are supported?',
        answer: 'We support 10 aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 21:9, 4:5, 5:4) with resolutions auto-adjusted to match. Common sizes include 1024x1024, 1280x720, and 1920x1080.',
      },
    ] as FAQItem[],
  },
  {
    id: 'text-to-speech',
    title: 'Text to Speech',
    icon: Volume2,
    items: [
      {
        question: 'What TTS engines are available?',
        answer: 'Three voice engines: Kokoro (fast, 1 credit, 8 voices), Orpheus (mid-tier, 2 credits, 6 voices with emotional markers), and Cartesia Sonic 2 (premium, 5 credits, 6 voices, highest quality).',
      },
      {
        question: 'What are the voice modes?',
        answer: 'Library: Browse 20+ pre-built voices filtered by gender and engine. Voice Design: Describe your ideal voice (gender, age, accent) and we match the best option. Instant Clone: Upload a short audio sample for a quick voice clone. Professional Clone: Upload multiple samples for highest-fidelity voice cloning (Pro/Enterprise only).',
      },
      {
        question: 'What voice settings can I adjust?',
        answer: 'Stability (consistency vs expression), Similarity (closeness to target voice), Style (unique character amplification), Speed (0.5x-2x), Loudness (vocal energy), Guidance Scale (voice faithfulness), and Speaker Boost (clarity enhancement).',
      },
      {
        question: 'How many voice clones can I create?',
        answer: 'Free: 1 instant clone. Pro: 5 instant + 2 professional clones. Enterprise: 20 instant + 10 professional clones.',
      },
      {
        question: 'What audio formats are supported?',
        answer: 'MP3, WAV (lossless), and Opus (compact). All generated audio can be downloaded directly from the player.',
      },
    ] as FAQItem[],
  },
  {
    id: 'billing',
    title: 'Billing & Subscriptions',
    icon: CreditCard,
    items: [
      {
        question: 'What plans are available?',
        answer: 'Free (50 credits, basic features), Pro ($20/month, 2,000 credits, all voices, priority generation), and Enterprise ($99/month, 10,000 credits, all features, professional voice cloning).',
      },
      {
        question: 'What happens if I run out of credits?',
        answer: 'You can purchase additional credit packs at any time. Unused purchased credits never expire. Monthly subscription credits reset each billing cycle.',
      },
      {
        question: 'Can I cancel my subscription?',
        answer: 'Yes, you can cancel anytime from your dashboard subscription page. You\'ll retain access until the end of your current billing period.',
      },
      {
        question: 'Do credits refund if generation fails?',
        answer: 'Yes! If an AI generation fails for any reason, your credits are automatically refunded to your balance.',
      },
    ] as FAQItem[],
  },
  {
    id: 'account',
    title: 'Account & Security',
    icon: Shield,
    items: [
      {
        question: 'How do I change my password?',
        answer: 'Go to Dashboard > Profile to update your password. You can also use the "Forgot password" link on the login page.',
      },
      {
        question: 'Can I connect multiple sign-in methods?',
        answer: 'Yes, you can link Google and GitHub to your account for convenient sign-in options.',
      },
      {
        question: 'Where are my generated files stored?',
        answer: 'All generated images, videos, and audio are stored in your account and accessible from the Dashboard > Gallery. You can download them anytime.',
      },
    ] as FAQItem[],
  },
]

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-nyx-border bg-nyx-surface/80 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-sm font-medium text-white pr-4">{item.question}</span>
            {openIndex === i ? (
              <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
            )}
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4 border-t border-nyx-border pt-3">
              <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const filteredSections = searchQuery.trim()
    ? SECTIONS.map(section => ({
        ...section,
        items: section.items.filter(
          item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(section => section.items.length > 0)
    : SECTIONS

  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-primary-500/10 ring-1 ring-primary-500/20 mb-4">
            <HelpCircle className="h-8 w-8 text-primary-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Help Center</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Everything you need to know about using Tynkerlab.ai&apos;s AI generation platform.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto mb-12">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-nyx-surface border border-nyx-border text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-12">
          {[
            { href: '/studio/text-to-image', label: 'Text to Image', icon: Wand2 },
            { href: '/studio/image-to-image', label: 'Image to Image', icon: ImageIcon },
            { href: '/studio/text-to-video', label: 'Text to Video', icon: Video },
            { href: '/studio/image-to-video', label: 'Image to Video', icon: Image },
            { href: '/studio/text-to-speech', label: 'Text to Speech', icon: Volume2 },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-nyx-border bg-nyx-surface/80 hover:border-primary-500/30 transition-all text-center group">
                <link.icon className="h-5 w-5 text-primary-400 group-hover:text-primary-300 transition-colors" />
                <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredSections.map((section) => (
            <div key={section.id}>
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="h-5 w-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              <FAQAccordion items={section.items} />
            </div>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No results found for &ldquo;{searchQuery}&rdquo;</p>
            <Button variant="secondary" size="sm" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 text-center rounded-xl border border-nyx-border bg-nyx-surface/80 p-8">
          <h3 className="text-lg font-semibold text-white mb-2">Still need help?</h3>
          <p className="text-sm text-gray-400 mb-4">Our support team is here to assist you.</p>
          <Link href="/contact">
            <Button variant="primary" size="sm">
              Contact Support <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
