import type { TemplateCreate } from '@/types/database'

export const SEED_TEMPLATES: TemplateCreate[] = [
  // 1. Product Showcase (Image)
  {
    name: 'Product Showcase',
    slug: 'product-showcase',
    description: 'Professional product photography with studio lighting and clean backgrounds. Perfect for e-commerce listings and social media.',
    category: 'product',
    generation_type: 'image',
    recommended_model: 'google/flash-image-2.5',
    base_prompt: 'Professional product photo of a {product_type} on a {surface} surface, {lighting} lighting, clean {background} background, commercial photography, high detail, sharp focus, 8k quality',
    prompt_variables: [
      { key: 'product_type', label: 'Product Type', type: 'text', placeholder: 'e.g. perfume bottle, sneaker, watch', required: true },
      { key: 'surface', label: 'Surface', type: 'select', options: ['marble', 'wood', 'glass', 'concrete', 'fabric', 'metallic'], required: true },
      { key: 'lighting', label: 'Lighting', type: 'select', options: ['studio', 'natural', 'dramatic', 'soft', 'golden hour', 'neon'], required: true },
      { key: 'background', label: 'Background', type: 'select', options: ['white', 'gradient', 'blurred', 'dark', 'pastel', 'textured'], required: true },
    ],
    photo_slots: [
      { key: 'product', label: 'Product Photo', description: 'Upload a photo of your product to transform', required: true },
    ],
    platform_presets: [
      { platform: 'instagram_feed', aspect_ratio: '1:1', label: 'IG Feed' },
      { platform: 'instagram_story', aspect_ratio: '9:16', label: 'IG Story' },
      { platform: 'youtube_thumbnail', aspect_ratio: '16:9', label: 'YT Thumbnail' },
    ],
    default_aspect_ratio: '1:1',
    default_platform: 'instagram_feed',
    tags: ['product', 'e-commerce', 'photography', 'studio'],
    is_published: true,
    is_featured: true,
    sort_order: 1,
  },

  // 2. TikTok Product Reveal (Video)
  {
    name: 'TikTok Product Reveal',
    slug: 'tiktok-product-reveal',
    description: 'Dynamic product reveal video perfect for TikTok and Instagram Reels. Eye-catching transitions and motion.',
    category: 'product',
    generation_type: 'video',
    recommended_model: 'kwaivgI/kling-2.1-pro',
    base_prompt: 'Cinematic product reveal video of a {product_type}, {motion_style} camera movement, {visual_style} visual style, dramatic lighting with {color_accent} accents, professional commercial quality, smooth transitions',
    prompt_variables: [
      { key: 'product_type', label: 'Product Type', type: 'text', placeholder: 'e.g. sneaker, cosmetic, tech gadget', required: true },
      { key: 'motion_style', label: 'Camera Motion', type: 'select', options: ['slow orbit', 'dynamic zoom', 'smooth pan', 'dramatic reveal', 'floating rotation'], required: true },
      { key: 'visual_style', label: 'Visual Style', type: 'select', options: ['cinematic', 'minimalist', 'luxury', 'energetic', 'moody'], required: true },
      { key: 'color_accent', label: 'Color Accent', type: 'select', options: ['gold', 'neon', 'pastel', 'monochrome', 'vibrant'], required: true },
    ],
    photo_slots: [
      { key: 'product', label: 'Product Photo', description: 'Upload a clear product photo to animate', required: true },
    ],
    platform_presets: [
      { platform: 'tiktok', aspect_ratio: '9:16', label: 'TikTok' },
      { platform: 'instagram_reel', aspect_ratio: '9:16', label: 'IG Reel' },
    ],
    default_aspect_ratio: '9:16',
    default_platform: 'tiktok',
    tags: ['tiktok', 'video', 'product', 'reveal', 'reels'],
    is_published: true,
    is_featured: true,
    sort_order: 2,
  },

  // 3. Instagram Flat Lay (Image)
  {
    name: 'Instagram Flat Lay',
    slug: 'instagram-flat-lay',
    description: 'Aesthetic flat lay compositions for Instagram. Arrange your products with complementary props and backgrounds.',
    category: 'lifestyle',
    generation_type: 'image',
    recommended_model: 'google/flash-image-2.5',
    base_prompt: 'Aesthetic flat lay photography of {product_type} arranged with {props} on a {surface} surface, {style} style, overhead shot, Instagram-worthy composition, natural lighting, warm tones, high resolution',
    prompt_variables: [
      { key: 'product_type', label: 'Product Type', type: 'text', placeholder: 'e.g. skincare products, coffee set, stationery', required: true },
      { key: 'props', label: 'Props', type: 'text', placeholder: 'e.g. flowers, leaves, fabric swatches', required: false },
      { key: 'surface', label: 'Surface', type: 'select', options: ['marble', 'linen', 'wooden table', 'terrazzo', 'concrete', 'pastel paper'], required: true },
      { key: 'style', label: 'Style', type: 'select', options: ['minimal', 'cozy', 'luxurious', 'bohemian', 'modern', 'rustic'], required: true },
    ],
    photo_slots: [
      { key: 'product', label: 'Main Product', description: 'Upload your product photo for the flat lay', required: true },
    ],
    platform_presets: [
      { platform: 'instagram_feed', aspect_ratio: '1:1', label: 'IG Feed' },
      { platform: 'instagram_portrait', aspect_ratio: '4:5', label: 'IG Portrait' },
    ],
    default_aspect_ratio: '1:1',
    default_platform: 'instagram_feed',
    tags: ['instagram', 'flat-lay', 'lifestyle', 'aesthetic'],
    is_published: true,
    sort_order: 3,
  },

  // 4. Beauty Portrait (Image)
  {
    name: 'Beauty Portrait',
    slug: 'beauty-portrait',
    description: 'Stunning beauty and cosmetics portraits. Perfect for makeup brands, skincare campaigns, and beauty influencers.',
    category: 'beauty',
    generation_type: 'image',
    recommended_model: 'google/gemini-3-pro-image',
    base_prompt: 'High-end beauty portrait, {makeup_style} makeup look, {skin_finish} skin, {lighting} lighting, {mood} mood, beauty campaign quality, close-up shot, magazine editorial style, flawless retouching',
    prompt_variables: [
      { key: 'makeup_style', label: 'Makeup Style', type: 'select', options: ['natural', 'glam', 'editorial', 'bold', 'dewy', 'smoky eye'], required: true },
      { key: 'skin_finish', label: 'Skin Finish', type: 'select', options: ['dewy', 'matte', 'glowing', 'natural', 'porcelain'], required: true },
      { key: 'lighting', label: 'Lighting', type: 'select', options: ['butterfly', 'Rembrandt', 'ring light', 'natural window', 'studio softbox'], required: true },
      { key: 'mood', label: 'Mood', type: 'select', options: ['elegant', 'fierce', 'dreamy', 'fresh', 'dramatic'], required: true },
    ],
    photo_slots: [
      { key: 'portrait', label: 'Portrait Photo', description: 'Upload a portrait or headshot to enhance', required: true },
    ],
    platform_presets: [
      { platform: 'instagram_portrait', aspect_ratio: '4:5', label: 'IG Portrait' },
      { platform: 'instagram_story', aspect_ratio: '9:16', label: 'IG Story' },
    ],
    default_aspect_ratio: '4:5',
    default_platform: 'instagram_portrait',
    tags: ['beauty', 'portrait', 'cosmetics', 'makeup'],
    is_published: true,
    is_featured: true,
    sort_order: 4,
  },

  // 5. Before & After (Image)
  {
    name: 'Before & After',
    slug: 'before-and-after',
    description: 'Create compelling before & after transformations. Great for skincare, fitness, home renovation, and product demos.',
    category: 'product',
    generation_type: 'image',
    recommended_model: 'google/flash-image-2.5',
    base_prompt: 'Professional {transformation_type} transformation photo, {result_style} result, clean composition showing dramatic improvement, high quality commercial photography, {lighting} lighting, crisp detail',
    prompt_variables: [
      { key: 'transformation_type', label: 'Transformation Type', type: 'select', options: ['skincare', 'hair styling', 'room makeover', 'product upgrade', 'fitness', 'color correction'], required: true },
      { key: 'result_style', label: 'Result Style', type: 'select', options: ['dramatic', 'subtle', 'professional', 'luxurious', 'natural'], required: true },
      { key: 'lighting', label: 'Lighting', type: 'select', options: ['studio', 'natural', 'bright', 'warm', 'clinical'], required: true },
    ],
    photo_slots: [
      { key: 'before', label: 'Before Photo', description: 'Upload the "before" image', required: true },
    ],
    platform_presets: [
      { platform: 'instagram_feed', aspect_ratio: '1:1', label: 'IG Feed' },
      { platform: 'youtube_thumbnail', aspect_ratio: '16:9', label: 'YT Thumbnail' },
    ],
    default_aspect_ratio: '1:1',
    default_platform: 'instagram_feed',
    tags: ['before-after', 'transformation', 'comparison'],
    is_published: true,
    sort_order: 5,
  },

  // 6. Social Story Ad (Image)
  {
    name: 'Social Story Ad',
    slug: 'social-story-ad',
    description: 'Attention-grabbing story-format ads for Instagram and TikTok. Bold visuals designed to stop the scroll.',
    category: 'social',
    generation_type: 'image',
    recommended_model: 'google/gemini-3-pro-image',
    base_prompt: 'Eye-catching social media story ad featuring {product_type}, {visual_style} design style, {color_scheme} color scheme, bold typography space, {mood} vibe, vertical format, trendy and modern, scroll-stopping visual',
    prompt_variables: [
      { key: 'product_type', label: 'Product/Subject', type: 'text', placeholder: 'e.g. energy drink, fashion item, app screenshot', required: true },
      { key: 'visual_style', label: 'Visual Style', type: 'select', options: ['gradient', 'geometric', 'organic', 'retro', 'futuristic', 'minimalist'], required: true },
      { key: 'color_scheme', label: 'Color Scheme', type: 'select', options: ['vibrant', 'pastel', 'monochrome', 'neon', 'earth tones', 'brand colors'], required: true },
      { key: 'mood', label: 'Mood', type: 'select', options: ['energetic', 'calm', 'luxurious', 'playful', 'professional', 'edgy'], required: true },
    ],
    photo_slots: [
      { key: 'product', label: 'Product/Subject Photo', description: 'Upload the main subject for the ad', required: true },
    ],
    platform_presets: [
      { platform: 'instagram_story', aspect_ratio: '9:16', label: 'IG Story' },
      { platform: 'tiktok', aspect_ratio: '9:16', label: 'TikTok' },
    ],
    default_aspect_ratio: '9:16',
    default_platform: 'instagram_story',
    tags: ['social', 'story', 'ad', 'marketing', 'vertical'],
    is_published: true,
    sort_order: 6,
  },

  // 7. Product Lifestyle (Image)
  {
    name: 'Product Lifestyle',
    slug: 'product-lifestyle',
    description: 'Place your product in aspirational lifestyle scenes. Show your product being used in real-world contexts.',
    category: 'lifestyle',
    generation_type: 'image',
    recommended_model: 'google/flash-image-2.5',
    base_prompt: 'Lifestyle photography of {product_type} in a {scene} setting, {person_context}, {lighting} lighting, aspirational and authentic feel, editorial quality, warm color grading, depth of field',
    prompt_variables: [
      { key: 'product_type', label: 'Product Type', type: 'text', placeholder: 'e.g. coffee mug, laptop, running shoes', required: true },
      { key: 'scene', label: 'Scene', type: 'select', options: ['modern kitchen', 'cozy living room', 'outdoor cafe', 'beach', 'urban street', 'office desk', 'gym'], required: true },
      { key: 'person_context', label: 'Person Context', type: 'select', options: ['person using product', 'hands holding product', 'product in environment (no person)', 'group of friends with product'], required: true },
      { key: 'lighting', label: 'Lighting', type: 'select', options: ['natural', 'golden hour', 'bright and airy', 'moody', 'warm indoor'], required: true },
    ],
    photo_slots: [
      { key: 'product', label: 'Product Photo', description: 'Upload a clean product photo to place in scene', required: true },
    ],
    platform_presets: [
      { platform: 'instagram_feed', aspect_ratio: '1:1', label: 'IG Feed' },
      { platform: 'instagram_portrait', aspect_ratio: '4:5', label: 'IG Portrait' },
      { platform: 'youtube_thumbnail', aspect_ratio: '16:9', label: 'YT Thumbnail' },
    ],
    default_aspect_ratio: '1:1',
    default_platform: 'instagram_feed',
    tags: ['lifestyle', 'product', 'aspirational', 'scene'],
    is_published: true,
    sort_order: 7,
  },

  // 8. UGC-Style Video (Video)
  {
    name: 'UGC-Style Video',
    slug: 'ugc-style-video',
    description: 'Create authentic-looking user-generated content videos. Perfect for TikTok ads and influencer-style product demos.',
    category: 'ugc',
    generation_type: 'video',
    recommended_model: 'kwaivgI/kling-2.1-pro',
    base_prompt: 'Authentic UGC-style video of {product_type}, {action} action, {setting} setting, casual and relatable feel, {camera_style} camera style, natural lighting, trending social media content, authentic and unpolished aesthetic',
    prompt_variables: [
      { key: 'product_type', label: 'Product Type', type: 'text', placeholder: 'e.g. beauty product, snack, tech accessory', required: true },
      { key: 'action', label: 'Action', type: 'select', options: ['unboxing', 'trying on', 'taste testing', 'demonstrating', 'reviewing', 'morning routine'], required: true },
      { key: 'setting', label: 'Setting', type: 'select', options: ['bedroom', 'bathroom mirror', 'kitchen counter', 'outdoor', 'car', 'couch'], required: true },
      { key: 'camera_style', label: 'Camera Style', type: 'select', options: ['selfie angle', 'close-up detail', 'handheld casual', 'tripod POV', 'over-the-shoulder'], required: true },
    ],
    photo_slots: [
      { key: 'product', label: 'Product Photo', description: 'Upload a photo of the product for the UGC video', required: true },
    ],
    platform_presets: [
      { platform: 'tiktok', aspect_ratio: '9:16', label: 'TikTok' },
      { platform: 'instagram_reel', aspect_ratio: '9:16', label: 'IG Reel' },
    ],
    default_aspect_ratio: '9:16',
    default_platform: 'tiktok',
    tags: ['ugc', 'video', 'tiktok', 'authentic', 'influencer'],
    is_published: true,
    is_featured: true,
    sort_order: 8,
  },
]
