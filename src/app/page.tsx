'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TextToImageIcon, ImageToImageIcon, TextToVideoIcon, ImageToVideoIcon, TextToSpeechIcon } from '@/components/brand/studio-icons'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Sparkles, Zap, Shield, ArrowRight, Star, Palette, Film, Wand2, Layers, Globe, Heart, Code, ImageIcon, Video, Copy, Volume2 } from 'lucide-react'
import type { Prompt } from '@/types/database'

const TOOLS = [
  { key: 'text-to-image', Icon: TextToImageIcon, title: 'Text to Image', desc: 'Generate stunning images from text descriptions', href: '/studio/text-to-image' },
  { key: 'image-to-image', Icon: ImageToImageIcon, title: 'Image to Image', desc: 'Transform and enhance existing images with AI', href: '/studio/image-to-image' },
  { key: 'text-to-video', Icon: TextToVideoIcon, title: 'Text to Video', desc: 'Create cinematic videos from text prompts', href: '/studio/text-to-video' },
  { key: 'image-to-video', Icon: ImageToVideoIcon, title: 'Image to Video', desc: 'Animate still images into dynamic videos', href: '/studio/image-to-video' },
  { key: 'text-to-speech', Icon: TextToSpeechIcon, title: 'Text to Speech', desc: 'Convert text to natural-sounding AI voices', href: '/studio/text-to-speech' },
]

interface ToolImageData {
  key: string
  imageUrl: string
  imageUrlAfter?: string
  prompt: string
}

const STEPS = [
  { num: '01', title: 'Choose Your Tool', desc: 'Select from text-to-image, image-to-image, text-to-video, or image-to-video.' },
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

    fetch('/api/admin/settings?key=homepage_tools')
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 text-center">
          <Badge variant="default" className="mb-6 gradient-primary text-white px-4 py-1.5">
            <Sparkles className="h-3 w-3 mr-1.5" />
            54 AI Models Available
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Create Anything with
            <span className="gradient-text block">AI Generation</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Generate stunning images, videos, and lifelike speech using the world&apos;s most powerful AI models.
            From Google Imagen to FLUX, Sora to Kling — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="px-8 text-base">
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
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary-400" /> 50 free credits</div>
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
                key={prompt.$id}
                className="group relative rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5"
              >
                <div className="aspect-square bg-nyx-bg relative overflow-hidden">
                  {prompt.previewImageUrl ? (
                    prompt.modelType === 'video' ? (
                      <video src={prompt.previewImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted autoPlay loop playsInline />
                    ) : (
                      <img src={prompt.previewImageUrl} alt={prompt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {prompt.modelType === 'video' ? <Video className="h-8 w-8 text-gray-700" /> : <ImageIcon className="h-8 w-8 text-gray-700" />}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <p className="text-xs text-gray-200 line-clamp-3 mb-2">{prompt.promptText}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyPrompt(prompt.$id, prompt.promptText) }}
                      className="inline-flex items-center gap-1 text-[10px] text-primary-300 hover:text-primary-200 font-medium"
                    >
                      <Copy className="h-3 w-3" />
                      {copied === prompt.$id ? 'Copied!' : 'Copy Prompt'}
                    </button>
                  </div>
                  {/* Type badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant={prompt.modelType === 'video' ? 'info' : 'default'} className="text-[9px]">
                      {prompt.modelType}
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Five Powerful Tools</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Everything you need to bring your creative vision to life</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {TOOLS.map(({ key, Icon, title, desc, href }) => {
            const toolData = toolImages[key]
            const hasImage = !!toolData?.imageUrl
            const isBeforeAfter = key === 'image-to-image' && toolData?.imageUrl && toolData?.imageUrlAfter
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
                              <img src={toolData.imageUrl} alt="Before" className="w-full h-full object-cover" />
                              <img src={toolData.imageUrlAfter!} alt="After" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
                            <div className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider bg-black/60 text-white px-1.5 py-0.5 rounded">Before</div>
                            <div className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider bg-black/60 text-primary-300 px-1.5 py-0.5 rounded">After</div>
                          </div>
                        ) : (
                          <div className="aspect-square relative overflow-hidden">
                            <img
                              src={toolData!.imageUrl}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
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
          Get 50 free credits when you sign up. No credit card required.
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
