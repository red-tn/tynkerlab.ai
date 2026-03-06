'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Template } from '@/types/database'
import { TEMPLATE_CATEGORIES } from '@/lib/templates'
import { TemplateCard } from '@/components/studio/template-card'
import { Loader2, LayoutTemplate } from 'lucide-react'

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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <LayoutTemplate className="h-6 w-6 text-primary-400" />
          <h1 className="text-2xl font-bold text-white">Templates</h1>
        </div>
        <p className="text-sm text-gray-400 mt-1">Pre-built AI workflows for instant social media content. Pick a template, upload your photos, and generate.</p>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            category === 'all'
              ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
              : 'bg-white/5 text-gray-400 border border-nyx-border hover:text-white'
          }`}
        >
          All
        </button>
        {TEMPLATE_CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              category === c.value
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                : 'bg-white/5 text-gray-400 border border-nyx-border hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Template grid - masonry */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <LayoutTemplate className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p>No templates available yet.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {templates.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onClick={() => router.push(`/studio/templates/${t.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
