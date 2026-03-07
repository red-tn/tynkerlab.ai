'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Coins, ImageIcon, Film, Sparkles, Monitor, Smartphone, ArrowRight } from 'lucide-react'
import type { Template, TemplateCategory } from '@/types/database'
import { getModelById } from '@/lib/together/models'

// ---------------------------------------------------------------------------
// Category color map
// ---------------------------------------------------------------------------
const CATEGORY_COLORS: Record<TemplateCategory, {
  dot: string
  border: string
  bg: string
  text: string
  badgeBg: string
  glowHover: string
}> = {
  product: {
    dot: 'bg-violet-400',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/5',
    text: 'text-violet-300',
    badgeBg: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    glowHover: 'hover:border-violet-500/40 hover:shadow-violet-500/10',
  },
  beauty: {
    dot: 'bg-pink-400',
    border: 'border-pink-500/20',
    bg: 'bg-pink-500/5',
    text: 'text-pink-300',
    badgeBg: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
    glowHover: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
  },
  lifestyle: {
    dot: 'bg-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    text: 'text-amber-300',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    glowHover: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
  },
  social: {
    dot: 'bg-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    glowHover: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
  },
  ugc: {
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    glowHover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
  },
}

// ---------------------------------------------------------------------------
// Platform icon helper
// ---------------------------------------------------------------------------
function PlatformIcon({ platform }: { platform: string }) {
  if (platform.startsWith('instagram') || platform === 'tiktok') {
    return <Smartphone className="h-2.5 w-2.5" />
  }
  return <Monitor className="h-2.5 w-2.5" />
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface TemplateCardProps {
  template: Template
  onClick?: () => void
  index?: number
}

export function TemplateCard({ template, onClick, index = 0 }: TemplateCardProps) {
  const modelData = getModelById(template.recommended_model)
  const credits = template.credits_override ?? modelData?.credits ?? 0
  const colors = CATEGORY_COLORS[template.category] ?? CATEGORY_COLORS.product

  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`
        group relative rounded-xl overflow-hidden cursor-pointer break-inside-avoid mb-4
        animate-card-in
        bg-white/[0.03] backdrop-blur-md
        border transition-all duration-300
        ${template.is_featured
          ? 'featured-border-glow border-transparent'
          : `${colors.border} ${colors.glowHover}`
        }
        hover:shadow-lg hover:-translate-y-0.5
      `}
    >
      {/* Preview image area */}
      <div className="aspect-[4/3] bg-nyx-bg relative overflow-hidden">
        {template.preview_image_url ? (
          <img
            src={template.preview_image_url}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className={`flex items-center justify-center h-full bg-gradient-to-br from-white/[0.03] to-transparent ${colors.bg}`}>
            {template.generation_type === 'video' ? (
              <Film className={`h-10 w-10 ${colors.text} opacity-40`} />
            ) : (
              <ImageIcon className={`h-10 w-10 ${colors.text} opacity-40`} />
            )}
          </div>
        )}

        {/* Gradient overlay that intensifies on hover to reveal info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge
            variant={template.generation_type === 'video' ? 'info' : 'default'}
            className="text-[10px] backdrop-blur-sm bg-black/40"
          >
            {template.generation_type === 'video' ? (
              <><Film className="h-2.5 w-2.5 mr-0.5" /> Video</>
            ) : (
              <><ImageIcon className="h-2.5 w-2.5 mr-0.5" /> Image</>
            )}
          </Badge>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border backdrop-blur-sm bg-black/40 ${colors.badgeBg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
          </span>
        </div>

        {/* Featured sparkle indicator (top-right) */}
        {template.is_featured && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30">
              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
              <span className="text-[10px] font-medium text-amber-300">Featured</span>
            </div>
          </div>
        )}

        {/* Credit cost pill */}
        <div className="absolute bottom-2 right-2 z-10">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white border border-white/10">
            <Coins className="h-3 w-3 text-primary-400" />
            {credits}
          </div>
        </div>

        {/* Hover slide-up details overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
          {/* Model name */}
          {modelData && (
            <p className="text-[10px] text-gray-300 font-medium mb-1.5 truncate">
              {modelData.displayName}
            </p>
          )}

          {/* Platform pills */}
          {template.platform_presets.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {template.platform_presets.map((p) => (
                <span
                  key={p.platform}
                  className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-gray-200 border border-white/10"
                >
                  <PlatformIcon platform={p.platform} />
                  {p.label}
                </span>
              ))}
            </div>
          )}

          {/* Use Template button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-[11px] bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 text-white"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            Use Template
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Info section */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
          {template.name}
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{template.description}</p>

        {/* Bottom row: model + platform count */}
        <div className="flex items-center justify-between mt-2">
          {modelData ? (
            <span className="text-[10px] text-gray-500 truncate max-w-[60%]">
              {modelData.displayName}
            </span>
          ) : (
            <span />
          )}
          {template.platform_presets.length > 0 && (
            <span className="text-[10px] text-gray-600">
              {template.platform_presets.length} platform{template.platform_presets.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
