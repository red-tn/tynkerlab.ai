'use client'

import { create } from 'zustand'
import { ICON_SETS, type IconSet } from '@/lib/brand'

interface BrandStore {
  activeSetId: string
  setActiveSet: (id: string) => void
  getIcons: () => IconSet
}

export const useBrand = create<BrandStore>((set, get) => ({
  activeSetId: 'default',
  setActiveSet: (id: string) => {
    if (ICON_SETS[id]) {
      set({ activeSetId: id })
    }
  },
  getIcons: () => ICON_SETS[get().activeSetId] || ICON_SETS['default'],
}))
