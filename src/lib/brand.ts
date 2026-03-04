'use client'

import type { ComponentType } from 'react'

import {
  SteampunkLogo,
  SteampunkLogoFull,
  SteampunkTextToImageIcon,
  SteampunkImageToImageIcon,
  SteampunkTextToVideoIcon,
  SteampunkImageToVideoIcon,
  SteampunkUGCAvatarIcon,
  SteampunkPromptMakerIcon,
  SteampunkTextToSpeechIcon,
  SteampunkBlueLogo,
  SteampunkBlueLogoFull,
  SteampunkBlueTextToImageIcon,
  SteampunkBlueImageToImageIcon,
  SteampunkBlueTextToVideoIcon,
  SteampunkBlueImageToVideoIcon,
  SteampunkBlueUGCAvatarIcon,
  SteampunkBluePromptMakerIcon,
  SteampunkBlueTextToSpeechIcon,
} from '@/components/brand/icon-sets'

export interface ColorPalette {
  primary: Record<string, string>   // 50-900 scale
  accent: Record<string, string>    // 50-900 scale
  gradientFrom: string              // gradient start hex
  gradientTo: string                // gradient end hex
  glowPrimary: string               // "r, g, b" for rgba()
  glowAccent: string                // "r, g, b" for rgba()
  aurora: { main: string; left: string; right: string; spotlight: string }
  selectionBg: string               // rgba string
  ambientStars: string[]            // 6 hex colors
}

export interface IconSet {
  id: string
  name: string
  description: string
  colors: ColorPalette
  Logo: ComponentType<{ size?: number; className?: string }>
  LogoFull: ComponentType<{ size?: number; className?: string; showTagline?: boolean }>
  TextToImageIcon: ComponentType<{ size?: number; className?: string }>
  ImageToImageIcon: ComponentType<{ size?: number; className?: string }>
  TextToVideoIcon: ComponentType<{ size?: number; className?: string }>
  ImageToVideoIcon: ComponentType<{ size?: number; className?: string }>
  UGCAvatarIcon: ComponentType<{ size?: number; className?: string }>
  PromptMakerIcon: ComponentType<{ size?: number; className?: string }>
  TextToSpeechIcon: ComponentType<{ size?: number; className?: string }>
}

const AMBER_PALETTE: ColorPalette = {
  primary: {
    '50': '#fffbeb', '100': '#fef3c7', '200': '#fde68a', '300': '#fcd34d',
    '400': '#fbbf24', '500': '#f59e0b', '600': '#d97706', '700': '#b45309',
    '800': '#92400e', '900': '#78350f',
  },
  accent: {
    '50': '#ecfeff', '100': '#cffafe', '200': '#a5f3fc', '300': '#67e8f9',
    '400': '#22d3ee', '500': '#06b6d4', '600': '#0891b2', '700': '#0e7490',
    '800': '#155e75', '900': '#164e63',
  },
  gradientFrom: '#f59e0b',
  gradientTo: '#06b6d4',
  glowPrimary: '245, 158, 11',
  glowAccent: '6, 182, 212',
  aurora: {
    main: 'rgba(245, 158, 11, 0.06)',
    left: 'rgba(6, 182, 212, 0.045)',
    right: 'rgba(139, 92, 246, 0.04)',
    spotlight: 'rgba(245, 180, 60, 0.05)',
  },
  selectionBg: 'rgba(245, 158, 11, 0.3)',
  ambientStars: ['#f59e0b', '#d97706', '#06b6d4', '#8b5cf6', '#fbbf24', '#ec4899'],
}

const BLUE_PALETTE: ColorPalette = {
  primary: {
    '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd',
    '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8',
    '800': '#1e40af', '900': '#1e3a8a',
  },
  accent: {
    '50': '#f0f9ff', '100': '#e0f2fe', '200': '#bae6fd', '300': '#7dd3fc',
    '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7', '700': '#0369a1',
    '800': '#075985', '900': '#0c4a6e',
  },
  gradientFrom: '#3b82f6',
  gradientTo: '#38bdf8',
  glowPrimary: '59, 130, 246',
  glowAccent: '56, 189, 248',
  aurora: {
    main: 'rgba(59, 130, 246, 0.06)',
    left: 'rgba(56, 189, 248, 0.045)',
    right: 'rgba(139, 92, 246, 0.04)',
    spotlight: 'rgba(96, 165, 250, 0.05)',
  },
  selectionBg: 'rgba(59, 130, 246, 0.3)',
  ambientStars: ['#3b82f6', '#38bdf8', '#6366f1', '#8b5cf6', '#60a5fa', '#a78bfa'],
}

export const ICON_SETS: Record<string, IconSet> = {
  'steampunk-amber': {
    id: 'steampunk-amber',
    name: 'Steampunk Amber',
    description: 'Victorian brass meets neon circuitry — warm amber & cyan',
    colors: AMBER_PALETTE,
    Logo: SteampunkLogo,
    LogoFull: SteampunkLogoFull,
    TextToImageIcon: SteampunkTextToImageIcon,
    ImageToImageIcon: SteampunkImageToImageIcon,
    TextToVideoIcon: SteampunkTextToVideoIcon,
    ImageToVideoIcon: SteampunkImageToVideoIcon,
    UGCAvatarIcon: SteampunkUGCAvatarIcon,
    PromptMakerIcon: SteampunkPromptMakerIcon,
    TextToSpeechIcon: SteampunkTextToSpeechIcon,
  },
  'steampunk-blue': {
    id: 'steampunk-blue',
    name: 'Steampunk Blue',
    description: 'Blue-steel clockwork with sky-blue neon accents',
    colors: BLUE_PALETTE,
    Logo: SteampunkBlueLogo,
    LogoFull: SteampunkBlueLogoFull,
    TextToImageIcon: SteampunkBlueTextToImageIcon,
    ImageToImageIcon: SteampunkBlueImageToImageIcon,
    TextToVideoIcon: SteampunkBlueTextToVideoIcon,
    ImageToVideoIcon: SteampunkBlueImageToVideoIcon,
    UGCAvatarIcon: SteampunkBlueUGCAvatarIcon,
    PromptMakerIcon: SteampunkBluePromptMakerIcon,
    TextToSpeechIcon: SteampunkBlueTextToSpeechIcon,
  },
}

export function getIconSet(id: string): IconSet {
  return ICON_SETS[id] || ICON_SETS['steampunk-amber']
}

export function getAvailableIconSets(): IconSet[] {
  return Object.values(ICON_SETS)
}

/**
 * Applies a ColorPalette to the document root as CSS custom properties.
 * This makes Tailwind utilities like `bg-primary-500`, `text-accent-400`, etc.
 * dynamically resolve to the active brand palette.
 */
export function applyPaletteCssVars(palette: ColorPalette) {
  if (typeof document === 'undefined') return
  const s = document.documentElement.style

  // Primary & accent color scales
  for (const [shade, hex] of Object.entries(palette.primary)) {
    s.setProperty(`--color-primary-${shade}`, hex)
  }
  for (const [shade, hex] of Object.entries(palette.accent)) {
    s.setProperty(`--color-accent-${shade}`, hex)
  }

  // Gradients & glows
  s.setProperty('--gradient-from', palette.gradientFrom)
  s.setProperty('--gradient-to', palette.gradientTo)
  s.setProperty('--glow-primary', palette.glowPrimary)
  s.setProperty('--glow-accent', palette.glowAccent)

  // Aurora
  s.setProperty('--aurora-main', palette.aurora.main)
  s.setProperty('--aurora-left', palette.aurora.left)
  s.setProperty('--aurora-right', palette.aurora.right)
  s.setProperty('--aurora-spotlight', palette.aurora.spotlight)

  // Selection
  s.setProperty('--selection-bg', palette.selectionBg)
}
