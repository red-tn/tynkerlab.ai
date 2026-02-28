'use client'
import { create } from 'zustand'

interface ActiveGeneration {
  id: string           // generationId from server
  jobId: string        // Together.ai job ID
  type: 'image' | 'video'
  model: string
  prompt: string
  startedAt: number
  userId: string
}

interface GenerationStore {
  activeGenerations: ActiveGeneration[]
  addGeneration: (gen: ActiveGeneration) => void
  removeGeneration: (id: string) => void
  getActiveGeneration: (id: string) => ActiveGeneration | undefined
}

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  activeGenerations: [],
  addGeneration: (gen) => set(state => ({ activeGenerations: [...state.activeGenerations, gen] })),
  removeGeneration: (id) => set(state => ({ activeGenerations: state.activeGenerations.filter(g => g.id !== id) })),
  getActiveGeneration: (id) => get().activeGenerations.find(g => g.id === id),
}))
