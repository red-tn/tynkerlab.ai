'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TextToImageIcon, ImageToImageIcon, TextToVideoIcon, ImageToVideoIcon, UGCAvatarIcon, PromptMakerIcon, TextToSpeechIcon } from '@/components/brand/dynamic-icons'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { SupportedModelsSection } from '@/components/landing/supported-models-section'
import { Sparkles, Zap, Shield, ArrowRight, Star, Palette, Film, Wand2, Layers, Globe, Heart, Code, ImageIcon, Video, Copy, Volume2, LayoutTemplate, Cpu, Wrench, Monitor } from 'lucide-react'
import type { Prompt } from '@/types/database'

const TOOLS = [
  { key: 'text-to-image', Icon: TextToImageIcon, title: 'Text to Image', desc: 'Generate stunning images from text descriptions', href: '/studio/text-to-image' },
  { key: 'image-to-image', Icon: ImageToImageIcon, title: 'Image to Image', desc: 'Transform and enhance existing images with AI', href: '/studio/image-to-image' },
  { key: 'text-to-video', Icon: TextToVideoIcon, title: 'Text to Video', desc: 'Create cinematic videos from text prompts', href: '/studio/text-to-video' },
  { key: 'image-to-video', Icon: ImageToVideoIcon, title: 'Image to Video', desc: 'Animate still images into dynamic videos', href: '/studio/image-to-video' },
  { key: 'ugc-avatar', Icon: UGCAvatarIcon, title: 'UGC Avatar', desc: 'Create talking avatar videos from a photo', href: '/studio/ugc-avatar' },
  { key: 'prompt-maker', Icon: PromptMakerIcon, title: 'Prompt Maker', desc: 'Build perfect AI prompts with structured guidance', href: '/studio/prompt-maker' },
  { key: 'text-to-speech', Icon: TextToSpeechIcon, title: 'Text to Speech', desc: 'Convert text to natural-sounding AI voices', href: '/studio/text-to-speech' },
  { key: 'templates', Icon: LayoutTemplate as any, title: 'Templates', desc: 'Pre-built AI workflows for instant social media content', href: '/studio/templates' },
]

interface ToolImageData {
  key: string
  imageUrl: string
  imageUrlAfter?: string
  prompt: string
}

const STEPS = [
  { num: '01', title: 'Choose Your Tool', desc: 'Select from eight AI tools including image, video, speech, templates, UGC avatars, and prompt maker.' },
  { num: '02', title: 'Describe Your Vision', desc: 'Enter a prompt and let AI Enhance polish it for optimal results. Pick a model and settings.' },
  { num: '03', title: 'Generate & Download', desc: 'Hit generate and watch your creation come to life. Download in full resolution.' },
]

const USE_CASES = [
  { icon: Palette, title: 'Digital Art', desc: 'Create unique artwork and illustrations' },
  { icon: Film, title: 'Social Media', desc: 'Eye-catching content for every platform' },
  { icon: Wand2, title: 'Product Design', desc: 'Visualize concepts and prototypes' },
  { icon: Layers, title: 'Marketing', desc: 'Campaign visuals and ad creatives' },
  { icon: Globe, title: 'Web Design', desc: 'Hero images, backgrounds, and assets' },
  { icon: Heart, title: 'Personal', desc: 'Avatars, gifts, and creative projects' },
  { icon: Code, title: 'Game Dev', desc: 'Concept art and texture generation' },
  { icon: Star, title: 'Education', desc: 'Visual learning materials and diagrams' },
]

const TESTIMONIALS = [
  { name: 'Alex Chen', role: 'Graphic Designer', text: 'Tynkerlab.ai has completely transformed my workflow. I can iterate on concepts 10x faster than before.', rating: 5 },
  { name: 'Sarah Martinez', role: 'Content Creator', text: 'The video generation is incredible. I create weeks of social content in a single session.', rating: 5 },
  { name: 'James Park', role: 'Product Manager', text: 'The variety of models and the quality of output make Tynkerlab.ai the best platform I\'ve used.', rating: 5 },
]

export default function HomePage() {
  const [featured, setFeatured] = useState<Prompt[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [toolImages, setToolImages] = useState<Record<string, ToolImageData>>({})

  useEffect(() => {
    fetch('/api/prompts/featured')
      .then(r => r.json())
      .then(d => setFeatured(d.prompts || []))
      .catch(() => {})

    fetch('/api/settings?key=homepage_tools')
      .then(r => r.json())
      .then(d => {
        if (d.value) {
          try {
            const arr: ToolImageData[] = JSON.parse(d.value)
            const map: Record<string, ToolImageData> = {}
            arr.forEach(t => { if (t.imageUrl) map[t.key] = t })
            setToolImages(map)
          } catch {}
        }
      })
      .catch(() => {})
  }, [])

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated gradient mesh background */}
        <style>{`
          @keyframes blob1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(30px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(20px, 40px) scale(1.05); }
          }
          @keyframes blob2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(-40px, 30px) scale(1.15); }
            50% { transform: translate(30px, -30px) scale(0.95); }
            75% { transform: translate(-20px, -40px) scale(1.1); }
          }
          @keyframes blob3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(40px, 30px) scale(1.08); }
            66% { transform: translate(-30px, -20px) scale(0.92); }
          }
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) rotate(-6deg); }
            25% { transform: translate(10px, -20px) rotate(-2deg); }
            50% { transform: translate(-5px, -35px) rotate(-8deg); }
            75% { transform: translate(15px, -15px) rotate(-4deg); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) rotate(4deg); }
            25% { transform: translate(-15px, -25px) rotate(8deg); }
            50% { transform: translate(10px, -10px) rotate(2deg); }
            75% { transform: translate(-10px, -30px) rotate(6deg); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) rotate(-3deg); }
            33% { transform: translate(20px, -15px) rotate(2deg); }
            66% { transform: translate(-15px, -28px) rotate(-6deg); }
          }
          @keyframes float4 {
            0%, 100% { transform: translate(0, 0) rotate(6deg); }
            25% { transform: translate(-20px, -10px) rotate(2deg); }
            50% { transform: translate(15px, -30px) rotate(8deg); }
            75% { transform: translate(-5px, -20px) rotate(4deg); }
          }
          @keyframes typing {
            from { width: 0; }
            to { width: 100%; }
          }
          @keyframes blink {
            0%, 100% { border-color: transparent; }
            50% { border-color: rgba(139, 92, 246, 0.8); }
          }
          @keyframes ctaGlow {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
          .hero-typewriter {
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            border-right: 2px solid rgba(139, 92, 246, 0.8);
            animation: typing 3.5s steps(72, end) forwards, blink 0.75s step-end infinite;
            max-width: 100%;
          }
          @media (max-width: 768px) {
            .hero-typewriter {
              white-space: normal;
              overflow: visible;
              border-right: none;
              animation: none;
              width: auto !important;
            }
          }
        `}</style>

        {/* Gradient mesh blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
            style={{
              background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
              animation: 'blob1 20s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
            style={{
              background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
              animation: 'blob2 25s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] rounded-full opacity-10 blur-[110px]"
            style={{
              background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
              animation: 'blob3 22s ease-in-out infinite',
            }}
          />
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Floating sample image thumbnails */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {/* Thumbnail 1 — top left area */}
          <div
            className="absolute top-[15%] left-[8%] w-24 h-24 rounded-2xl shadow-2xl shadow-violet-500/20 border border-white/10 overflow-hidden"
            style={{ animation: 'float1 12s ease-in-out infinite' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500" />
          </div>
          {/* Thumbnail 2 — top right area */}
          <div
            className="absolute top-[12%] right-[10%] w-28 h-20 rounded-2xl shadow-2xl shadow-cyan-500/20 border border-white/10 overflow-hidden"
            style={{ animation: 'float2 14s ease-in-out infinite' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600" />
          </div>
          {/* Thumbnail 3 — bottom left area */}
          <div
            className="absolute bottom-[20%] left-[5%] w-20 h-28 rounded-2xl shadow-2xl shadow-pink-500/20 border border-white/10 overflow-hidden"
            style={{ animation: 'float3 16s ease-in-out infinite' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400" />
          </div>
          {/* Thumbnail 4 — bottom right area */}
          <div
            className="absolute bottom-[18%] right-[7%] w-24 h-24 rounded-2xl shadow-2xl shadow-violet-500/20 border border-white/10 overflow-hidden"
            style={{ animation: 'float4 13s ease-in-out infinite' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400" />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative max-w-6xl mx-auto px-4 py-28 md:py-40 text-center z-10">
          <Badge variant="default" className="mb-6 gradient-primary text-white px-4 py-1.5 shadow-lg shadow-violet-500/20">
            <Sparkles className="h-3 w-3 mr-1.5" />
            54+ AI Models Available
          </Badge>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
            Create Anything with
            <span className="gradient-text block mt-2">AI Generation</span>
          </h1>
          <div className="max-w-2xl mx-auto mb-12">
            <p className="hero-typewriter text-base md:text-lg text-gray-400 leading-relaxed">
              Generate stunning images, videos, and lifelike speech using the world&apos;s most powerful AI models.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="relative group">
              {/* Glow pulse behind CTA */}
              <div
                className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-primary-500 to-cyan-500 blur-lg"
                style={{ animation: 'ctaGlow 3s ease-in-out infinite' }}
              />
              <Button size="lg" className="relative px-8 text-base">
                Start Creating Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary" size="lg" className="px-8 text-base">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-14">
            <div className="flex items-center gap-2.5 text-sm text-gray-400">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Cpu className="h-4 w-4 text-violet-400" />
              </div>
              <span className="font-medium">54 AI Models</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-400">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Wrench className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="font-medium">8 Creative Tools</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-400">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <Monitor className="h-4 w-4 text-pink-400" />
              </div>
              <span className="font-medium">HD &amp; 4K Output</span>
            </div>
          </div>

          {/* Existing sub-badges */}
          <div className="flex items-center justify-center gap-8 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary-400" /> Free daily credits</div>
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary-400" /> No credit card required</div>
          </div>
        </div>
      </section>

      {/* Featured Gallery */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4 gradient-primary text-white px-3 py-1">
              <Star className="h-3 w-3 mr-1.5" />
              Community Highlights
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Top Inspiration Gallery</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Explore what creators are building with Tynkerlab.ai. Click any inspiration to copy and try it yourself.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.slice(0, 8).map((prompt) => (
              <div
                key={prompt.id}
                className="group relative rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5"
              >
                <div className="aspect-square bg-nyx-bg relative overflow-hidden">
                  {prompt.preview_image_url ? (
                    prompt.model_type === 'video' ? (
                      <video src={prompt.preview_image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted autoPlay loop playsInline />
                    ) : (
                      <img src={prompt.preview_image_url} alt={prompt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {prompt.model_type === 'video' ? <Video className="h-8 w-8 text-gray-700" /> : <ImageIcon className="h-8 w-8 text-gray-700" />}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <p className="text-xs text-gray-200 line-clamp-3 mb-2">{prompt.prompt_text}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyPrompt(prompt.id, prompt.prompt_text) }}
                      className="inline-flex items-center gap-1 text-[10px] text-primary-300 hover:text-primary-200 font-medium"
                    >
                      <Copy className="h-3 w-3" />
                      {copied === prompt.id ? 'Copied!' : 'Copy Prompt'}
                    </button>
                  </div>
                  {/* Type badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant={prompt.model_type === 'video' ? 'info' : 'default'} className="text-[9px]">
                      {prompt.model_type}
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-white truncate">{prompt.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{prompt.category}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/prompts">
              <Button variant="secondary" size="sm">
                View All Inspirations <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Feature Tools */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Eight Powerful Tools</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Everything you need to bring your creative vision to life</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {TOOLS.map(({ key, Icon, title, desc, href }) => {
            const toolData = toolImages[key]
            const hasImage = !!toolData?.imageUrl
            const isBeforeAfter = (key === 'image-to-image' || key === 'image-to-video') && toolData?.imageUrl && toolData?.imageUrlAfter
            const studioHref = toolData?.prompt
              ? `${href}?prompt=${encodeURIComponent(toolData.prompt)}`
              : href

            return (
              <Link key={title} href={hasImage ? studioHref : href}>
                <div className="group relative h-full rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1">
                  {/* Background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-primary-500/0 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {hasImage ? (
                    <>
                      <div className="relative">
                        {isBeforeAfter ? (
                          <div className="aspect-square relative overflow-hidden">
                            <div className="absolute inset-0 grid grid-cols-2">
                              <img src={toolData.imageUrl} alt={key === 'image-to-video' ? 'Source' : 'Before'} className="w-full h-full object-cover" />
                              {key === 'image-to-video' ? (
                                <video src={toolData.imageUrlAfter!} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                              ) : (
                                <img src={toolData.imageUrlAfter!} alt="After" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
                            <div className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider bg-black/60 text-white px-1.5 py-0.5 rounded">{key === 'image-to-video' ? 'Image' : 'Before'}</div>
                            <div className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider bg-black/60 text-primary-300 px-1.5 py-0.5 rounded">{key === 'image-to-video' ? 'Video' : 'After'}</div>
                          </div>
                        ) : (
                          <div className="aspect-square relative overflow-hidden">
                            {key.includes('video') ? (
                              <video
                                src={toolData!.imageUrl}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                muted autoPlay loop playsInline
                              />
                            ) : (
                              <img
                                src={toolData!.imageUrl}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            )}
                          </div>
                        )}
                        {/* Always-visible gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-nyx-surface via-transparent to-transparent" />
                        {/* Hover overlay with prompt */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          {toolData?.prompt && (
                            <p className="text-[11px] text-gray-200 line-clamp-3 mb-1.5 leading-relaxed italic">&ldquo;{toolData.prompt}&rdquo;</p>
                          )}
                          <span className="inline-flex items-center gap-1 text-[10px] text-primary-300 font-medium">
                            <ArrowRight className="h-3 w-3" /> Try in Studio
                          </span>
                        </div>
                      </div>
                      <div className="relative p-3 text-center">
                        <h3 className="text-sm font-semibold text-white mb-0.5">{title}</h3>
                        <p className="text-[11px] text-gray-500 line-clamp-2">{desc}</p>
                      </div>
                    </>
                  ) : (
                    <div className="relative p-5 md:p-6 flex flex-col items-center text-center">
                      {/* Icon with animated ring */}
                      <div className="relative mb-4">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/10 group-hover:border-primary-500/30 flex items-center justify-center transition-all duration-300">
                          <Icon size={30} />
                        </div>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold text-white mb-1.5">{title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{desc}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary-400 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                        Get Started <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Supported Models & Features */}
      <SupportedModelsSection />

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">Three simple steps to create AI-generated content</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="text-5xl font-bold gradient-text mb-4">{num}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for Every Creator</h2>
          <p className="text-gray-400">Whatever you&apos;re building, Tynkerlab.ai has you covered</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {USE_CASES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 rounded-xl border border-nyx-border bg-nyx-surface hover:border-primary-500/20 transition-colors">
              <Icon className="h-6 w-6 text-primary-400 mb-3" />
              <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by Creators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, rating }) => (
              <Card key={name}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-300 mb-4">&ldquo;{text}&rdquo;</p>
                  <div>
                    <p className="text-sm font-medium text-white">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Creating Today</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Start creating for free with daily credits. No credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="px-8">
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost" size="lg">
              See All Plans
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
