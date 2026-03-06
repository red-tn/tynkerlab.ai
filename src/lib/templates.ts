import type { TemplatePromptVariable, TemplatePlatformPreset } from '@/types/database'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TEMPLATE_CATEGORIES = [
  { value: 'product', label: 'Product' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'social', label: 'Social' },
  { value: 'ugc', label: 'UGC' },
] as const

export const PLATFORM_PRESETS: TemplatePlatformPreset[] = [
  { platform: 'tiktok', aspect_ratio: '9:16', label: 'TikTok' },
  { platform: 'instagram_feed', aspect_ratio: '1:1', label: 'IG Feed' },
  { platform: 'instagram_portrait', aspect_ratio: '4:5', label: 'IG Portrait' },
  { platform: 'instagram_story', aspect_ratio: '9:16', label: 'IG Story' },
  { platform: 'instagram_reel', aspect_ratio: '9:16', label: 'IG Reel' },
  { platform: 'youtube_thumbnail', aspect_ratio: '16:9', label: 'YT Thumbnail' },
]

// ---------------------------------------------------------------------------
// Prompt resolution
// ---------------------------------------------------------------------------

/**
 * Resolves a template's base prompt by replacing {placeholder} tokens with user-provided values.
 * Returns the resolved prompt string and the first photo slot URL for image-to-image generation.
 */
export function resolveTemplatePrompt(
  basePrompt: string,
  variables: Record<string, string>,
  photoSlotUrls: Record<string, string>
): { prompt: string; imageUrl: string | null } {
  let prompt = basePrompt

  // Replace all {placeholder} tokens with user values
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `{${key}}`)
  }

  // First photo slot URL becomes the imageUrl for the generation API
  const photoKeys = Object.keys(photoSlotUrls)
  const imageUrl = photoKeys.length > 0 ? photoSlotUrls[photoKeys[0]] || null : null

  return { prompt, imageUrl }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
