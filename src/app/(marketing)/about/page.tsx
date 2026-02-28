import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Zap, Shield, Globe, Heart, Users, Target } from 'lucide-react'

export const metadata = {
  title: 'About | Tynkerlab.ai',
  description: 'Learn about Tynkerlab.ai — the AI-powered creative platform for image and video generation.',
}

const VALUES = [
  { icon: Zap, title: 'Innovation First', desc: 'We integrate the latest AI models the moment they launch, so you always have cutting-edge tools.' },
  { icon: Shield, title: 'Privacy & Safety', desc: 'Your creations are yours. We never train on user content or share your data with third parties.' },
  { icon: Globe, title: 'Accessible to All', desc: 'From free-tier hobbyists to enterprise teams, powerful AI generation should be within everyone\'s reach.' },
  { icon: Heart, title: 'Creator-Centric', desc: 'Every feature we build starts with one question: does this help creators make better work, faster?' },
  { icon: Users, title: 'Community Driven', desc: 'Our prompt gallery and model selection are shaped by the feedback of thousands of active creators.' },
  { icon: Target, title: 'Quality Over Quantity', desc: 'We curate only the best models and fine-tune defaults so every generation looks great out of the box.' },
]

const STATS = [
  { value: '54+', label: 'AI Models' },
  { value: '1M+', label: 'Images Generated' },
  { value: '50K+', label: 'Creators' },
  { value: '99.9%', label: 'Uptime' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About <span className="gradient-text">Tynkerlab.ai</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            We&apos;re building the most powerful and accessible AI creative platform on the web.
            One prompt at a time.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-nyx-surface border border-nyx-border rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            Tynkerlab.ai exists to democratize AI-powered creativity. We believe that the ability to generate
            stunning images and cinematic videos shouldn&apos;t require expensive hardware, years of artistic
            training, or enterprise-level budgets. By aggregating the world&apos;s best generative AI models
            into a single, intuitive platform, we give every creator — from hobbyists to studios — the tools
            to bring their vision to life.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center p-6 bg-nyx-surface border border-nyx-border rounded-xl">
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">What We Stand For</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 bg-nyx-surface border border-nyx-border rounded-xl hover:border-primary-500/30 transition-colors">
              <Icon className="h-8 w-8 text-primary-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team / CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Built by Creators, for Creators</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Tynkerlab.ai is a small, passionate team of engineers, designers, and AI researchers
          who believe the next generation of creative tools will be powered by artificial intelligence.
        </p>
        <a
          href="/signup"
          className="inline-flex items-center px-6 py-3 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          Start Creating for Free
        </a>
      </section>

      <Footer />
    </div>
  )
}
