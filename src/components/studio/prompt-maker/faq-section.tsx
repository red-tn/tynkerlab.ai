'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQ_ITEMS = [
  {
    question: 'What makes a great image prompt?',
    answer:
      'A great image prompt combines a clear subject with specific details about style, lighting, composition, and mood. Start with what you want to see, then layer on artistic direction. For example: "A futuristic city at golden hour, cyberpunk style, volumetric lighting, wide shot, ultra-detailed" works better than just "futuristic city".',
  },
  {
    question: 'Video prompt tips',
    answer:
      'Video prompts benefit from temporal descriptions and camera direction. Describe what happens over time: the starting scene, any movement or changes, and the ending state. Include camera motion (pan, dolly, tracking) and pacing (slow motion, time-lapse) to guide the generation.',
  },
  {
    question: 'Speech prompt best practices',
    answer:
      'For speech/TTS, focus on natural rhythm and varied sentence structure. Use punctuation strategically for pauses — commas for short pauses, periods for longer ones, ellipses for dramatic effect. Write as if speaking aloud, and consider the persona and tone you want.',
  },
  {
    question: 'Understanding modifiers',
    answer:
      'Modifiers like "8K", "ultra-detailed", and "masterpiece" act as quality boosters that guide the AI toward higher-fidelity output. "HDR" and "ray tracing" add realism, while "sharp focus" prevents blurriness. Stack 2-4 modifiers for best results — too many can conflict.',
  },
  {
    question: 'Camera angles & lighting explained',
    answer:
      'Camera angle sets the viewer\'s perspective: "low angle" makes subjects look powerful, "bird\'s eye" gives an overview, "macro" shows tiny details. Lighting sets mood: "golden hour" is warm and cinematic, "neon" is cyberpunk, "volumetric" adds atmospheric fog/rays, and "rim lighting" creates dramatic silhouettes.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Prompt Writing Tips</h3>
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="rounded-lg border border-nyx-border bg-nyx-surface/50 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex items-center justify-between w-full px-4 py-3 text-left"
          >
            <span className="text-sm font-medium text-white">{item.question}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform shrink-0 ml-2',
                openIndex === i && 'rotate-180'
              )}
            />
          </button>
          {openIndex === i && (
            <div className="px-4 pb-3 animate-slide-down">
              <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
