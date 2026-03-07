'use client'

import { Badge } from '@/components/ui/badge'
import { Coins, ImageIcon, Film } from 'lucide-react'
import type { Template } from '@/types/database'
import { getModelById } from '@/lib/together/models'

interface TemplateCardProps {
  template: Template
  onClick?: () => void
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const modelData = getModelById(template.recommended_model)
  const credits = template.credits_override ?? modelData?.credits ?? 0

  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl border border-nyx-border bg-nyx-surface overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5 cursor-pointer break-inside-avoid mb-4"
    >
      {/* Preview image */}
      <div className="aspect-[4/3] bg-nyx-bg relative overflow-hidden">
        {template.preview_image_url ? (
          <img
            src={template.preview_image_url}
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-500/10 to-accent-500/5">
            {template.generation_type === 'video' ? (
              <Film className="h-10 w-10 text-gray-600" />
            ) : (
              <ImageIcon className="h-10 w-10 text-gray-600" />
            )}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge variant={template.generation_type === 'video' ? 'info' : 'default'} className="text-[10px]">
            {template.generation_type === 'video' ? 'Video' : 'Image'}
          </Badge>
          {template.is_featured && (
            <Badge className="text-[10px] gradient-primary text-white">Featured</Badge>
          )}
        </div>

        {/* Credit cost */}
        <div className="absolute bottom-2 right-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white">
            <Coins className="h-3 w-3 text-primary-400" />
            {credits}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate">{template.name}</h3>
        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>

        {/* Platform icons */}
        {template.platform_presets.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {template.platform_presets.map((p) => (
              <span key={p.platform} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                {p.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
