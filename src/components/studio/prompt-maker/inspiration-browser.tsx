'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Search, ImageIcon, Video, Sparkles } from 'lucide-react'
import type { Prompt } from '@/types/database'

interface InspirationBrowserProps {
  onSelect: (prompt: Prompt) => void
}

const TYPE_FILTERS = ['All', 'Image', 'Video'] as const

export function InspirationBrowser({ onSelect }: InspirationBrowserProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<typeof TYPE_FILTERS[number]>('All')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true)
      let query = supabase
        .from('prompts')
        .select('*')
        .eq('is_published', true)
        .order('usage_count', { ascending: false })
        .limit(12)

      if (typeFilter !== 'All') {
        query = query.eq('model_type', typeFilter.toLowerCase())
      }

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`)
      }

      const { data } = await query
      setPrompts(data || [])
      setLoading(false)
    }

    fetchPrompts()
  }, [typeFilter, search])

  return (
    <div className="space-y-3">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
      >
        <Sparkles className="h-4 w-4 text-primary-400" />
        Inspiration Browser
        <span className="text-xs text-gray-500">({collapsed ? 'show' : 'hide'})</span>
      </button>

      {!collapsed && (
        <div className="space-y-3 animate-slide-down">
          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search inspirations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-nyx-surface border border-nyx-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <div className="flex gap-1">
              {TYPE_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTypeFilter(filter)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    typeFilter === filter
                      ? 'bg-primary-500/15 text-primary-300 border border-primary-500/30'
                      : 'bg-nyx-surface border border-nyx-border text-gray-400 hover:text-white'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-nyx-surface animate-pulse" />
              ))}
            </div>
          ) : prompts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No inspirations found</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => onSelect(prompt)}
                  className="group relative aspect-square rounded-lg border border-nyx-border bg-nyx-surface overflow-hidden hover:border-primary-500/30 transition-all text-left"
                >
                  {prompt.preview_image_url ? (
                    <img
                      src={prompt.preview_image_url}
                      alt={prompt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {prompt.model_type === 'video' ? (
                        <Video className="h-6 w-6 text-gray-700" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-700" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
                    <p className="text-[10px] text-white font-medium truncate">{prompt.title}</p>
                    <div className="flex gap-1 mt-0.5">
                      {prompt.category && (
                        <Badge variant="default" className="text-[8px] px-1 py-0">{prompt.category}</Badge>
                      )}
                      <Badge variant={prompt.model_type === 'video' ? 'info' : 'default'} className="text-[8px] px-1 py-0">
                        {prompt.model_type}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
