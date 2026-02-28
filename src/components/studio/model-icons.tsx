import type { ModelCategory } from '@/lib/together/models'

interface ModelIconProps {
  className?: string
}

function GoogleIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function FluxIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#111"/>
      <path d="M7 7h10v2H9v2h6v2H9v4H7V7z" fill="#fff"/>
    </svg>
  )
}

function ByteDanceIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12.53 2.13a2.08 2.08 0 00-1.06 0c-.7.18-1.23.67-1.56 1.26a5.06 5.06 0 00-.56 2.1v6.63a3.33 3.33 0 01-2.12 3.14 3.36 3.36 0 01-3.68-.72 3.33 3.33 0 014.13-5.17v-2.8a6.12 6.12 0 00-3.54 1.1A6.13 6.13 0 002 12.13a6.13 6.13 0 003.61 5.59 6.14 6.14 0 006.74-1.33A6.08 6.08 0 0014 12.12V8.28a8.16 8.16 0 004.7 1.48v-2.8a5.37 5.37 0 01-3.03-1.53 5.33 5.33 0 01-1.53-3.03 2 2 0 00-1.61-.27z" fill="#fe2c55"/>
    </svg>
  )
}

function QwenIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FF6A00"/>
      <path d="M8 10.5c0-2.21 1.79-4 4-4s4 1.79 4 4v1c0 2.21-1.79 4-4 4s-4-1.79-4-4v-1z" fill="#fff"/>
      <circle cx="10.5" cy="10" r="1" fill="#FF6A00"/>
      <circle cx="13.5" cy="10" r="1" fill="#FF6A00"/>
      <path d="M14 17l2 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function WanIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="10" fill="#6366f1"/>
      <path d="M7 16l2.5-8h1.5L12 13l1-5h1.5L17 16h-1.5l-2-6.5L12.5 16h-1L10 9.5 8 16H7z" fill="#fff"/>
    </svg>
  )
}

function IdeogramIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#1a1a2e"/>
      <path d="M8 7h8v2H8zm0 4h8v2H8zm0 4h5v2H8z" fill="#a78bfa"/>
    </svg>
  )
}

function HiDreamIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="url(#hd-grad)"/>
      <path d="M8 8v8m0-4h4m0-4v8m4-8v8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      <defs><linearGradient id="hd-grad" x1="2" y1="2" x2="22" y2="22"><stop stopColor="#ec4899"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
    </svg>
  )
}

function RunDiffusionIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#0ea5e9"/>
      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function StabilityIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#7c3aed"/>
      <path d="M7 17V7l5 5 5-5v10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function LykonIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#f59e0b"/>
      <path d="M12 6v6l4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function OpenAIIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.28 9.37a5.93 5.93 0 00-.51-4.88 6.01 6.01 0 00-6.47-2.87A5.98 5.98 0 0010.8.2 6.02 6.02 0 004.8 4.08a5.98 5.98 0 00-4 2.9 6.01 6.01 0 00.74 7.04 5.93 5.93 0 00.51 4.88 6.01 6.01 0 006.47 2.87 5.97 5.97 0 004.5 1.42 6.02 6.02 0 006-3.88 5.98 5.98 0 004-2.9 6.01 6.01 0 00-.74-7.04zM13.3 21.52a4.49 4.49 0 01-2.88-.93l.14-.08 4.79-2.77a.78.78 0 00.39-.67v-6.76l2.02 1.17a.07.07 0 01.04.06v5.6a4.5 4.5 0 01-4.5 4.38zM3.6 17.6a4.47 4.47 0 01-.54-3.02l.14.09 4.79 2.77a.77.77 0 00.78 0l5.84-3.37v2.33a.07.07 0 01-.03.06l-4.83 2.79a4.5 4.5 0 01-6.15-1.65zM2.34 7.89A4.48 4.48 0 014.7 5.91v5.7a.77.77 0 00.39.67l5.84 3.37-2.02 1.17a.07.07 0 01-.07 0L4 14.03a4.5 4.5 0 01-1.66-6.14zm17.32 4.03l-5.84-3.37 2.02-1.17a.07.07 0 01.07 0l4.83 2.79a4.49 4.49 0 01-.7 8.12v-5.7a.78.78 0 00-.38-.67zm2.01-3.04l-.14-.09-4.79-2.77a.77.77 0 00-.78 0l-5.84 3.37V7.06a.07.07 0 01.03-.06l4.83-2.79a4.5 4.5 0 016.69 4.67zM9.61 12.89L7.6 11.72a.07.07 0 01-.04-.06v-5.6a4.5 4.5 0 017.38-3.45l-.14.08-4.79 2.77a.78.78 0 00-.39.67l-.01 6.76zm1.1-2.37L12 9.67l1.29.85v1.7l-1.3.85-1.29-.85v-1.7z" fill="#fff"/>
    </svg>
  )
}

function MiniMaxIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#10b981"/>
      <path d="M7 16V8l3 4 3-4v8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 8v8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function KlingIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#3b82f6"/>
      <path d="M8 7v10m0-5l5-5m-5 5l5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PixVerseIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="url(#pv-grad)"/>
      <rect x="7" y="7" width="4" height="4" rx="1" fill="#fff"/>
      <rect x="13" y="7" width="4" height="4" rx="1" fill="#fff" opacity=".7"/>
      <rect x="7" y="13" width="4" height="4" rx="1" fill="#fff" opacity=".7"/>
      <rect x="13" y="13" width="4" height="4" rx="1" fill="#fff" opacity=".4"/>
      <defs><linearGradient id="pv-grad" x1="2" y1="2" x2="22" y2="22"><stop stopColor="#f472b6"/><stop offset="1" stopColor="#818cf8"/></linearGradient></defs>
    </svg>
  )
}

function ViduIcon({ className = 'h-4 w-4' }: ModelIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#8b5cf6"/>
      <path d="M10 8l6 4-6 4V8z" fill="#fff"/>
    </svg>
  )
}

const CATEGORY_ICON_MAP: Record<ModelCategory, React.FC<ModelIconProps>> = {
  google: GoogleIcon,
  flux: FluxIcon,
  bytedance: ByteDanceIcon,
  qwen: QwenIcon,
  wan: WanIcon,
  ideogram: IdeogramIcon,
  hidream: HiDreamIcon,
  rundiffusion: RunDiffusionIcon,
  stability: StabilityIcon,
  lykon: LykonIcon,
  openai: OpenAIIcon,
  minimax: MiniMaxIcon,
  kling: KlingIcon,
  pixverse: PixVerseIcon,
  vidu: ViduIcon,
}

export function ModelCategoryIcon({ category, className = 'h-4 w-4' }: { category: ModelCategory; className?: string }) {
  const Icon = CATEGORY_ICON_MAP[category]
  return Icon ? <Icon className={className} /> : null
}
