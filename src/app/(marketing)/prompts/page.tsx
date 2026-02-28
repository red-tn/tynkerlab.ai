'use client'

import { useState, useEffect } from 'react'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/client'
import { Query } from 'appwrite'
import type { Prompt } from '@/types/database'
import { ALL_MODELS } from '@/lib/together/models'
import { ModelCategoryIcon } from '@/components/studio/model-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Search, Copy, ExternalLink, Check, Sparkles, Users, ImageIcon, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'Photography', 'Art', 'Anime', 'Fantasy', 'Sci-Fi', 'Nature', 'Portrait', 'Abstract']

function getModelInfo(modelId: string | null) {
  if (!modelId) return null
  return ALL_MODELS.find(m => m.id === modelId) ?? null
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'curated' | 'creators'>('curated')

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true)
      try {
        const queries = [
          Query.equal('isPublished', true),
          Query.orderDesc('usageCount'),
          Query.limit(50),
        ]
        if (category !== 'All') {
          queries.push(Query.equal('category', category.toLowerCase()))
        }
        if (search) {
          queries.push(Query.search('title', search))
        }

        const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROMPTS, queries)
        let docs = result.documents as unknown as Prompt[]

        if (tab === 'creators') {
          docs = docs.filter(p => p.submissionStatus === 'approved')
        } else {
          docs = docs.filter(p => !p.submissionStatus || p.submissionStatus === 'admin')
        }
        setPrompts(docs)
      } catch (err) {
        console.error('Failed to fetch prompts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPrompts()
  }, [category, search, tab])

  const handleCopy = (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.promptText)
    setCopiedId(prompt.$id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen relative z-[1]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Inspiration Gallery</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Browse curated inspirations from the community. Hover to see the prompt, click to copy and use in the Studio.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => { setTab('curated'); setCategory('All') }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === 'curated'
                ? 'bg-primary-500/10 text-white border border-primary-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Sparkles className="h-4 w-4" />
            Curated
          </button>
          <button
            onClick={() => { setTab('creators'); setCategory('All') }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === 'creators'
                ? 'bg-primary-500/10 text-white border border-primary-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Users className="h-4 w-4" />
            Community Creators
          </button>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inspirations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-nyx-surface border border-nyx-border text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                category === cat
                  ? 'bg-primary-500/10 text-white border border-primary-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          /* Skeleton loading — grid of square shimmer cards */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-nyx-surface overflow-hidden">
                <div className="aspect-square bg-nyx-bg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-nyx-bg rounded" />
                  <div className="h-3 w-1/2 bg-nyx-bg rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : prompts.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-nyx-surface mb-4">
              <ImageIcon className="h-8 w-8 text-gray-700" />
            </div>
            <p className="text-gray-400 text-lg font-medium mb-1">No inspirations found</p>
            <p className="text-gray-600 text-sm">Try a different search or category.</p>
          </div>
        ) : (
          /* Image-first gallery grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {prompts.map((prompt) => {
              const model = getModelInfo(prompt.modelUsed)
              return (
                <div
                  key={prompt.$id}
                  className="group relative rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5"
                >
                  {/* Image area */}
                  <div className="aspect-square bg-nyx-bg relative overflow-hidden">
                    {prompt.previewImageUrl ? (
                      prompt.modelType === 'video' ? (
                        <video
                          src={prompt.previewImageUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          muted autoPlay loop playsInline
                        />
                      ) : (
                        <img
                          src={prompt.previewImageUrl}
                          alt={prompt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {prompt.modelType === 'video'
                          ? <Video className="h-10 w-10 text-gray-700" />
                          : <ImageIcon className="h-10 w-10 text-gray-700" />
                        }
                      </div>
                    )}

                    {/* Type badge (top right) */}
                    <div className="absolute top-2 right-2">
                      <Badge variant={prompt.modelType === 'video' ? 'info' : 'default'} className="text-[9px] backdrop-blur-sm">
                        {prompt.modelType}
                      </Badge>
                    </div>

                    {/* Hover overlay with prompt text + copy */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <p className="text-xs text-gray-200 line-clamp-4 mb-3 leading-relaxed">{prompt.promptText}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopy(prompt) }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-medium text-white backdrop-blur-sm transition-colors"
                        >
                          {copiedId === prompt.$id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedId === prompt.$id ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const type = prompt.modelType === 'video' ? 'text-to-video' : 'text-to-image'
                            window.location.href = `/studio/${type}?prompt=${encodeURIComponent(prompt.promptText)}`
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary-500/20 hover:bg-primary-500/30 text-[11px] font-medium text-primary-300 backdrop-blur-sm transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Use in Studio
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card info below image */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white truncate">{prompt.title}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <Badge variant="outline" className="text-[9px]">{prompt.category}</Badge>
                      {model && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                          <ModelCategoryIcon category={model.category} className="h-3 w-3" />
                          {model.displayName}
                        </span>
                      )}
                    </div>
                    {tab === 'creators' && prompt.submitterName && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge variant="outline" className="text-[9px] border-accent-500/30 text-accent-400">Creator</Badge>
                        <span className="text-xs text-gray-400">{prompt.submitterName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
