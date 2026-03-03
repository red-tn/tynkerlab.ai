'use client'

import { create } from 'zustand'
import { ICON_SETS, type IconSet } from '@/lib/brand'

interface BrandStore {
  activeSetId: string
  _initialized: boolean
  setActiveSet: (id: string) => void
  getIcons: () => IconSet
  init: () => Promise<void>
}

export const useBrand = create<BrandStore>((set, get) => ({
  activeSetId: 'default',
  _initialized: false,
  setActiveSet: (id: string) => {
    if (ICON_SETS[id]) {
      set({ activeSetId: id })
    }
  },
  getIcons: () => ICON_SETS[get().activeSetId] || ICON_SETS['default'],
  init: async () => {
    if (get()._initialized) return
    set({ _initialized: true })
    try {
      const res = await fetch('/api/settings?key=active_icon_set')
      if (res.ok) {
        const data = await res.json()
        if (data.value && ICON_SETS[data.value]) {
          set({ activeSetId: data.value })
        }
      }
    } catch {
      // Silently fall back to default
    }
  },
}))
