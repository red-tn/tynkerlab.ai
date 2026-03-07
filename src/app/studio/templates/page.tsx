'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Template, TemplateCategory } from '@/types/database'
import { TEMPLATE_CATEGORIES } from '@/lib/templates'
import { TemplateCard } from '@/components/studio/template-card'
import { Loader2, LayoutTemplate } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

// ---------------------------------------------------------------------------
// Category color dots (matches template-card.tsx color coding)
// ---------------------------------------------------------------------------
const CATEGORY_DOT_COLORS: Record<string, string> = {
  product: 'bg-violet-400',
  beauty: 'bg-pink-400',
  lifestyle: 'bg-amber-400',
  social: 'bg-cyan-400',
  ugc: 'bg-emerald-400',
}

const CATEGORY_ACTIVE_STYLES: Record<string, string> = {
  product: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  beauty: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  lifestyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  social: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  ugc: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
}

export default function TemplatesGalleryPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true)
      try {
        const url = category === 'all' ? '/api/templates' : `/api/templates?category=${category}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setTemplates(data.templates || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [category])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/10 border border-primary-500/20">
            <LayoutTemplate className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Templates</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Pre-built AI workflows for instant social media content. Pick a template, upload your photos, and generate.
            </p>
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
            category === 'all'
              ? 'bg-white/10 text-white border-white/20 shadow-sm'
              : 'bg-white/[0.03] text-gray-400 border-nyx-border hover:text-white hover:border-nyx-border-bright hover:bg-white/5'
          }`}
        >
          All
        </button>
        {TEMPLATE_CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              category === c.value
                ? CATEGORY_ACTIVE_STYLES[c.value] || 'bg-primary-500/20 text-primary-300 border-primary-500/40'
                : 'bg-white/[0.03] text-gray-400 border-nyx-border hover:text-white hover:border-nyx-border-bright hover:bg-white/5'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT_COLORS[c.value] || 'bg-gray-400'} ${
              category === c.value ? 'opacity-100' : 'opacity-60'
            }`} />
            {c.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse" />
            <Loader2 className="h-8 w-8 text-primary-400 animate-spin relative" />
          </div>
          <p className="text-sm text-gray-500 mt-4">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates found"
          description={
            category === 'all'
              ? 'No templates are available yet. Check back soon for new pre-built AI workflows.'
              : `No templates in the "${category}" category yet. Try selecting a different category or browse all templates.`
          }
          actionLabel={category !== 'all' ? 'View all templates' : undefined}
          onAction={category !== 'all' ? () => setCategory('all') : undefined}
          variant="default"
        />
      ) : (
        /* Template grid - masonry with staggered animation */
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {templates.map((t, i) => (
            <TemplateCard
              key={t.id}
              template={t}
              index={i}
              onClick={() => router.push(`/studio/templates/${t.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
