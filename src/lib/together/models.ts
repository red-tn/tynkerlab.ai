export type ModelCapability = 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video'
export type ModelCategory = 'google' | 'flux' | 'bytedance' | 'qwen' | 'wan' | 'ideogram' | 'hidream' | 'rundiffusion' | 'stability' | 'lykon' | 'openai' | 'minimax' | 'kling' | 'pixverse' | 'vidu' | 'ltx'
export type VideoQuality = '480p' | '720p' | '1080p' | '1440p' | '4k'

export interface AIModel {
  id: string
  displayName: string
  category: ModelCategory
  categoryLabel: string
  type: 'image' | 'video'
  capabilities: ModelCapability[]
  credits: number
  togetherPrice: string
  resolution?: string
  duration?: string
  hasAudio?: boolean
  defaultSteps?: number
  supportsImageUrl?: boolean
  supportsFrameImages?: boolean
  description: string
  badge?: string
  enabled: boolean
  aspectRatios: string[]
  maxWidth?: number
  maxHeight?: number
  // Video-specific
  videoQualities?: VideoQuality[]
  defaultQuality?: VideoQuality
  maxSeconds?: number
  supportsNegativePrompt?: boolean
  supportsCameraMotion?: boolean
  cameraMotionOptions?: string[]
  /** Exact supported duration values in seconds (overrides maxSeconds-based derivation) */
  durationOptions?: number[]
  /** Credits per second for duration-based pricing (e.g. LTX models) */
  creditsPerSecond?: number
  /** Whether the model generates synchronized audio */
  supportsAudio?: boolean
  /** API provider — defaults to 'together' when absent */
  provider?: 'together' | 'ltx'
}

const CATEGORY_LABELS: Record<ModelCategory, string> = {
  google: 'Google',
  flux: 'Black Forest Labs',
  bytedance: 'ByteDance',
  qwen: 'Qwen / Alibaba',
  wan: 'Wan-AI',
  ideogram: 'Ideogram',
  hidream: 'HiDream',
  rundiffusion: 'RunDiffusion',
  stability: 'Stability AI',
  lykon: 'Lykon',
  openai: 'OpenAI',
  minimax: 'MiniMax',
  kling: 'Kuaishou / Kling',
  pixverse: 'PixVerse',
  vidu: 'Vidu',
  ltx: 'LTX',
}

const DEFAULT_IMAGE_ASPECT_RATIOS = ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '4:5', '5:4', '21:9']
const DEFAULT_VIDEO_ASPECT_RATIOS = ['16:9', '9:16', '1:1']
// Models that only support landscape/portrait (no square)
const LANDSCAPE_PORTRAIT_ONLY = ['16:9', '9:16']
// MiniMax only supports landscape
const LANDSCAPE_ONLY = ['16:9']

// ---------------------------------------------------------------------------
// Image Models (32 total)
// ---------------------------------------------------------------------------

const IMAGE_MODELS: AIModel[] = [
  // ---- Google ----
  {
    id: 'google/imagen-4.0-ultra',
    displayName: 'Imagen 4.0 Ultra',
    category: 'google',
    categoryLabel: CATEGORY_LABELS.google,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 25,
    togetherPrice: '$0.06/MP',
    supportsImageUrl: false,
    description: 'Google Imagen 4.0 Ultra — highest quality Google image model with exceptional detail and prompt adherence.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'google/imagen-4.0-preview',
    displayName: 'Imagen 4.0 Preview',
    category: 'google',
    categoryLabel: CATEGORY_LABELS.google,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 15,
    togetherPrice: '$0.04/MP',
    supportsImageUrl: false,
    description: 'Google Imagen 4.0 Preview — high quality Google image generation at a balanced cost.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'google/imagen-4.0-fast',
    displayName: 'Imagen 4.0 Fast',
    category: 'google',
    categoryLabel: CATEGORY_LABELS.google,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 8,
    togetherPrice: '$0.02/MP',
    supportsImageUrl: false,
    description: 'Google Imagen 4.0 Fast — speed-optimized Google image generation for rapid iteration.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'google/flash-image-2.5',
    displayName: 'Flash Image 2.5',
    category: 'google',
    categoryLabel: CATEGORY_LABELS.google,
    type: 'image',
    capabilities: ['text-to-image', 'image-to-image'],
    credits: 15,
    togetherPrice: '$0.039/MP',
    supportsImageUrl: true,
    description: 'Google Flash Image 2.5 — fast image generation and editing with image-to-image support.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'google/gemini-3-pro-image',
    displayName: 'Gemini 3 Pro Image',
    category: 'google',
    categoryLabel: CATEGORY_LABELS.google,
    type: 'image',
    capabilities: ['text-to-image', 'image-to-image'],
    credits: 20,
    togetherPrice: '$0.134/image',
    supportsImageUrl: true,
    description: 'Google Gemini 3 Pro Image — multimodal image generation powered by the Gemini 3 Pro model.',
    badge: 'NEW',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },

  // ---- Black Forest Labs / FLUX ----
  {
    id: 'black-forest-labs/FLUX.2-pro',
    displayName: 'FLUX.2 Pro',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 20,
    togetherPrice: '$0.05/MP',
    supportsImageUrl: false,
    description: 'FLUX.2 Pro — professional-grade image generation with excellent prompt following.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.2-dev',
    displayName: 'FLUX.2 Dev',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 10,
    togetherPrice: '$0.025/MP',
    supportsImageUrl: false,
    description: 'FLUX.2 Dev — development version of FLUX.2 with strong quality at a lower price point.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.2-flex',
    displayName: 'FLUX.2 Flex',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 10,
    togetherPrice: '$0.025/MP',
    supportsImageUrl: false,
    description: 'FLUX.2 Flex — flexible FLUX.2 variant optimized for varied aspect ratios.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.2-max',
    displayName: 'FLUX.2 Max',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 25,
    togetherPrice: '$0.07/MP',
    supportsImageUrl: false,
    defaultSteps: 50,
    description: 'FLUX.2 Max — highest quality FLUX.2 model with 50-step default for maximum detail.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.1.1-pro',
    displayName: 'FLUX 1.1 Pro',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 15,
    togetherPrice: '$0.04/MP',
    supportsImageUrl: false,
    description: 'FLUX 1.1 Pro — proven professional FLUX model with reliable quality.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.1-schnell',
    displayName: 'FLUX.1 Schnell',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 3,
    togetherPrice: '$0.0027/MP',
    supportsImageUrl: false,
    defaultSteps: 4,
    description: 'FLUX.1 Schnell — ultra-fast 4-step generation for rapid prototyping at minimal cost.',
    badge: 'FAST',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.1-dev',
    displayName: 'FLUX.1 Dev',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 8,
    togetherPrice: '$0.025/MP',
    supportsImageUrl: false,
    defaultSteps: 28,
    description: 'FLUX.1 Dev — open-weight FLUX model with 28-step default for quality text-to-image generation.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.1-kontext-pro',
    displayName: 'FLUX Kontext Pro',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image', 'image-to-image'],
    credits: 15,
    togetherPrice: '$0.04/MP',
    supportsImageUrl: true,
    defaultSteps: 28,
    description: 'FLUX Kontext Pro — context-aware image editing and generation, optimized for image-to-image workflows.',
    badge: 'POPULAR',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.1-kontext-max',
    displayName: 'FLUX Kontext Max',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image', 'image-to-image'],
    credits: 25,
    togetherPrice: '$0.08/MP',
    supportsImageUrl: true,
    defaultSteps: 28,
    description: 'FLUX Kontext Max — highest quality context-aware editing with maximum detail for image-to-image.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.1-kontext-dev',
    displayName: 'FLUX Kontext Dev',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image', 'image-to-image'],
    credits: 10,
    togetherPrice: '$0.025/MP',
    supportsImageUrl: true,
    defaultSteps: 28,
    description: 'FLUX Kontext Dev — development context-aware model for affordable image-to-image editing.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.1-krea-dev',
    displayName: 'FLUX.1 Krea Dev',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 10,
    togetherPrice: '$0.025/MP',
    supportsImageUrl: false,
    defaultSteps: 30,
    description: 'FLUX.1 Krea Dev — Krea-tuned FLUX variant with 30-step default for high-quality generation.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'black-forest-labs/FLUX.1-canny-pro',
    displayName: 'FLUX.1 Canny Pro',
    category: 'flux',
    categoryLabel: CATEGORY_LABELS.flux,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 18,
    togetherPrice: '$0.05/MP',
    supportsImageUrl: false,
    description: 'FLUX.1 Canny Pro — edge-guided image generation using canny edge detection for structural control.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },

  // ---- ByteDance ----
  {
    id: 'ByteDance-Seed/Seedream-4.0',
    displayName: 'Seedream 4.0',
    category: 'bytedance',
    categoryLabel: CATEGORY_LABELS.bytedance,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 12,
    togetherPrice: '$0.03/MP',
    supportsImageUrl: false,
    description: 'ByteDance Seedream 4.0 — latest generation image model with strong text rendering.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'ByteDance-Seed/Seedream-3.0',
    displayName: 'Seedream 3.0',
    category: 'bytedance',
    categoryLabel: CATEGORY_LABELS.bytedance,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 8,
    togetherPrice: '$0.018/MP',
    supportsImageUrl: false,
    description: 'ByteDance Seedream 3.0 — reliable image generation with great quality at a great price.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'ByteDance/SeedEdit',
    displayName: 'SeedEdit',
    category: 'bytedance',
    categoryLabel: CATEGORY_LABELS.bytedance,
    type: 'image',
    capabilities: ['text-to-image', 'image-to-image'],
    credits: 12,
    togetherPrice: '$0.03/MP',
    supportsImageUrl: true,
    description: 'ByteDance SeedEdit — specialized image editing model for precise modifications to existing images.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },

  // ---- Qwen / Alibaba ----
  {
    id: 'Qwen/Qwen-Image',
    displayName: 'Qwen Image',
    category: 'qwen',
    categoryLabel: CATEGORY_LABELS.qwen,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 5,
    togetherPrice: '$0.0058/MP',
    supportsImageUrl: false,
    description: 'Qwen Image — affordable text-to-image generation from Alibaba Qwen team.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'Qwen/Qwen-Image-Edit',
    displayName: 'Qwen Image Edit',
    category: 'qwen',
    categoryLabel: CATEGORY_LABELS.qwen,
    type: 'image',
    capabilities: ['text-to-image', 'image-to-image'],
    credits: 3,
    togetherPrice: '$0.0032/MP',
    supportsImageUrl: true,
    description: 'Qwen Image Edit — ultra-affordable image editing with image-to-image support.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },

  // ---- Wan-AI ----
  {
    id: 'Wan-AI/Wan-2.6-Image',
    displayName: 'Wan 2.6 Image',
    category: 'wan',
    categoryLabel: CATEGORY_LABELS.wan,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 12,
    togetherPrice: '$0.03/MP',
    supportsImageUrl: false,
    description: 'Wan 2.6 Image — Wan-AI image generation with strong visual quality.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },

  // ---- Ideogram ----
  {
    id: 'ideogram/ideogram-3.0',
    displayName: 'Ideogram 3.0',
    category: 'ideogram',
    categoryLabel: CATEGORY_LABELS.ideogram,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 22,
    togetherPrice: '$0.06/MP',
    supportsImageUrl: false,
    description: 'Ideogram 3.0 — excellent text rendering and typography in generated images.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },

  // ---- HiDream ----
  {
    id: 'HiDream-ai/HiDream-I1-Full',
    displayName: 'HiDream I1 Full',
    category: 'hidream',
    categoryLabel: CATEGORY_LABELS.hidream,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 5,
    togetherPrice: '$0.009/MP',
    supportsImageUrl: false,
    description: 'HiDream I1 Full — full-quality HiDream image generation at an affordable price.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'HiDream-ai/HiDream-I1-Dev',
    displayName: 'HiDream I1 Dev',
    category: 'hidream',
    categoryLabel: CATEGORY_LABELS.hidream,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 3,
    togetherPrice: '$0.0045/MP',
    supportsImageUrl: false,
    description: 'HiDream I1 Dev — development HiDream model balancing quality and speed.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'HiDream-ai/HiDream-I1-Fast',
    displayName: 'HiDream I1 Fast',
    category: 'hidream',
    categoryLabel: CATEGORY_LABELS.hidream,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 2,
    togetherPrice: '$0.0032/MP',
    supportsImageUrl: false,
    description: 'HiDream I1 Fast — speed-optimized HiDream model for rapid generation.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },

  // ---- RunDiffusion ----
  {
    id: 'RunDiffusion/Juggernaut-pro-flux',
    displayName: 'Juggernaut Pro',
    category: 'rundiffusion',
    categoryLabel: CATEGORY_LABELS.rundiffusion,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 3,
    togetherPrice: '$0.0049/MP',
    supportsImageUrl: false,
    description: 'Juggernaut Pro — community-favorite FLUX fine-tune with photorealistic output.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },
  {
    id: 'Rundiffusion/Juggernaut-Lightning-Flux',
    displayName: 'Juggernaut Lightning',
    category: 'rundiffusion',
    categoryLabel: CATEGORY_LABELS.rundiffusion,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 2,
    togetherPrice: '$0.0017/MP',
    supportsImageUrl: false,
    description: 'Juggernaut Lightning — ultra-fast Juggernaut variant for rapid photorealistic generation.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
  },

  // ---- Stability AI ----
  {
    id: 'stabilityai/stable-diffusion-3-medium',
    displayName: 'Stable Diffusion 3',
    category: 'stability',
    categoryLabel: CATEGORY_LABELS.stability,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 2,
    togetherPrice: '$0.0019/MP',
    supportsImageUrl: false,
    description: 'Stable Diffusion 3 Medium — Stability AI next-gen architecture with improved text and composition.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
    supportsNegativePrompt: true,
  },
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    displayName: 'SDXL Base 1.0',
    category: 'stability',
    categoryLabel: CATEGORY_LABELS.stability,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 2,
    togetherPrice: '$0.0019/MP',
    supportsImageUrl: false,
    description: 'SDXL Base 1.0 — widely-used Stable Diffusion XL base model for general image generation.',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
    supportsNegativePrompt: true,
  },

  // ---- Lykon ----
  {
    id: 'Lykon/DreamShaper',
    displayName: 'DreamShaper',
    category: 'lykon',
    categoryLabel: CATEGORY_LABELS.lykon,
    type: 'image',
    capabilities: ['text-to-image'],
    credits: 1,
    togetherPrice: '$0.0006/MP',
    supportsImageUrl: false,
    description: 'DreamShaper — the most affordable image model, great for stylized and artistic generation.',
    badge: 'CHEAPEST',
    enabled: true,
    aspectRatios: DEFAULT_IMAGE_ASPECT_RATIOS,
    supportsNegativePrompt: true,
  },
]

// ---------------------------------------------------------------------------
// Video Models (22 total)
// ---------------------------------------------------------------------------

const VIDEO_MODELS: AIModel[] = [
  // ---- Google ----
  {
    id: 'google/veo-3.0',
    displayName: 'Google Veo 3.0',
    category: 'google',
    categoryLabel: CATEGORY_LABELS.google,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 640,
    togetherPrice: '$1.60/video',
    resolution: '720p',
    duration: '8s',
    supportsFrameImages: true,
    description: 'Google Veo 3.0 — high quality video generation with text-to-video and image-to-video.',
    enabled: true,
    aspectRatios: LANDSCAPE_PORTRAIT_ONLY,
    videoQualities: ['720p', '1080p'],
    defaultQuality: '720p',
    maxSeconds: 8,
    durationOptions: [4, 6, 8],
    supportsNegativePrompt: true,
  },
  {
    id: 'google/veo-3.0-audio',
    displayName: 'Veo 3.0 + Audio',
    category: 'google',
    categoryLabel: CATEGORY_LABELS.google,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 1280,
    togetherPrice: '$3.20/video',
    resolution: '720p',
    duration: '8s',
    hasAudio: true,
    supportsFrameImages: true,
    description: 'Veo 3.0 with synchronized audio generation — produces video with matching sound effects and music.',
    badge: 'NEW',
    enabled: true,
    aspectRatios: LANDSCAPE_PORTRAIT_ONLY,
    videoQualities: ['720p', '1080p'],
    defaultQuality: '720p',
    maxSeconds: 8,
    durationOptions: [4, 6, 8],
    supportsNegativePrompt: true,
  },
  {
    id: 'google/veo-3.0-fast',
    displayName: 'Veo 3.0 Fast',
    category: 'google',
    categoryLabel: CATEGORY_LABELS.google,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 320,
    togetherPrice: '$0.80/video',
    resolution: '1080p',
    duration: '8s',
    supportsFrameImages: true,
    description: 'Veo 3.0 Fast — speed-optimized video generation for rapid iteration.',
    enabled: true,
    aspectRatios: LANDSCAPE_PORTRAIT_ONLY,
    videoQualities: ['720p', '1080p'],
    defaultQuality: '720p',
    maxSeconds: 8,
    durationOptions: [4, 6, 8],
    supportsNegativePrompt: true,
  },
  {
    id: 'google/veo-3.0-fast-audio',
    displayName: 'Veo 3.0 Fast + Audio',
    category: 'google',
    categoryLabel: CATEGORY_LABELS.google,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 480,
    togetherPrice: '$1.20/video',
    resolution: '1080p',
    duration: '8s',
    hasAudio: true,
    supportsFrameImages: true,
    description: 'Veo 3.0 Fast with audio — rapid video generation with synchronized sound.',
    enabled: true,
    aspectRatios: LANDSCAPE_PORTRAIT_ONLY,
    videoQualities: ['720p', '1080p'],
    defaultQuality: '720p',
    maxSeconds: 8,
    durationOptions: [4, 6, 8],
    supportsNegativePrompt: true,
  },
  {
    id: 'google/veo-2.0',
    displayName: 'Google Veo 2.0',
    category: 'google',
    categoryLabel: CATEGORY_LABELS.google,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 1000,
    togetherPrice: '$2.50/video',
    resolution: '720p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'Google Veo 2.0 — premium video generation with cinematic quality.',
    enabled: true,
    aspectRatios: LANDSCAPE_PORTRAIT_ONLY,
    videoQualities: ['720p'],
    defaultQuality: '720p',
    maxSeconds: 8,
    durationOptions: [5, 8],
    supportsNegativePrompt: true,
  },

  // ---- OpenAI ----
  {
    id: 'openai/sora-2',
    displayName: 'Sora 2',
    category: 'openai',
    categoryLabel: CATEGORY_LABELS.openai,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 320,
    togetherPrice: '$0.80/video',
    resolution: '720p',
    duration: '8s',
    supportsFrameImages: true,
    description: 'OpenAI Sora 2 — text-to-video and image-to-video with strong prompt understanding.',
    enabled: true,
    aspectRatios: LANDSCAPE_PORTRAIT_ONLY,
    videoQualities: ['720p'],
    defaultQuality: '720p',
    maxSeconds: 10,
    durationOptions: [5, 10],
    supportsNegativePrompt: true,
  },
  {
    id: 'openai/sora-2-pro',
    displayName: 'Sora 2 Pro',
    category: 'openai',
    categoryLabel: CATEGORY_LABELS.openai,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 960,
    togetherPrice: '$2.40/video',
    resolution: '720p',
    duration: '8s',
    supportsFrameImages: true,
    description: 'Sora 2 Pro — premium video generation from OpenAI with enhanced detail.',
    enabled: true,
    aspectRatios: LANDSCAPE_PORTRAIT_ONLY,
    videoQualities: ['720p'],
    defaultQuality: '720p',
    maxSeconds: 10,
    durationOptions: [5, 10],
    supportsNegativePrompt: true,
  },

  // ---- MiniMax ----
  {
    id: 'minimax/video-01-director',
    displayName: 'MiniMax Director',
    category: 'minimax',
    categoryLabel: CATEGORY_LABELS.minimax,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 112,
    togetherPrice: '$0.28/video',
    resolution: '720p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'MiniMax Director — affordable video generation with camera control capabilities.',
    enabled: true,
    aspectRatios: LANDSCAPE_ONLY,
    videoQualities: ['720p'],
    defaultQuality: '720p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },
  {
    id: 'minimax/hailuo-02',
    displayName: 'Hailuo 02',
    category: 'minimax',
    categoryLabel: CATEGORY_LABELS.minimax,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 196,
    togetherPrice: '$0.49/video',
    resolution: '768p',
    duration: '10s',
    supportsFrameImages: true,
    description: 'Hailuo 02 — MiniMax video model producing longer 10-second clips.',
    enabled: true,
    aspectRatios: LANDSCAPE_ONLY,
    videoQualities: ['720p', '1080p'],
    defaultQuality: '720p',
    maxSeconds: 10,
    durationOptions: [5, 10],
    supportsNegativePrompt: true,
  },

  // ---- ByteDance ----
  {
    id: 'ByteDance/Seedance-1.0-pro',
    displayName: 'Seedance 1.0 Pro',
    category: 'bytedance',
    categoryLabel: CATEGORY_LABELS.bytedance,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 228,
    togetherPrice: '$0.57/video',
    resolution: '1080p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'ByteDance Seedance 1.0 Pro — video generation with strong motion quality.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['480p', '720p'],
    defaultQuality: '720p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },
  {
    id: 'ByteDance/Seedance-1.0-lite',
    displayName: 'Seedance 1.0 Lite',
    category: 'bytedance',
    categoryLabel: CATEGORY_LABELS.bytedance,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 56,
    togetherPrice: '$0.14/video',
    resolution: '720p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'ByteDance Seedance 1.0 Lite — affordable video generation for quick iterations.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['480p', '720p'],
    defaultQuality: '480p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },

  // ---- Kuaishou / Kling ----
  {
    id: 'kwaivgI/kling-2.1-master',
    displayName: 'Kling 2.1 Master',
    category: 'kling',
    categoryLabel: CATEGORY_LABELS.kling,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 368,
    togetherPrice: '$0.92/video',
    resolution: '1080p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'Kling 2.1 Master — highest quality Kling model with cinematic 1080p output.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['1080p'],
    defaultQuality: '1080p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },
  {
    id: 'kwaivgI/kling-2.1-pro',
    displayName: 'Kling 2.1 Pro',
    category: 'kling',
    categoryLabel: CATEGORY_LABELS.kling,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 128,
    togetherPrice: '$0.32/video',
    resolution: '1080p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'Kling 2.1 Pro — professional 1080p video generation at a balanced price.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['1080p'],
    defaultQuality: '1080p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },
  {
    id: 'kwaivgI/kling-2.1-standard',
    displayName: 'Kling 2.1 Standard',
    category: 'kling',
    categoryLabel: CATEGORY_LABELS.kling,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 72,
    togetherPrice: '$0.18/video',
    resolution: '1080p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'Kling 2.1 Standard — affordable video generation for everyday use.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['1080p'],
    defaultQuality: '1080p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },
  {
    id: 'kwaivgI/kling-2.0-master',
    displayName: 'Kling 2.0 Master',
    category: 'kling',
    categoryLabel: CATEGORY_LABELS.kling,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 368,
    togetherPrice: '$0.92/video',
    resolution: '720p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'Kling 2.0 Master — proven master-tier video generation with reliable output.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['720p'],
    defaultQuality: '720p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },
  {
    id: 'kwaivgI/kling-1.6-pro',
    displayName: 'Kling 1.6 Pro',
    category: 'kling',
    categoryLabel: CATEGORY_LABELS.kling,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 128,
    togetherPrice: '$0.32/video',
    resolution: '1080p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'Kling 1.6 Pro — stable professional video generation at 1080p resolution.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['1080p'],
    defaultQuality: '1080p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },
  {
    id: 'kwaivgI/kling-1.6-standard',
    displayName: 'Kling 1.6 Standard',
    category: 'kling',
    categoryLabel: CATEGORY_LABELS.kling,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 76,
    togetherPrice: '$0.19/video',
    resolution: '1080p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'Kling 1.6 Standard — budget-friendly video generation.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['1080p'],
    defaultQuality: '1080p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },

  // ---- PixVerse ----
  {
    id: 'pixverse/pixverse-v5',
    displayName: 'PixVerse V5',
    category: 'pixverse',
    categoryLabel: CATEGORY_LABELS.pixverse,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 120,
    togetherPrice: '$0.30/video',
    resolution: '1080p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'PixVerse V5 — video generation with strong visual quality, motion, and camera control.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['480p', '720p', '1080p'],
    defaultQuality: '720p',
    maxSeconds: 8,
    durationOptions: [5, 8],
    supportsNegativePrompt: true,
    supportsCameraMotion: true,
    cameraMotionOptions: [
      'horizontal_left', 'horizontal_right', 'vertical_up', 'vertical_down',
      'zoom_in', 'zoom_out', 'crane_up', 'quickly_zoom_in', 'quickly_zoom_out',
      'smooth_zoom_in', 'camera_rotation', 'robo_arm', 'super_dolly_out',
      'whip_pan', 'hitchcock', 'left_follow', 'right_follow',
      'pan_left', 'pan_right', 'fix_bg',
    ],
  },

  // ---- Wan-AI ----
  {
    id: 'Wan-AI/Wan2.2-T2V-A14B',
    displayName: 'Wan 2.2 Text-to-Video',
    category: 'wan',
    categoryLabel: CATEGORY_LABELS.wan,
    type: 'video',
    capabilities: ['text-to-video'],
    credits: 264,
    togetherPrice: '$0.66/video',
    supportsFrameImages: false,
    description: 'Wan 2.2 Text-to-Video — text-to-video only model from Wan-AI with 14B parameters.',
    enabled: true,
    aspectRatios: LANDSCAPE_PORTRAIT_ONLY,
    videoQualities: ['720p'],
    defaultQuality: '720p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },
  {
    id: 'Wan-AI/Wan2.2-I2V-A14B',
    displayName: 'Wan 2.2 Image-to-Video',
    category: 'wan',
    categoryLabel: CATEGORY_LABELS.wan,
    type: 'video',
    capabilities: ['image-to-video'],
    credits: 124,
    togetherPrice: '$0.31/video',
    supportsFrameImages: true,
    description: 'Wan 2.2 Image-to-Video — image-to-video only model from Wan-AI with 14B parameters.',
    enabled: true,
    aspectRatios: LANDSCAPE_PORTRAIT_ONLY,
    videoQualities: ['720p'],
    defaultQuality: '720p',
    maxSeconds: 5,
    supportsNegativePrompt: true,
  },

  // ---- Vidu ----
  {
    id: 'vidu/vidu-2.0',
    displayName: 'Vidu 2.0',
    category: 'vidu',
    categoryLabel: CATEGORY_LABELS.vidu,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 112,
    togetherPrice: '$0.28/video',
    resolution: '720p',
    duration: '8s',
    supportsFrameImages: true,
    description: 'Vidu 2.0 — affordable video generation with 8-second duration.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['480p', '720p', '1080p'],
    defaultQuality: '720p',
    maxSeconds: 8,
    durationOptions: [4, 8],
    supportsNegativePrompt: true,
  },
  {
    id: 'vidu/vidu-q1',
    displayName: 'Vidu Q1',
    category: 'vidu',
    categoryLabel: CATEGORY_LABELS.vidu,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 88,
    togetherPrice: '$0.22/video',
    resolution: '1080p',
    duration: '5s',
    supportsFrameImages: true,
    description: 'Vidu Q1 — quality-focused 1080p video generation at a competitive price.',
    enabled: true,
    aspectRatios: DEFAULT_VIDEO_ASPECT_RATIOS,
    videoQualities: ['1080p'],
    defaultQuality: '1080p',
    maxSeconds: 5,
    durationOptions: [4, 5],
    supportsNegativePrompt: true,
  },
  // LTX-2 family — synchronous API, audio+video, up to 4K, 20s clips
  {
    id: 'ltx-2-fast',
    displayName: 'LTX-2 Fast',
    category: 'ltx',
    categoryLabel: CATEGORY_LABELS.ltx,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 96,
    togetherPrice: '$0.04/s',
    resolution: '1080p',
    duration: '6–20s',
    supportsFrameImages: true,
    supportsAudio: true,
    hasAudio: true,
    provider: 'ltx',
    creditsPerSecond: 16,
    description: 'LTX-2 Fast — affordable audio+video generation up to 4K and 20 seconds.',
    badge: 'Audio+Video',
    enabled: true,
    aspectRatios: ['16:9'],
    videoQualities: ['1080p', '1440p', '4k'],
    defaultQuality: '1080p',
    maxSeconds: 20,
    durationOptions: [6, 8, 10, 12, 14, 16, 18, 20],
  },
  {
    id: 'ltx-2-pro',
    displayName: 'LTX-2 Pro',
    category: 'ltx',
    categoryLabel: CATEGORY_LABELS.ltx,
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 144,
    togetherPrice: '$0.06/s',
    resolution: '1080p',
    duration: '6–20s',
    supportsFrameImages: true,
    supportsAudio: true,
    hasAudio: true,
    provider: 'ltx',
    creditsPerSecond: 24,
    description: 'LTX-2 Pro — premium audio+video with higher fidelity, up to 4K and 20 seconds.',
    badge: 'Audio+Video',
    enabled: true,
    aspectRatios: ['16:9'],
    videoQualities: ['1080p', '1440p', '4k'],
    defaultQuality: '1080p',
    maxSeconds: 20,
    durationOptions: [6, 8, 10, 12, 14, 16, 18, 20],
  },
]

// ---------------------------------------------------------------------------
// Combined registry
// ---------------------------------------------------------------------------

export const ALL_MODELS: AIModel[] = [...IMAGE_MODELS, ...VIDEO_MODELS]

// ---------------------------------------------------------------------------
// Model-specific resolution mappings
// ---------------------------------------------------------------------------

type ResolutionMap = Record<string, { w: number; h: number }>

// Google Imagen 4.0 family — fixed set from Together.ai API
const IMAGEN_RESOLUTIONS: ResolutionMap = {
  '1:1':  { w: 1024, h: 1024 },
  '16:9': { w: 1408, h: 768 },
  '9:16': { w: 768, h: 1408 },
  '3:2':  { w: 1280, h: 896 },
  '2:3':  { w: 896, h: 1280 },
  '4:3':  { w: 1280, h: 896 },
  '3:4':  { w: 896, h: 1280 },
  '5:4':  { w: 1280, h: 896 },
  '4:5':  { w: 896, h: 1280 },
  '21:9': { w: 1408, h: 768 },
}

// FLUX family — flexible, multiples of 16, ≤1 megapixel
const FLUX_RESOLUTIONS: ResolutionMap = {
  '1:1':  { w: 1024, h: 1024 },
  '16:9': { w: 1344, h: 768 },
  '9:16': { w: 768, h: 1344 },
  '3:2':  { w: 1152, h: 768 },
  '2:3':  { w: 768, h: 1152 },
  '4:3':  { w: 1024, h: 768 },
  '3:4':  { w: 768, h: 1024 },
  '5:4':  { w: 1024, h: 832 },
  '4:5':  { w: 832, h: 1024 },
  '21:9': { w: 1536, h: 640 },
}

// Stable Diffusion XL / SD3
const SDXL_RESOLUTIONS: ResolutionMap = {
  '1:1':  { w: 1024, h: 1024 },
  '16:9': { w: 1344, h: 768 },
  '9:16': { w: 768, h: 1344 },
  '3:2':  { w: 1216, h: 832 },
  '2:3':  { w: 832, h: 1216 },
  '4:3':  { w: 1152, h: 896 },
  '3:4':  { w: 896, h: 1152 },
  '5:4':  { w: 1088, h: 896 },
  '4:5':  { w: 896, h: 1088 },
  '21:9': { w: 1344, h: 576 },
}

// Stable Diffusion 1.5 / older (smaller resolutions)
const SD15_RESOLUTIONS: ResolutionMap = {
  '1:1':  { w: 512, h: 512 },
  '16:9': { w: 768, h: 432 },
  '9:16': { w: 432, h: 768 },
  '3:2':  { w: 768, h: 512 },
  '2:3':  { w: 512, h: 768 },
  '4:3':  { w: 640, h: 480 },
  '3:4':  { w: 480, h: 640 },
  '5:4':  { w: 640, h: 512 },
  '4:5':  { w: 512, h: 640 },
  '21:9': { w: 768, h: 336 },
}

// Video resolution maps per quality tier
const VIDEO_480P: ResolutionMap = {
  '16:9': { w: 864, h: 480 },
  '9:16': { w: 480, h: 864 },
  '1:1':  { w: 640, h: 640 },
}

const VIDEO_720P: ResolutionMap = {
  '16:9': { w: 1280, h: 720 },
  '9:16': { w: 720, h: 1280 },
  '1:1':  { w: 720, h: 720 },
}

const VIDEO_1080P: ResolutionMap = {
  '16:9': { w: 1920, h: 1080 },
  '9:16': { w: 1080, h: 1920 },
  '1:1':  { w: 1080, h: 1080 },
}

const VIDEO_1440P: ResolutionMap = {
  '16:9': { w: 2560, h: 1440 },
  '9:16': { w: 1440, h: 2560 },
  '1:1':  { w: 1440, h: 1440 },
}

const VIDEO_4K: ResolutionMap = {
  '16:9': { w: 3840, h: 2160 },
  '9:16': { w: 2160, h: 3840 },
  '1:1':  { w: 2160, h: 2160 },
}

const VIDEO_768P: ResolutionMap = {
  '16:9': { w: 1366, h: 768 },
  '9:16': { w: 768, h: 1366 },
  '1:1':  { w: 768, h: 768 },
}

// Seedance uses non-standard resolutions
const SEEDANCE_480P: ResolutionMap = {
  '16:9': { w: 960, h: 416 },
  '9:16': { w: 416, h: 960 },
  '1:1':  { w: 640, h: 640 },
}

const SEEDANCE_720P: ResolutionMap = {
  '16:9': { w: 1248, h: 704 },
  '9:16': { w: 640, h: 1504 },
  '1:1':  { w: 960, h: 960 },
}

// PixVerse has many resolutions per quality tier
const PIXVERSE_480P: ResolutionMap = {
  '16:9': { w: 640, h: 360 },
  '9:16': { w: 360, h: 640 },
  '1:1':  { w: 360, h: 360 },
}

const PIXVERSE_720P: ResolutionMap = {
  '16:9': { w: 1280, h: 720 },
  '9:16': { w: 720, h: 1280 },
  '1:1':  { w: 720, h: 720 },
}

const PIXVERSE_1080P: ResolutionMap = {
  '16:9': { w: 1920, h: 1080 },
  '9:16': { w: 1080, h: 1920 },
  '1:1':  { w: 1080, h: 1080 },
}

// Vidu supports 360p through 1080p
const VIDU_480P: ResolutionMap = {
  '16:9': { w: 640, h: 360 },
  '9:16': { w: 360, h: 640 },
  '1:1':  { w: 360, h: 360 },
}

// Quality tier → resolution map per model family
const QUALITY_RESOLUTION_MAP: Record<string, Partial<Record<VideoQuality, ResolutionMap>>> = {
  // Google Veo 3.0 family
  'google/veo-3.0':            { '720p': VIDEO_720P, '1080p': VIDEO_1080P },
  'google/veo-3.0-audio':      { '720p': VIDEO_720P, '1080p': VIDEO_1080P },
  'google/veo-3.0-fast':       { '720p': VIDEO_720P, '1080p': VIDEO_1080P },
  'google/veo-3.0-fast-audio': { '720p': VIDEO_720P, '1080p': VIDEO_1080P },
  'google/veo-2.0':            { '720p': VIDEO_720P },
  // OpenAI
  'openai/sora-2':             { '720p': VIDEO_720P },
  'openai/sora-2-pro':         { '720p': VIDEO_720P },
  // MiniMax
  'minimax/video-01-director': { '720p': VIDEO_768P },
  'minimax/hailuo-02':         { '720p': VIDEO_768P, '1080p': VIDEO_1080P },
  // ByteDance Seedance
  'ByteDance/Seedance-1.0-pro':  { '480p': SEEDANCE_480P, '720p': SEEDANCE_720P },
  'ByteDance/Seedance-1.0-lite': { '480p': SEEDANCE_480P, '720p': SEEDANCE_720P },
  // Kling
  'kwaivgI/kling-2.1-master':   { '1080p': VIDEO_1080P },
  'kwaivgI/kling-2.1-pro':      { '1080p': VIDEO_1080P },
  'kwaivgI/kling-2.1-standard': { '1080p': VIDEO_1080P },
  'kwaivgI/kling-2.0-master':   { '720p': VIDEO_720P },
  'kwaivgI/kling-1.6-pro':      { '1080p': VIDEO_1080P },
  'kwaivgI/kling-1.6-standard': { '1080p': VIDEO_1080P },
  // PixVerse
  'pixverse/pixverse-v5':        { '480p': PIXVERSE_480P, '720p': PIXVERSE_720P, '1080p': PIXVERSE_1080P },
  // Wan-AI
  'Wan-AI/Wan2.2-T2V-A14B':     { '720p': VIDEO_720P },
  'Wan-AI/Wan2.2-I2V-A14B':     { '720p': VIDEO_720P },
  // Vidu
  'vidu/vidu-2.0':              { '480p': VIDU_480P, '720p': VIDEO_720P, '1080p': VIDEO_1080P },
  'vidu/vidu-q1':               { '1080p': VIDEO_1080P },
  // LTX
  'ltx-2-fast':                  { '1080p': VIDEO_1080P, '1440p': VIDEO_1440P, '4k': VIDEO_4K },
  'ltx-2-pro':                   { '1080p': VIDEO_1080P, '1440p': VIDEO_1440P, '4k': VIDEO_4K },
}

function getImageResolutionProfile(modelId: string): ResolutionMap {
  // Google Imagen / Flash / Gemini
  if (modelId.startsWith('google/imagen') || modelId === 'google/flash-image-2.5' || modelId === 'google/gemini-3-pro-image') {
    return IMAGEN_RESOLUTIONS
  }
  // FLUX and FLUX-based models (RunDiffusion Juggernaut, etc.)
  if (modelId.startsWith('black-forest-labs/') || modelId.startsWith('RunDiffusion/') || modelId.startsWith('Rundiffusion/')) {
    return FLUX_RESOLUTIONS
  }
  // Stability AI SDXL / SD3
  if (modelId === 'stabilityai/stable-diffusion-3-medium' || modelId === 'stabilityai/stable-diffusion-xl-base-1.0') {
    return SDXL_RESOLUTIONS
  }
  // DreamShaper (SD 1.5 based)
  if (modelId === 'Lykon/DreamShaper') {
    return SD15_RESOLUTIONS
  }
  // ByteDance Seedream / SeedEdit, Qwen, Wan, Ideogram, HiDream — use FLUX (safe default)
  return FLUX_RESOLUTIONS
}

function getVideoResolutionProfile(modelId: string): ResolutionMap {
  const model = ALL_MODELS.find(m => m.id === modelId)
  if (!model) return VIDEO_720P
  // Use quality-aware resolution if available
  const qualityMap = QUALITY_RESOLUTION_MAP[modelId]
  if (qualityMap) {
    const defaultQ = model.defaultQuality || '720p'
    return qualityMap[defaultQ] || VIDEO_720P
  }
  if (model.resolution === '1080p') return VIDEO_1080P
  if (model.resolution === '768p') return VIDEO_768P
  return VIDEO_720P
}

/**
 * Get the correct pixel resolution for a model + aspect ratio.
 * Used by both client (UI) and server (API validation).
 */
export function getModelResolution(modelId: string, aspectRatio: string): { w: number; h: number } {
  const ar = aspectRatio === 'auto' ? '1:1' : aspectRatio
  const model = ALL_MODELS.find(m => m.id === modelId)
  if (!model) return { w: 1024, h: 1024 }

  const profile = model.type === 'video'
    ? getVideoResolutionProfile(modelId)
    : getImageResolutionProfile(modelId)

  return profile[ar] || profile['1:1'] || { w: 1024, h: 1024 }
}

/**
 * Get all valid aspect ratios for a model (i.e., ones that have a resolution mapping).
 */
export function getModelAspectRatios(modelId: string): string[] {
  const model = ALL_MODELS.find(m => m.id === modelId)
  if (!model) return DEFAULT_IMAGE_ASPECT_RATIOS
  const profile = model.type === 'video'
    ? getVideoResolutionProfile(modelId)
    : getImageResolutionProfile(modelId)
  return Object.keys(profile)
}

// ---------------------------------------------------------------------------
// Video quality helpers
// ---------------------------------------------------------------------------

/** Credit multiplier for each quality tier (base model credits × multiplier) */
const QUALITY_CREDIT_MULTIPLIER: Record<VideoQuality, number> = {
  '480p': 0.7,
  '720p': 1.0,
  '1080p': 1.5,
  '1440p': 2.0,
  '4k': 4.0,
}

/**
 * Get available quality options for a video model.
 */
export function getVideoQualityOptions(modelId: string): VideoQuality[] {
  const model = ALL_MODELS.find(m => m.id === modelId)
  return model?.videoQualities || ['720p']
}

/**
 * Get the default quality for a video model.
 */
export function getVideoDefaultQuality(modelId: string): VideoQuality {
  const model = ALL_MODELS.find(m => m.id === modelId)
  return model?.defaultQuality || '720p'
}

/**
 * Compute final credit cost for a video model at a given quality.
 * For duration-based models (creditsPerSecond): creditsPerSecond × qualityMultiplier × duration.
 * For flat-rate models: base credits × qualityMultiplier.
 */
export function getVideoCreditsForQuality(modelId: string, quality: VideoQuality, duration?: number): number {
  const model = ALL_MODELS.find(m => m.id === modelId)
  if (!model) return 0
  const multiplier = QUALITY_CREDIT_MULTIPLIER[quality] || 1.0
  if (model.creditsPerSecond && duration) {
    return Math.ceil(model.creditsPerSecond * multiplier * duration)
  }
  return Math.ceil(model.credits * multiplier)
}

/**
 * Get resolution (w×h) for a model at a specific quality + aspect ratio.
 */
export function getVideoResolutionForQuality(
  modelId: string,
  quality: VideoQuality,
  aspectRatio: string
): { w: number; h: number } {
  const ar = aspectRatio === 'auto' ? '16:9' : aspectRatio
  const qualityMap = QUALITY_RESOLUTION_MAP[modelId]
  if (qualityMap && qualityMap[quality]) {
    return qualityMap[quality]![ar] || qualityMap[quality]!['16:9'] || { w: 1280, h: 720 }
  }
  // Fallback to generic quality maps
  if (quality === '4k') return VIDEO_4K[ar] || { w: 3840, h: 2160 }
  if (quality === '1440p') return VIDEO_1440P[ar] || { w: 2560, h: 1440 }
  if (quality === '1080p') return VIDEO_1080P[ar] || { w: 1920, h: 1080 }
  if (quality === '480p') return VIDEO_480P[ar] || { w: 864, h: 480 }
  return VIDEO_720P[ar] || { w: 1280, h: 720 }
}

/**
 * Get max duration in seconds for a video model.
 */
export function getVideoMaxDuration(modelId: string): number {
  const model = ALL_MODELS.find(m => m.id === modelId)
  return model?.maxSeconds || 5
}

/**
 * Get duration options for a video model.
 * Uses model-specific durationOptions if defined, otherwise derives from maxSeconds.
 */
export function getVideoDurationOptions(modelId: string): { label: string; value: string }[] {
  const model = ALL_MODELS.find(m => m.id === modelId)

  // Use explicit duration options if the model defines them
  if (model?.durationOptions && model.durationOptions.length > 0) {
    return model.durationOptions.map(s => ({ label: `${s}s`, value: String(s) }))
  }

  // Fallback: derive from maxSeconds
  const max = getVideoMaxDuration(modelId)
  const options: { label: string; value: string }[] = []
  if (max >= 5) options.push({ label: '5s', value: '5' })
  if (max >= 8) options.push({ label: '8s', value: '8' })
  if (max >= 10) options.push({ label: '10s', value: '10' })
  return options.length > 0 ? options : [{ label: '5s', value: '5' }]
}

/**
 * Check if a video model supports camera motion.
 */
export function getVideoCameraMotionOptions(modelId: string): string[] | null {
  const model = ALL_MODELS.find(m => m.id === modelId)
  if (!model?.supportsCameraMotion || !model.cameraMotionOptions) return null
  return model.cameraMotionOptions
}

// ---------------------------------------------------------------------------
// Cost estimation
// ---------------------------------------------------------------------------

/** Blended average price per credit across all credit packs */
export const AVG_CREDIT_PRICE_USD = 0.035

/**
 * Estimate the API cost in USD for a single generation.
 * Parses the model's `togetherPrice` string to compute cost.
 */
export function estimateApiCostUsd(
  modelId: string,
  width?: number | null,
  height?: number | null,
  durationSeconds?: number | null
): number {
  const model = ALL_MODELS.find(m => m.id === modelId)
  if (!model) return 0

  const price = model.togetherPrice
  const rateMatch = price.match(/^\$([0-9.]+)\//)
  if (!rateMatch) return 0 // "Per-job pricing" or unknown

  const rate = parseFloat(rateMatch[1])

  if (price.endsWith('/MP')) {
    const w = width || 1024
    const h = height || 1024
    const megapixels = (w * h) / 1_000_000
    return rate * megapixels
  }

  if (price.endsWith('/s')) {
    const dur = durationSeconds || 6
    return rate * dur
  }

  // /video or /image — flat rate
  return rate
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export const DEFAULT_MODELS: Record<ModelCapability, string> = {
  'text-to-image': 'google/imagen-4.0-fast',
  'image-to-image': 'black-forest-labs/FLUX.1-kontext-pro',
  'text-to-video': 'google/veo-3.0-fast',
  'image-to-video': 'google/veo-3.0-fast',
}

export function getDefaultModel(capability: ModelCapability): string {
  return DEFAULT_MODELS[capability]
}

export function getModelsForCapability(cap: ModelCapability): AIModel[] {
  return ALL_MODELS.filter(m => m.enabled && m.capabilities.includes(cap))
}

export function getModelById(id: string): AIModel | undefined {
  return ALL_MODELS.find(m => m.id === id)
}

export function getModelCredits(id: string): number {
  const model = getModelById(id)
  return model?.credits ?? 0
}

export function getEnabledModels(type: 'image' | 'video'): AIModel[] {
  return ALL_MODELS.filter(m => m.enabled && m.type === type)
}

export function getModelsByCategory(category: ModelCategory): AIModel[] {
  return ALL_MODELS.filter(m => m.category === category)
}
