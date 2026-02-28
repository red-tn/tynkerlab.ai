'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Search, Coins } from 'lucide-react'
import type { ModelCapability, ModelCategory } from '@/lib/together/models'
import { getModelsForCapability } from '@/lib/together/models'
import { ModelCategoryIcon } from '@/components/studio/model-icons'
import { InfoTooltip } from '@/components/ui/info-tooltip'

interface ModelSelectorProps {
  capability: ModelCapability
  selectedModel: string | null
  onModelSelect: (modelId: string) => void
  disabled?: boolean
}

const categoryOrder: ModelCategory[] = [
  'google', 'flux', 'bytedance', 'qwen', 'wan', 'ideogram',
  'hidream', 'rundiffusion', 'stability', 'lykon',
  'openai', 'minimax', 'kling', 'pixverse', 'vidu',
]

export function ModelSelector({ capability, selectedModel, onModelSelect, disabled }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const models = getModelsForCapability(capability).filter(m => m.enabled)
  const selectedModelData = models.find(m => m.id === selectedModel)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = search
    ? models.filter(m =>
        m.displayName.toLowerCase().includes(search.toLowerCase()) ||
        m.categoryLabel.toLowerCase().includes(search.toLowerCase()))
    : models

  const grouped = categoryOrder
    .map(cat => ({
      category: cat,
      label: models.find(m => m.category === cat)?.categoryLabel || cat,
      models: filtered.filter(m => m.category === cat),
    }))
    .filter(g => g.models.length > 0)

  return (
    <div ref={ref} className="relative space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
        AI Model
        <InfoTooltip text="Choose which AI model generates your content. Different models have different styles, speeds, and credit costs." />
      </label>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2.5 text-sm text-left',
          'hover:border-nyx-borderBright transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          open && 'ring-2 ring-primary-500/50 border-primary-500'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedModelData ? (
            <>
              <ModelCategoryIcon category={selectedModelData.category} className="h-4 w-4 shrink-0" />
              <span className="text-white truncate">{selectedModelData.displayName}</span>
              <div className="flex items-center gap-1 shrink-0">
                <Coins className="h-3 w-3 text-primary-400" />
                <span className="text-xs text-primary-400">{selectedModelData.credits}</span>
              </div>
              {selectedModelData.badge && <Badge variant="default" className="text-[10px] shrink-0">{selectedModelData.badge}</Badge>}
            </>
          ) : (
            <span className="text-gray-500">Select a model...</span>
          )}
        </div>
        <ChevronDown className={cn('h-4 w-4 text-gray-500 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-lg bg-nyx-surface border border-nyx-border shadow-xl max-h-80 overflow-hidden animate-slide-down">
          <div className="p-2 border-b border-nyx-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-nyx-bg border border-nyx-border text-sm text-white placeholder:text-gray-600 focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-64">
            {grouped.map((group) => (
              <div key={group.category}>
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-nyx-bg/50 sticky top-0 flex items-center gap-2">
                  <ModelCategoryIcon category={group.category} className="h-3.5 w-3.5" />
                  {group.label}
                </div>
                {group.models.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => { onModelSelect(model.id); setOpen(false); setSearch('') }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between gap-2',
                      model.id === selectedModel ? 'bg-primary-500/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <ModelCategoryIcon category={model.category} className="h-4 w-4 shrink-0" />
                        <span className="truncate">{model.displayName}</span>
                        {model.badge && <Badge variant="default" className="text-[10px]">{model.badge}</Badge>}
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-0.5">{model.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Coins className="h-3 w-3 text-primary-400" />
                      <span className="text-xs text-primary-400 font-mono">{model.credits}</span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
            {grouped.length === 0 && <p className="px-3 py-4 text-sm text-gray-500 text-center">No models found</p>}
          </div>
        </div>
      )}
    </div>
  )
}
