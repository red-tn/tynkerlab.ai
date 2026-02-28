import { create } from 'zustand'
import type { Models } from 'appwrite'
import type { Profile } from '@/types/database'

interface UserSlice {
  user: Models.User<Models.Preferences> | null
  profile: Profile | null
  setUser: (user: Models.User<Models.Preferences> | null) => void
  setProfile: (profile: Profile | null) => void
}

interface StudioSlice {
  selectedModel: string | null
  prompt: string
  negativePrompt: string
  aspectRatio: string
  width: number
  height: number
  steps: number | null
  seed: number | null
  setSelectedModel: (model: string | null) => void
  setPrompt: (prompt: string) => void
  setNegativePrompt: (prompt: string) => void
  setAspectRatio: (ratio: string) => void
  setDimensions: (width: number, height: number) => void
  setSteps: (steps: number | null) => void
  setSeed: (seed: number | null) => void
  resetStudio: () => void
}

interface UISlice {
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
}

type AppStore = UserSlice & StudioSlice & UISlice

export const useAppStore = create<AppStore>((set) => ({
  // User slice
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  // Studio slice
  selectedModel: null,
  prompt: '',
  negativePrompt: '',
  aspectRatio: '1:1',
  width: 1024,
  height: 1024,
  steps: null,
  seed: null,
  setSelectedModel: (model) => set({ selectedModel: model }),
  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (prompt) => set({ negativePrompt: prompt }),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setDimensions: (width, height) => set({ width, height }),
  setSteps: (steps) => set({ steps }),
  setSeed: (seed) => set({ seed }),
  resetStudio: () => set({
    selectedModel: null,
    prompt: '',
    negativePrompt: '',
    aspectRatio: '1:1',
    width: 1024,
    height: 1024,
    steps: null,
    seed: null,
  }),

  // UI slice
  sidebarOpen: true,
  mobileMenuOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}))
