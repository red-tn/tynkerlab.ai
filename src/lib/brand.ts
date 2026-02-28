'use client'

import type { ComponentType } from 'react'

import { Logo } from '@/components/brand/logo'
import { LogoFull } from '@/components/brand/logo-full'
import {
  TextToImageIcon,
  ImageToImageIcon,
  TextToVideoIcon,
  ImageToVideoIcon,
  TextToSpeechIcon,
} from '@/components/brand/studio-icons'

import {
  SteampunkLogo,
  SteampunkLogoFull,
  SteampunkTextToImageIcon,
  SteampunkImageToImageIcon,
  SteampunkTextToVideoIcon,
  SteampunkImageToVideoIcon,
  SteampunkTextToSpeechIcon,
} from '@/components/brand/icon-sets'

export interface IconSet {
  id: string
  name: string
  description: string
  Logo: ComponentType<{ size?: number; className?: string }>
  LogoFull: ComponentType<{ size?: number; className?: string; showTagline?: boolean }>
  TextToImageIcon: ComponentType<{ size?: number; className?: string }>
  ImageToImageIcon: ComponentType<{ size?: number; className?: string }>
  TextToVideoIcon: ComponentType<{ size?: number; className?: string }>
  ImageToVideoIcon: ComponentType<{ size?: number; className?: string }>
  TextToSpeechIcon: ComponentType<{ size?: number; className?: string }>
}

export const ICON_SETS: Record<string, IconSet> = {
  default: {
    id: 'default',
    name: 'Neon Minimal',
    description: 'Clean gradient icons with a modern feel',
    Logo,
    LogoFull,
    TextToImageIcon,
    ImageToImageIcon,
    TextToVideoIcon,
    ImageToVideoIcon,
    TextToSpeechIcon,
  },
  'steampunk-cyber': {
    id: 'steampunk-cyber',
    name: 'Steampunk Cyber',
    description: 'Victorian brass meets neon circuitry',
    Logo: SteampunkLogo,
    LogoFull: SteampunkLogoFull,
    TextToImageIcon: SteampunkTextToImageIcon,
    ImageToImageIcon: SteampunkImageToImageIcon,
    TextToVideoIcon: SteampunkTextToVideoIcon,
    ImageToVideoIcon: SteampunkImageToVideoIcon,
    TextToSpeechIcon: SteampunkTextToSpeechIcon,
  },
}

export function getIconSet(id: string): IconSet {
  return ICON_SETS[id] || ICON_SETS['default']
}

export function getAvailableIconSets(): IconSet[] {
  return Object.values(ICON_SETS)
}
