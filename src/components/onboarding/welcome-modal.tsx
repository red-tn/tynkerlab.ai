'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Image,
  Video,
  AudioLines,
  Type,
  Film,
  LayoutTemplate,
  UserCircle,
  Sparkles,
  Lightbulb,
  Compass,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'tynkerlab_onboarding_completed'

// ---------------------------------------------------------------------------
// Step 1 — Capability cards
// ---------------------------------------------------------------------------
const capabilities = [
  {
    icon: Image,
    title: 'Images',
    description: 'Generate stunning visuals from text prompts with 32+ AI models',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: Video,
    title: 'Videos',
    description: 'Transform images and prompts into cinematic video clips',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: AudioLines,
    title: 'Speech',
    description: 'Create lifelike voiceovers with custom AI voices',
    gradient: 'from-amber-500 to-orange-500',
  },
] as const

// ---------------------------------------------------------------------------
// Step 2 — Tool cards
// ---------------------------------------------------------------------------
const tools = [
  {
    id: 'text-to-image',
    icon: Type,
    title: 'Text to Image',
    description: 'Describe anything and watch it come to life',
    route: '/studio/text-to-image',
  },
  {
    id: 'image-to-video',
    icon: Film,
    title: 'Image to Video',
    description: 'Animate your images with cinematic motion',
    route: '/studio/image-to-video',
  },
  {
    id: 'templates',
    icon: LayoutTemplate,
    title: 'Templates',
    description: 'Start fast with ready-made creative presets',
    route: '/studio/templates',
  },
  {
    id: 'ugc-avatar',
    icon: UserCircle,
    title: 'UGC Avatar',
    description: 'Generate realistic AI avatar videos',
    route: '/studio/ugc-avatar',
  },
] as const

// ---------------------------------------------------------------------------
// Step 3 — Quick tips
// ---------------------------------------------------------------------------
const tips = [
  { icon: Lightbulb, text: 'Try a prompt in the studio' },
  { icon: LayoutTemplate, text: 'Browse templates for inspiration' },
  { icon: Compass, text: 'Explore 56 AI models' },
] as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface WelcomeModalProps {
  creditsBalance: number
}

export function WelcomeModal({ creditsBalance }: WelcomeModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  // Tracks when a transition is actively playing so we can swap content at the right time
  const [transitioning, setTransitioning] = useState(false)
  // The step whose content is currently rendered (lags `step` during transition)
  const [displayedStep, setDisplayedStep] = useState(0)

  // ── Mount check ──
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'true') {
        setOpen(true)
      }
    } catch {
      // localStorage unavailable — show modal anyway
      setOpen(true)
    }
  }, [])

  // ── Lock body scroll while open ──
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // ── Escape key ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') complete()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const markDone = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      /* noop */
    }
  }, [])

  const complete = useCallback(() => {
    markDone()
    setOpen(false)
  }, [markDone])

  const goToStep = useCallback(
    (next: number) => {
      if (transitioning) return
      setTransitioning(true)
      // After the exit animation (200ms), swap content and start enter animation
      setTimeout(() => {
        setDisplayedStep(next)
        setStep(next)
        setTransitioning(false)
      }, 200)
    },
    [transitioning],
  )

  const handleFinish = useCallback(() => {
    markDone()
    setOpen(false)
    const tool = tools.find((t) => t.id === selectedTool)
    if (tool) {
      router.push(tool.route)
    }
  }, [markDone, selectedTool, router])

  if (!open) return null

  // ── Transition classes ──
  const contentClasses = cn(
    'transition-all duration-200 ease-in-out',
    transitioning
      ? 'opacity-0 translate-x-4'
      : 'opacity-100 translate-x-0',
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Tynkerlab.ai"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-lg bg-nyx-surface border border-nyx-border rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Skip button */}
        <button
          onClick={complete}
          className="absolute top-4 right-4 z-20 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Skip
        </button>

        {/* Content area */}
        <div className="p-6 pt-8 sm:p-8 sm:pt-10">
          <div className={contentClasses}>
            {displayedStep === 0 && <StepWelcome />}
            {displayedStep === 1 && (
              <StepChooseTool
                selectedTool={selectedTool}
                onSelect={setSelectedTool}
              />
            )}
            {displayedStep === 2 && (
              <StepAllSet credits={creditsBalance} />
            )}
          </div>
        </div>

        {/* Footer: progress dots + action button */}
        <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  step === i
                    ? 'w-6 gradient-primary'
                    : step > i
                      ? 'w-2 bg-gray-500'
                      : 'w-2 bg-nyx-border',
                )}
              />
            ))}
          </div>

          {/* Action button */}
          {step === 0 && (
            <Button variant="primary" size="md" onClick={() => goToStep(1)}>
              Get Started
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {step === 1 && (
            <Button
              variant="primary"
              size="md"
              disabled={!selectedTool}
              onClick={() => goToStep(2)}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {step === 2 && (
            <Button variant="primary" size="md" onClick={handleFinish}>
              Start Creating
              <Sparkles className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step sub-components
// ---------------------------------------------------------------------------

function StepWelcome() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          Welcome to{' '}
          <span className="gradient-text">Tynkerlab.ai</span>
        </h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          Your all-in-one AI creation studio. Generate images, videos, and
          speech with the latest AI models.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {capabilities.map((cap) => (
          <div
            key={cap.title}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-nyx-border hover:border-nyx-borderBright transition-colors"
          >
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br',
                cap.gradient,
              )}
            >
              <cap.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-white">
              {cap.title}
            </span>
            <span className="text-xs text-gray-500 text-center leading-relaxed">
              {cap.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepChooseTool({
  selectedTool,
  onSelect,
}: {
  selectedTool: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          Choose Your First Tool
        </h2>
        <p className="text-sm text-gray-400">
          Pick one to jump right in. You can always switch later.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => {
          const isSelected = selectedTool === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => onSelect(tool.id)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-200 cursor-pointer',
                'bg-white/[0.03] border hover:bg-white/[0.06]',
                isSelected
                  ? 'border-transparent gradient-border shadow-lg shadow-[rgba(var(--glow-primary),0.15)]'
                  : 'border-nyx-border hover:border-nyx-borderBright',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200',
                  isSelected
                    ? 'gradient-primary'
                    : 'bg-nyx-surfaceHover',
                )}
              >
                <tool.icon
                  className={cn(
                    'h-5 w-5',
                    isSelected ? 'text-white' : 'text-gray-400',
                  )}
                />
              </div>
              <span className="text-sm font-medium text-white">
                {tool.title}
              </span>
              <span className="text-xs text-gray-500 leading-relaxed">
                {tool.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepAllSet({ credits }: { credits: number }) {
  return (
    <div className="space-y-6">
      {/* Celebration visual */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="flex items-center justify-center w-16 h-16 rounded-full gradient-primary animate-pulse-glow">
            <Zap className="h-8 w-8 text-white" />
          </div>
          {/* Sparkle accents */}
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-400 animate-pulse" />
          <Sparkles className="absolute -bottom-1 -left-2 h-4 w-4 text-cyan-400 animate-pulse [animation-delay:0.5s]" />
          <Sparkles className="absolute top-0 -left-3 h-3 w-3 text-violet-400 animate-pulse [animation-delay:1s]" />
        </div>

        <h2 className="text-2xl font-bold text-white">
          You&apos;re All Set!
        </h2>
        <p className="text-sm text-gray-400">
          You have{' '}
          <span className="font-semibold gradient-text">
            {credits.toLocaleString()} free credits
          </span>{' '}
          to start creating.
        </p>
      </div>

      {/* Quick tips */}
      <div className="space-y-2">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-nyx-border"
          >
            <tip.icon className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-300">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
