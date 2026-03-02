'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { Shuffle } from 'lucide-react'

interface SeedInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function SeedInput({ value, onChange, disabled }: SeedInputProps) {
  const handleRandomize = () => {
    onChange(String(Math.floor(Math.random() * 2147483647)))
  }

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
        Seed
        <InfoTooltip text="Use a seed for reproducible results. Same seed + prompt = same video. Leave empty for random." />
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Random"
          min={0}
          max={2147483647}
          disabled={disabled}
          className={cn(
            'flex-1 rounded-lg bg-nyx-surface border border-nyx-border px-3 py-2 text-sm text-white',
            'placeholder:text-gray-600 font-mono',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
            'disabled:opacity-50'
          )}
        />
        <button
          type="button"
          onClick={handleRandomize}
          disabled={disabled}
          title="Generate random seed"
          className={cn(
            'px-3 py-2 rounded-lg border border-nyx-border bg-nyx-surface text-gray-400',
            'hover:border-nyx-borderBright hover:text-gray-300 transition-all',
            'disabled:opacity-50'
          )}
        >
          <Shuffle className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
