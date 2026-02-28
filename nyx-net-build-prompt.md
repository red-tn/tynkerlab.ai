# NYX-NET.COM — Complete Build Prompt for Claude Code

## PROJECT IDENTITY

**Site Name:** Nyx-Net.com
**Tagline:** "Create Beyond Imagination — AI-Powered Image & Video Generation"
**Brand Theme:** "Midnight Nexus" — Deep dark backgrounds (#0a0a0f base), electric purple-to-cyan gradients (#7c3aed → #06b6d4), with neon accent highlights. Think cyberpunk-meets-premium-SaaS. Dark mode default, light mode available.

---

## TECH STACK (Non-negotiable)

- **Framework:** Next.js 16+ (App Router, TypeScript, Server Components, Server Actions)
- **Database/Auth/Storage:** Appwrite Cloud (Documents/Collections, Auth with Email/Password + OAuth, Storage Buckets, Realtime subscriptions)
- **Payments:** Stripe (Subscriptions, One-time Credit Packs, Webhooks, Customer Portal)
- **AI Backend:** Together.ai API (Image Generation, Video Generation, Image-to-Image)
- **Styling:** Tailwind CSS 3.4+ with custom design tokens
- **Deployment:** Vercel (Edge Functions, ISR, Environment Variables)
- **State Management:** Zustand (lightweight global state)
- **File Storage:** Appwrite Storage (user uploads, generated media, avatars)
- **Analytics/Monitoring:** Custom admin dashboard with Appwrite Realtime + custom logging collections
- **Icons/UI:** Lucide React + custom SVG brand icons (generate unique Nyx-Net logos/icons — NO placeholders)

---

## ENVIRONMENT VARIABLES REQUIRED

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=nyx_net_db
NEXT_PUBLIC_APPWRITE_BUCKET_UPLOADS=uploads
NEXT_PUBLIC_APPWRITE_BUCKET_GENERATIONS=generations
NEXT_PUBLIC_APPWRITE_BUCKET_AVATARS=avatars

# Together.ai
TOGETHER_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://nyx-net.com
```

---

## COMPLETE FILE STRUCTURE

```
nyx-net/
├── public/
│   ├── logo.svg                    # Nyx-Net logo (generate a unique cyberpunk "N" monogram with purple-cyan gradient)
│   ├── logo-full.svg               # Full "Nyx-Net" wordmark
│   ├── favicon.ico                 # Derived from logo
│   ├── icon-text-to-image.svg      # Studio tool icons (unique, matching theme)
│   ├── icon-image-to-image.svg
│   ├── icon-text-to-video.svg
│   ├── icon-image-to-video.svg
│   └── og-image.png                # Open Graph preview
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: ThemeProvider, fonts, force-dynamic
│   │   ├── page.tsx                # Landing/home page
│   │   ├── globals.css             # Tailwind + custom CSS variables + animations
│   │   ├── loading.tsx             # Root loading state
│   │   ├── error.tsx               # Root error boundary
│   │   ├── not-found.tsx           # 404 page
│   │   ├── sitemap.ts              # Dynamic sitemap
│   │   ├── robots.ts               # SEO robots.txt
│   │   ├── (auth)/
│   │   │   ├── layout.tsx          # Auth layout with force-dynamic
│   │   │   ├── login/page.tsx      # Email/password + OAuth (Google, GitHub) login
│   │   │   ├── signup/page.tsx     # Registration with email verification
│   │   │   ├── callback/route.ts   # Appwrite OAuth callback handler
│   │   │   └── reset-password/page.tsx
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx          # Marketing layout with force-dynamic
│   │   │   ├── pricing/page.tsx    # Full pricing page (3 sub tiers + 4 credit packs)
│   │   │   └── prompts/page.tsx    # Public prompt gallery (populated from /admin)
│   │   ├── studio/
│   │   │   ├── layout.tsx          # Studio sidebar navigation + credit display
│   │   │   ├── loading.tsx         # Studio skeleton loading
│   │   │   ├── text-to-image/page.tsx
│   │   │   ├── image-to-image/page.tsx
│   │   │   ├── text-to-video/page.tsx
│   │   │   └── image-to-video/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Dashboard layout with navbar, auth-guarded
│   │   │   ├── loading.tsx         # Dashboard skeleton loading
│   │   │   ├── page.tsx            # User dashboard: recent generations, usage stats
│   │   │   ├── profile/page.tsx    # Full profile: avatar (AI-generated option), name, email, preferences
│   │   │   ├── gallery/page.tsx    # User's generated media gallery
│   │   │   └── subscription/page.tsx # Manage subscription, view credits, billing history
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Admin layout with sidebar, auth guard (admin role check)
│   │   │   ├── loading.tsx         # Admin skeleton loading
│   │   │   ├── page.tsx            # Admin dashboard: KPIs, charts, real-time stats
│   │   │   ├── users/page.tsx      # User management: search, view, edit, suspend, credit adjustments
│   │   │   ├── subscriptions/page.tsx # Subscription management, revenue analytics
│   │   │   ├── prompts/page.tsx    # CRUD for public prompt gallery
│   │   │   ├── monitoring/page.tsx # API health, Together.ai usage, error rates, latency
│   │   │   ├── analytics/page.tsx  # Page views, hits, user activity, admin vs non-admin visits
│   │   │   └── settings/page.tsx   # Site settings, feature flags, model config, pricing config
│   │   └── api/
│   │       ├── generate/
│   │       │   ├── image/route.ts         # Text-to-image + image-to-image endpoint
│   │       │   └── video/route.ts         # Text-to-video + image-to-video endpoint
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts      # Create checkout session
│   │       │   ├── portal/route.ts        # Customer billing portal
│   │       │   └── webhook/route.ts       # Stripe webhook handler
│   │       ├── admin/
│   │       │   ├── users/route.ts         # Admin user CRUD
│   │       │   ├── prompts/route.ts       # Admin prompt CRUD
│   │       │   ├── analytics/route.ts     # Analytics data endpoint
│   │       │   └── monitoring/route.ts    # API monitoring data
│   │       ├── together/
│   │       │   └── usage/route.ts         # Proxy for Together.ai usage stats
│   │       ├── profile/
│   │       │   ├── route.ts               # Profile CRUD
│   │       │   └── avatar/route.ts        # AI avatar generation endpoint
│   │       ├── credits/
│   │       │   └── check/route.ts         # Credit balance check middleware
│   │       └── analytics/
│   │           └── pageview/route.ts      # Fire-and-forget page view tracking
│   ├── components/
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── avatar.tsx
│   │   ├── layout/
│   │   │   ├── navbar.tsx          # Main navigation: logo, links, theme toggle, auth state, credits
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx         # Studio sidebar
│   │   │   └── admin-sidebar.tsx
│   │   ├── studio/
│   │   │   ├── prompt-input.tsx    # Shared prompt textarea with char count
│   │   │   ├── model-selector.tsx  # AI model dropdown with icons and descriptions
│   │   │   ├── aspect-ratio-picker.tsx
│   │   │   ├── resolution-picker.tsx
│   │   │   ├── duration-picker.tsx # Video duration selector
│   │   │   ├── image-upload.tsx    # Drag-and-drop image upload for image-to-* tools
│   │   │   ├── generation-result.tsx # Display generated image/video with download
│   │   │   ├── generation-history.tsx # Recent generations sidebar
│   │   │   └── credit-cost-display.tsx # Shows credit cost before generation
│   │   ├── admin/
│   │   │   ├── stats-card.tsx
│   │   │   ├── chart-wrapper.tsx   # Recharts wrapper for dashboard charts
│   │   │   ├── user-table.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   └── api-status-card.tsx
│   │   ├── pricing/
│   │   │   ├── pricing-card.tsx
│   │   │   ├── pricing-toggle.tsx  # Monthly/Annual toggle
│   │   │   └── credit-pack-card.tsx
│   │   ├── brand/
│   │   │   ├── logo.tsx            # Geometric "N" monogram with gradient
│   │   │   ├── logo-full.tsx       # Logo + "NYX-NET" wordmark
│   │   │   └── studio-icons.tsx    # 4 studio tool icons
│   │   ├── theme-toggle.tsx        # Dark/light mode toggle (dark default)
│   │   ├── auth-guard.tsx          # Route protection HOC
│   │   └── admin-guard.tsx         # Admin route protection HOC
│   ├── lib/
│   │   ├── appwrite/
│   │   │   ├── client.ts           # Browser Appwrite client (Client, Account, Databases, Storage)
│   │   │   └── server.ts           # Server Appwrite clients: createAdminClient() (API key), createSessionClient(session)
│   │   ├── together/
│   │   │   ├── client.ts           # Together.ai SDK wrapper
│   │   │   ├── image.ts            # Image generation functions (text-to-image, image-to-image)
│   │   │   ├── video.ts            # Video generation functions (text-to-video, image-to-video)
│   │   │   └── models.ts           # Model definitions, capabilities, credit costs
│   │   ├── stripe/
│   │   │   ├── client.ts           # Stripe SDK instance (lazy Proxy-based init)
│   │   │   ├── products.ts         # Product/price definitions matching tiers
│   │   │   └── webhooks.ts         # Webhook event handlers
│   │   ├── credits.ts              # Credit deduction, balance checking, refund logic
│   │   ├── analytics.ts            # Page view tracking, event logging
│   │   └── utils.ts                # Shared utilities (cn, formatDate, formatCurrency, formatNumber)
│   ├── hooks/
│   │   ├── use-auth.ts             # Auth state hook (user, profile, isLoading, isAuthenticated, isAdmin, signOut)
│   │   ├── use-credits.ts          # Credit balance hook with Appwrite Realtime subscription
│   │   ├── use-generation.ts       # Generation state management hook (idle→generating→polling→completed/failed)
│   │   └── use-theme.ts            # Theme toggle hook
│   ├── stores/
│   │   └── app-store.ts            # Zustand global store (user, studio, UI slices)
│   └── types/
│       ├── database.ts             # Appwrite document types (extends Models.Document)
│       ├── together.ts             # Together.ai API types
│       └── stripe.ts               # Stripe types
├── scripts/
│   └── setup-appwrite.ts           # Appwrite collection/bucket setup script
├── middleware.ts                    # Next.js middleware: auth, admin routes, analytics tracking
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example
```

---

## DATABASE SCHEMA (Appwrite Collections)

Appwrite uses a document-based model. Each "table" is a **collection** within a single database (ID: `nyx_net_db`). Documents use camelCase field names and extend Appwrite's base document type (which provides `$id`, `$createdAt`, `$updatedAt`, `$collectionId`, `$databaseId`). No SQL, no RLS — permissions are handled via Appwrite collection-level and document-level permissions, and admin operations use the server-side API key client.

### Collection: `profiles`
Stores user profile data. Created on first login/signup.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `userId` | string (255) | Yes | - | Appwrite Auth user ID |
| `email` | string (255) | Yes | - | User's email |
| `fullName` | string (255) | No | null | Display name |
| `avatarUrl` | string (2048) | No | null | Avatar image URL |
| `avatarPrompt` | string (2048) | No | null | Prompt used to generate AI avatar |
| `role` | enum ['user', 'admin'] | Yes | 'user' | User role |
| `creditsBalance` | integer | Yes | 0 | Current credit balance |
| `creditsMonthly` | integer | Yes | 0 | Credits from subscription this month |
| `subscriptionTier` | enum ['free', 'pro', 'enterprise'] | Yes | 'free' | Current tier |
| `stripeCustomerId` | string (255) | No | null | Stripe customer ID |
| `stripeSubscriptionId` | string (255) | No | null | Stripe subscription ID |
| `subscriptionStatus` | string (50) | No | null | 'active', 'past_due', 'cancelled', etc. |
| `subscriptionPeriod` | enum ['monthly', 'annual'] | No | null | Billing period |
| `currentPeriodEnd` | string (50) | No | null | ISO date string |
| `totalGenerations` | integer | Yes | 0 | Lifetime generation count |
| `totalImages` | integer | Yes | 0 | Lifetime image count |
| `totalVideos` | integer | Yes | 0 | Lifetime video count |
| `lastActiveAt` | string (50) | No | null | ISO date string |

### Collection: `generations`
All generated media (images and videos).

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `userId` | string (255) | Yes | - | Owner user ID |
| `type` | enum ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video'] | Yes | - | Generation type |
| `model` | string (255) | Yes | - | Together.ai model ID |
| `prompt` | string (5000) | No | null | User prompt |
| `negativePrompt` | string (2000) | No | null | Negative prompt |
| `inputImageUrl` | string (2048) | No | null | For image-to-* tools |
| `outputUrl` | string (2048) | No | null | Generated media URL (Appwrite Storage) |
| `outputThumbnailUrl` | string (2048) | No | null | Thumbnail URL |
| `width` | integer | No | null | Output width |
| `height` | integer | No | null | Output height |
| `durationSeconds` | integer | No | null | For video |
| `resolution` | string (50) | No | null | e.g. "1024x1024" |
| `aspectRatio` | string (20) | No | null | e.g. "16:9" |
| `steps` | integer | No | null | Inference steps |
| `seed` | integer | No | null | Random seed |
| `creditsUsed` | integer | Yes | 0 | Credits deducted |
| `status` | enum ['pending', 'processing', 'completed', 'failed'] | Yes | 'pending' | Generation status |
| `errorMessage` | string (2000) | No | null | Error details |
| `togetherJobId` | string (255) | No | null | For async video jobs |
| `metadata` | string (10000) | No | null | JSON string for extra data |
| `completedAt` | string (50) | No | null | ISO date string |

### Collection: `credit_transactions`
Immutable audit trail for all credit changes.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `userId` | string (255) | Yes | - | User ID |
| `amount` | integer | Yes | - | Positive = credit, negative = debit |
| `type` | enum ['subscription_renewal', 'credit_pack_purchase', 'generation_debit', 'admin_adjustment', 'refund'] | Yes | - | Transaction type |
| `description` | string (500) | No | null | Human-readable description |
| `referenceId` | string (255) | No | null | Stripe payment ID or generation ID |
| `balanceAfter` | integer | Yes | - | Balance after this transaction |

### Collection: `subscriptions`
Mirrors Stripe subscription state.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `userId` | string (255) | Yes | - | User ID |
| `stripeSubscriptionId` | string (255) | Yes | - | Stripe subscription ID |
| `stripeCustomerId` | string (255) | Yes | - | Stripe customer ID |
| `tier` | enum ['pro', 'enterprise'] | Yes | - | Subscription tier |
| `period` | enum ['monthly', 'annual'] | Yes | - | Billing period |
| `status` | string (50) | Yes | 'active' | 'active', 'past_due', 'cancelled' |
| `creditsPerMonth` | integer | Yes | - | Monthly credit allotment |
| `priceMonthly` | float | No | null | Monthly price |
| `priceAnnual` | float | No | null | Annual price |
| `currentPeriodStart` | string (50) | No | null | ISO date string |
| `currentPeriodEnd` | string (50) | No | null | ISO date string |
| `cancelAtPeriodEnd` | boolean | No | false | Whether sub cancels at period end |

### Collection: `credit_pack_purchases`
One-time credit pack purchases.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `userId` | string (255) | Yes | - | User ID |
| `packName` | string (100) | Yes | - | Pack name (Starter, Growth, etc.) |
| `creditsAmount` | integer | Yes | - | Credits in the pack |
| `price` | float | Yes | - | Price paid |
| `stripePaymentIntentId` | string (255) | No | null | Stripe payment intent |
| `stripeCheckoutSessionId` | string (255) | No | null | Stripe checkout session |
| `status` | string (50) | No | 'completed' | Purchase status |
| `expiresAt` | string (50) | No | null | ISO date (1 year from purchase) |

### Collection: `prompts`
Admin-managed prompt gallery.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `title` | string (255) | Yes | - | Prompt title |
| `promptText` | string (5000) | Yes | - | The actual prompt text |
| `category` | enum ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video', 'general'] | Yes | - | Category |
| `modelType` | enum ['image', 'video'] | Yes | - | Model type |
| `tags` | string[] | No | [] | Tags array |
| `previewImageUrl` | string (2048) | No | null | Preview image |
| `modelUsed` | string (255) | No | null | Model used to generate |
| `isFeatured` | boolean | No | false | Featured flag |
| `isPublished` | boolean | No | true | Published flag |
| `usageCount` | integer | No | 0 | Times used |
| `sortOrder` | integer | No | 0 | Display order |
| `createdBy` | string (255) | No | null | Admin user ID |

### Collection: `page_views`
Page analytics tracking.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `path` | string (500) | Yes | - | URL path |
| `userId` | string (255) | No | null | Logged-in user ID |
| `isAdmin` | boolean | No | false | Whether user is admin |
| `sessionId` | string (255) | No | null | Session identifier |
| `referrer` | string (2048) | No | null | HTTP referrer |
| `userAgent` | string (500) | No | null | Browser user agent |
| `ipHash` | string (128) | No | null | SHA-256 hashed IP (not raw) |
| `country` | string (10) | No | null | Country code |

### Collection: `api_usage_log`
Together.ai API usage tracking for monitoring.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `userId` | string (255) | No | null | User who triggered the request |
| `endpoint` | string (255) | Yes | - | 'images/generations', 'v2/videos', etc. |
| `model` | string (255) | Yes | - | Model ID |
| `requestType` | string (50) | Yes | - | 'text-to-image', 'image-to-video', etc. |
| `tokensUsed` | integer | No | null | Tokens consumed |
| `costEstimate` | float | No | null | Estimated USD cost |
| `latencyMs` | integer | No | null | Request latency in ms |
| `statusCode` | integer | No | null | HTTP status code |
| `error` | string (2000) | No | null | Error message |
| `requestMetadata` | string (5000) | No | null | JSON string |

### Collection: `admin_activity_log`
Audit trail for admin actions.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `adminId` | string (255) | Yes | - | Admin user ID |
| `action` | string (255) | Yes | - | Action performed |
| `targetType` | string (50) | No | null | 'user', 'prompt', 'setting', etc. |
| `targetId` | string (255) | No | null | Target document ID |
| `details` | string (5000) | No | null | JSON string with details |

### Collection: `site_settings`
Key-value configuration store.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `key` | string (100) | Yes | - | Setting key (unique) |
| `value` | string (50000) | Yes | - | JSON string value |
| `description` | string (500) | No | null | Human-readable description |
| `updatedBy` | string (255) | No | null | Last admin to update |

### Appwrite Storage Buckets

| Bucket ID | Purpose | Max File Size | Allowed Extensions |
|---|---|---|---|
| `uploads` | User-uploaded images for image-to-* tools | 10MB | jpg, jpeg, png, webp, gif |
| `generations` | Generated images and videos | 100MB | jpg, jpeg, png, webp, mp4, webm |
| `avatars` | User avatar images (uploaded or AI-generated) | 5MB | jpg, jpeg, png, webp |

### Appwrite Auth Configuration

- **Email/Password**: Enabled with email verification
- **OAuth Providers**: Google, GitHub
- **Session Duration**: Default (1 year)
- **Password Policy**: Minimum 8 characters

### Default Site Settings (seed data)

```json
{
  "models_config": {
    "image": [
      "google/imagen-4.0-preview",
      "google/imagen-4.0-fast",
      "google/imagen-4.0-ultra",
      "google/flash-image-2.5",
      "google/gemini-3-pro-image",
      "black-forest-labs/FLUX.2-pro",
      "black-forest-labs/FLUX.2-dev",
      "black-forest-labs/FLUX.2-flex",
      "black-forest-labs/FLUX.2-max",
      "black-forest-labs/FLUX.1.1-pro",
      "black-forest-labs/FLUX.1-schnell",
      "black-forest-labs/FLUX.1-dev",
      "black-forest-labs/FLUX.1-kontext-pro",
      "black-forest-labs/FLUX.1-kontext-max",
      "black-forest-labs/FLUX.1-kontext-dev",
      "black-forest-labs/FLUX.1-krea-dev",
      "black-forest-labs/FLUX.1-canny-pro",
      "ByteDance-Seed/Seedream-4.0",
      "ByteDance-Seed/Seedream-3.0",
      "ByteDance/SeedEdit",
      "Qwen/Qwen-Image",
      "Qwen/Qwen-Image-Edit",
      "Wan-AI/Wan-2.6-Image",
      "ideogram/ideogram-3.0",
      "HiDream-ai/HiDream-I1-Full",
      "HiDream-ai/HiDream-I1-Dev",
      "HiDream-ai/HiDream-I1-Fast",
      "RunDiffusion/Juggernaut-pro-flux",
      "Rundiffusion/Juggernaut-Lightning-Flux",
      "stabilityai/stable-diffusion-3-medium",
      "stabilityai/stable-diffusion-xl-base-1.0",
      "Lykon/DreamShaper"
    ],
    "video": [
      "google/veo-3.0",
      "google/veo-3.0-audio",
      "google/veo-3.0-fast",
      "google/veo-3.0-fast-audio",
      "google/veo-2.0",
      "openai/sora-2",
      "openai/sora-2-pro",
      "minimax/video-01-director",
      "minimax/hailuo-02",
      "ByteDance/Seedance-1.0-pro",
      "ByteDance/Seedance-1.0-lite",
      "kwaivgI/kling-2.1-master",
      "kwaivgI/kling-2.1-pro",
      "kwaivgI/kling-2.1-standard",
      "kwaivgI/kling-2.0-master",
      "kwaivgI/kling-1.6-pro",
      "kwaivgI/kling-1.6-standard",
      "pixverse/pixverse-v5",
      "Wan-AI/Wan2.2-T2V-A14B",
      "Wan-AI/Wan2.2-I2V-A14B",
      "vidu/vidu-2.0",
      "vidu/vidu-q1"
    ]
  },
  "feature_flags": {
    "text_to_image": true,
    "image_to_image": true,
    "text_to_video": true,
    "image_to_video": true,
    "prompt_gallery": true
  },
  "maintenance_mode": false
}
```

### Credit Operations (No Atomic SQL — Sequential Pattern)

Appwrite does not support SQL transactions or stored procedures. Credit operations use a sequential read-update-log pattern:

```typescript
// Deduct credits
async function deductCredits(userId: string, amount: number, description: string, referenceId?: string) {
  const { databases } = createAdminClient()
  // 1. Read current balance
  const profile = await databases.getDocument(DATABASE_ID, 'profiles', profileDocId)
  if (profile.creditsBalance < amount) throw new Error('Insufficient credits')
  // 2. Update balance
  await databases.updateDocument(DATABASE_ID, 'profiles', profileDocId, {
    creditsBalance: profile.creditsBalance - amount
  })
  // 3. Log transaction
  await databases.createDocument(DATABASE_ID, 'credit_transactions', ID.unique(), {
    userId, amount: -amount, type: 'generation_debit', description, referenceId,
    balanceAfter: profile.creditsBalance - amount
  })
}

// Add credits
async function addCredits(userId: string, amount: number, description: string, referenceId?: string, type?: string) {
  const { databases } = createAdminClient()
  const profile = await databases.getDocument(DATABASE_ID, 'profiles', profileDocId)
  await databases.updateDocument(DATABASE_ID, 'profiles', profileDocId, {
    creditsBalance: profile.creditsBalance + amount
  })
  await databases.createDocument(DATABASE_ID, 'credit_transactions', ID.unique(), {
    userId, amount, type: type || 'admin_adjustment', description, referenceId,
    balanceAfter: profile.creditsBalance + amount
  })
}
```

### Appwrite Setup Script (`scripts/setup-appwrite.ts`)

A TypeScript script that creates:
1. The database (`nyx_net_db`)
2. All 10 collections with their attributes and indexes
3. All 3 storage buckets with size limits and allowed extensions
4. Default site settings documents

Run with: `npx tsx scripts/setup-appwrite.ts` (requires `dotenv` installed)

---

## TOGETHER.AI API INTEGRATION DETAILS

### Image Generation (Text-to-Image & Image-to-Image)

**Endpoint:** `POST https://api.together.xyz/v1/images/generations`

```typescript
// Text-to-Image (works with ALL image models)
const response = await together.images.generate({
  model: "black-forest-labs/FLUX.2-pro",  // or any image model
  prompt: "user prompt here",
  width: 1024,
  height: 1024,
  steps: 28,           // optional, model-dependent
  n: 1,                // 1-4 variations
  response_format: "url", // or "base64"
  seed: optionalSeed,
  negative_prompt: optionalNegativePrompt,
});
// Returns: response.data[0].url

// Image-to-Image (only works with I2I-capable models — see table below)
// Pattern 1: FLUX Kontext models (best for editing/reference)
const response = await together.images.generate({
  model: "black-forest-labs/FLUX.1-kontext-pro",
  prompt: "Transform this into a watercolor painting",
  image_url: "https://cloud.appwrite.io/v1/storage/buckets/.../files/.../view",
  width: 1024,
  height: 768,
});

// Pattern 2: Google models (Nano Banana, Gemini Pro Image)
const response = await together.images.generate({
  model: "google/gemini-3-pro-image",
  prompt: "Add a sunset sky background to this photo",
  image_url: "https://cloud.appwrite.io/v1/storage/buckets/.../files/.../view",
});

// Pattern 3: ByteDance SeedEdit (specialized editing)
const response = await together.images.generate({
  model: "ByteDance/SeedEdit",
  prompt: "Change the person's shirt to blue",
  image_url: "https://cloud.appwrite.io/v1/storage/buckets/.../files/.../view",
});

// Pattern 4: Qwen Image Edit (cheapest editing option)
const response = await together.images.generate({
  model: "Qwen/Qwen-Image-Edit",
  prompt: "Remove the background",
  image_url: "https://cloud.appwrite.io/v1/storage/buckets/.../files/.../view",
});
```

**Available Image Models — COMPLETE TOGETHER.AI CATALOG (include ALL in model selector):**

Organize in the UI with category groupings: "Google", "Black Forest Labs / FLUX", "ByteDance", "Qwen / Alibaba", "Wan-AI", "Ideogram", "HiDream", "RunDiffusion", "Stability AI", "Lykon"

| Model ID (API String) | Display Name | Together.ai Price | Nyx Credits | Category | Supports image_url (I2I) | Default Steps | Notes |
|---|---|---|---|---|---|---|---|
| `google/imagen-4.0-ultra` | Imagen 4.0 Ultra | $0.06/MP | 25 | Google | No | - | Highest quality Google model |
| `google/imagen-4.0-preview` | Imagen 4.0 Preview | $0.04/MP | 15 | Google | No | - | Production-grade, 4MP, 8 ref images |
| `google/imagen-4.0-fast` | Imagen 4.0 Fast | $0.02/MP | 8 | Google | No | - | Fast generation |
| `google/flash-image-2.5` | Flash Image 2.5 (Nano Banana) | $0.039/MP | 15 | Google | Yes | - | Versatile, natural language editing |
| `google/gemini-3-pro-image` | Gemini 3 Pro Image (Nano Banana 2) | $0.134/image (1-2K), $0.24/image (4K) | 20 | Google | Yes | - | SOTA text rendering, up to 4K, 14-image composition |
| `black-forest-labs/FLUX.2-pro` | FLUX.2 Pro | $0.05/MP | 20 | FLUX | Yes | - | Latest FLUX, highest quality |
| `black-forest-labs/FLUX.2-dev` | FLUX.2 Dev | $0.025/MP | 10 | FLUX | Yes | - | Dev variant |
| `black-forest-labs/FLUX.2-flex` | FLUX.2 Flex | $0.025/MP | 10 | FLUX | Yes | - | Flexible variant |
| `black-forest-labs/FLUX.2-max` | FLUX.2 Max | $0.07/MP | 25 | FLUX | Yes | 50 | Maximum quality |
| `black-forest-labs/FLUX.1.1-pro` | FLUX 1.1 Pro | $0.04/MP | 15 | FLUX | Yes | - | Premium quality |
| `black-forest-labs/FLUX.1-schnell` | FLUX.1 Schnell | $0.0027/MP | 3 | FLUX | No | 4 | Fast, cheap, great starter |
| `black-forest-labs/FLUX.1-dev` | FLUX.1 Dev | $0.025/MP | 8 | FLUX | No | 28 | Dev model |
| `black-forest-labs/FLUX.1-kontext-pro` | FLUX Kontext Pro | $0.04/MP | 15 | FLUX | **Yes** (primary I2I) | 28 | Best for image editing/reference |
| `black-forest-labs/FLUX.1-kontext-max` | FLUX Kontext Max | $0.08/MP | 25 | FLUX | **Yes** (primary I2I) | 28 | Max quality image editing |
| `black-forest-labs/FLUX.1-kontext-dev` | FLUX Kontext Dev | $0.025/MP | 10 | FLUX | **Yes** (primary I2I) | 28 | Dev image editing |
| `black-forest-labs/FLUX.1-krea-dev` | FLUX.1 Krea Dev | $0.025/MP | 10 | FLUX | Yes | 30 | Creative variant |
| `black-forest-labs/FLUX.1-canny-pro` | FLUX.1 Canny Pro | $0.05/MP | 18 | FLUX | **Yes** (edge-guided) | - | Canny edge-guided generation |
| `ByteDance-Seed/Seedream-4.0` | Seedream 4.0 | $0.03/MP | 12 | ByteDance | Yes | - | High quality, text integration |
| `ByteDance-Seed/Seedream-3.0` | Seedream 3.0 | $0.018/MP | 8 | ByteDance | Yes | - | Good quality, affordable |
| `ByteDance/SeedEdit` | SeedEdit | $0.03/MP | 12 | ByteDance | **Yes** (editing) | - | Specialized image editing |
| `Qwen/Qwen-Image` | Qwen Image | $0.0058/MP | 5 | Qwen | No | - | Alibaba's image model |
| `Qwen/Qwen-Image-Edit` | Qwen Image Edit | $0.0032/MP | 3 | Qwen | **Yes** (editing) | - | Cheap image editing |
| `Wan-AI/Wan-2.6-Image` | Wan 2.6 Image | $0.03/MP | 12 | Wan-AI | Yes | - | Multi-reference support, style transfer |
| `ideogram/ideogram-3.0` | Ideogram 3.0 | $0.06/MP | 22 | Ideogram | No | - | Excellent text in images |
| `HiDream-ai/HiDream-I1-Full` | HiDream I1 Full | $0.009/MP | 5 | HiDream | No | - | Full quality |
| `HiDream-ai/HiDream-I1-Dev` | HiDream I1 Dev | $0.0045/MP | 3 | HiDream | No | - | Dev variant |
| `HiDream-ai/HiDream-I1-Fast` | HiDream I1 Fast | $0.0032/MP | 2 | HiDream | No | - | Fastest HiDream |
| `RunDiffusion/Juggernaut-pro-flux` | Juggernaut Pro | $0.0049/MP | 3 | RunDiffusion | No | - | Photorealistic |
| `Rundiffusion/Juggernaut-Lightning-Flux` | Juggernaut Lightning | $0.0017/MP | 2 | RunDiffusion | No | - | Ultra-fast |
| `stabilityai/stable-diffusion-3-medium` | Stable Diffusion 3 | $0.0019/MP | 2 | Stability AI | No | - | SD3 medium |
| `stabilityai/stable-diffusion-xl-base-1.0` | SDXL Base 1.0 | $0.0019/MP | 2 | Stability AI | No | - | Classic SDXL |
| `Lykon/DreamShaper` | DreamShaper | $0.0006/MP | 1 | Lykon | No | - | Cheapest, artistic |

**Image-to-Image Capable Models (show these in /studio/image-to-image model selector):**
The following models accept `image_url` parameter for reference/editing: FLUX Kontext Pro/Max/Dev, FLUX.1 Canny Pro, FLUX Krea Dev, Flash Image 2.5 (Nano Banana), Gemini 3 Pro Image, Seedream 3.0/4.0, SeedEdit, Qwen Image Edit, Wan 2.6 Image, FLUX.2 Pro/Dev/Flex/Max, FLUX 1.1 Pro.

For Text-to-Image (`/studio/text-to-image`): Show ALL models.
For Image-to-Image (`/studio/image-to-image`): Show ONLY models that support `image_url` parameter.

### Video Generation (Text-to-Video & Image-to-Video)

**Endpoint:** `POST https://api.together.xyz/v2/videos` (async job-based — see video model table below for full code patterns)

**Available Video Models — COMPLETE TOGETHER.AI CATALOG (include ALL in model selector):**

Organize in the UI with category groupings: "Google Veo", "OpenAI Sora", "MiniMax / Hailuo", "ByteDance Seedance", "Kuaishou Kling", "PixVerse", "Wan-AI", "Vidu"

| Model ID (API String) | Display Name | Together.ai Price/Video | Nyx Credits | Resolution | Duration | Audio | Category | Supports frame_images (I2V) |
|---|---|---|---|---|---|---|---|---|
| `google/veo-3.0` | Google Veo 3.0 | $1.60 | 50 | 720p | 8s | No | Google | Yes |
| `google/veo-3.0-audio` | Google Veo 3.0 + Audio | $3.20 | 90 | 720p | 8s | **Yes** | Google | Yes |
| `google/veo-3.0-fast` | Google Veo 3.0 Fast | $0.80 | 30 | 1080p | 8s | No | Google | Yes |
| `google/veo-3.0-fast-audio` | Google Veo 3.0 Fast + Audio | $1.20 | 40 | 1080p | 8s | **Yes** | Google | Yes |
| `google/veo-2.0` | Google Veo 2.0 | $2.50 | 70 | 720p | 5s | No | Google | Yes |
| `openai/sora-2` | Sora 2 | $0.80 | 30 | 720p | 8s | No | OpenAI | Yes |
| `openai/sora-2-pro` | Sora 2 Pro | $2.40 | 75 | 1080p | 8s | No | OpenAI | Yes |
| `minimax/video-01-director` | MiniMax Director | $0.28 | 12 | 720p | 5s | No | MiniMax | Yes |
| `minimax/hailuo-02` | Hailuo 02 | $0.49 | 18 | 768p | 10s | No | MiniMax | Yes |
| `ByteDance/Seedance-1.0-pro` | Seedance 1.0 Pro | $0.57 | 20 | 1080p | 5s | No | ByteDance | Yes |
| `ByteDance/Seedance-1.0-lite` | Seedance 1.0 Lite | $0.14 | 6 | 720p | 5s | No | ByteDance | Yes |
| `kwaivgI/kling-2.1-master` | Kling 2.1 Master | $0.92 | 30 | 1080p | 5s | No | Kling | Yes |
| `kwaivgI/kling-2.1-pro` | Kling 2.1 Pro | $0.32 | 12 | 1080p | 5s | No | Kling | Yes |
| `kwaivgI/kling-2.1-standard` | Kling 2.1 Standard | $0.18 | 8 | 720p | 5s | No | Kling | Yes |
| `kwaivgI/kling-2.0-master` | Kling 2.0 Master | $0.92 | 30 | 1080p | 5s | No | Kling | Yes |
| `kwaivgI/kling-1.6-pro` | Kling 1.6 Pro | $0.32 | 12 | 1080p | 5s | No | Kling | Yes |
| `kwaivgI/kling-1.6-standard` | Kling 1.6 Standard | $0.19 | 8 | 720p | 5s | No | Kling | Yes |
| `pixverse/pixverse-v5` | PixVerse V5 | $0.30 | 12 | 1080p | 5s | No | PixVerse | Yes |
| `Wan-AI/Wan2.2-T2V-A14B` | Wan 2.2 Text-to-Video | $0.66 | 22 | - | - | No | Wan-AI | No (T2V only) |
| `Wan-AI/Wan2.2-I2V-A14B` | Wan 2.2 Image-to-Video | $0.31 | 12 | - | - | No | Wan-AI | **Yes** (I2V only) |
| `vidu/vidu-2.0` | Vidu 2.0 | $0.28 | 12 | 720p | 8s | No | Vidu | Yes |
| `vidu/vidu-q1` | Vidu Q1 | $0.22 | 10 | 1080p | 5s | No | Vidu | Yes |

**Text-to-Video Capable Models (show in /studio/text-to-video):**
ALL models above accept `prompt` for text-to-video EXCEPT `Wan-AI/Wan2.2-I2V-A14B` (image-to-video only).

**Image-to-Video Capable Models (show in /studio/image-to-video):**
ALL models above accept `frame_images` for image-to-video EXCEPT `Wan-AI/Wan2.2-T2V-A14B` (text-to-video only).

**Video API Call Pattern:**
```typescript
// Text-to-Video
const job = await together.videos.create({
  model: "google/veo-3.0",
  prompt: "A serene sunset over the ocean with gentle waves",
  width: 1366,   // optional, model-dependent
  height: 768,   // optional, model-dependent
});

// Image-to-Video
const job = await together.videos.create({
  model: "google/veo-3.0",
  prompt: "optional motion/animation description",
  frame_images: [{
    input_image: "https://cloud.appwrite.io/v1/storage/buckets/.../files/.../view",
  }],
});

// Poll for completion (REQUIRED — video generation is async)
let status = await together.videos.retrieve(job.id);
while (status.status !== "completed" && status.status !== "failed") {
  await new Promise(r => setTimeout(r, 5000)); // wait 5s
  status = await together.videos.retrieve(job.id);
}
if (status.status === "completed") {
  const videoUrl = status.outputs.video_url;
}
```

---

## PRICING TIERS

### Subscription Plans

| Tier | Monthly Price | Annual Price (50% off) | Credits/Month | Features |
|---|---|---|---|---|
| **Free** | $0/mo | - | 0 | Basic access, all models, watermarked |
| **Pro** | $20/mo | $120/yr ($10/mo) | 2,000 | All models, no watermarks, priority speed, commercial license |
| **Enterprise** | $99/mo | $594/yr ($49.50/mo) | 12,000 | All models, no watermarks, fastest speed, commercial license, priority support, API access |

**All paid tiers include:**
- All available AI image models (32 models)
- All available AI video models (22 models)
- No watermarks
- Commercial use license
- Customer support (escalating with tier)

### Credit Packs (One-time, stack with subscription)

| Pack | Price | Credits | Price Per Credit | Expires |
|---|---|---|---|---|
| **Starter** | $5 | 100 | $0.050 | 1 year |
| **Growth** | $20 | 500 | $0.040 | 1 year |
| **Professional** | $60 | 2,000 | $0.030 | 1 year |
| **Max** | $125 | 5,000 | $0.025 | 1 year |

### Credit Costs Per Generation

Credit costs are mapped to Together.ai's actual pricing. The formula is:
`Nyx Credits = ceil(Together.ai_cost_USD × credit_multiplier)`
where `credit_multiplier` is calibrated so $1 of Together.ai cost ≈ 30-35 Nyx credits.

**Image Generation Credits (by model tier):**

| Tier | Models | Credits/Image (1MP) |
|---|---|---|
| **Budget** (< $0.005/MP) | DreamShaper, Juggernaut Lightning, SDXL, SD3, HiDream Fast, Qwen Image Edit | 1-2 |
| **Standard** ($0.005-$0.015/MP) | FLUX.1 Schnell, HiDream Full/Dev, Juggernaut Pro, Qwen Image, Seedream 3.0 | 3-5 |
| **Premium** ($0.02-$0.04/MP) | FLUX.1 Dev/Kontext Dev/Krea Dev, FLUX.2 Dev/Flex, Imagen 4.0 Fast, Seedream 4.0, SeedEdit, Wan 2.6, FLUX Kontext Pro, FLUX 1.1 Pro, Flash Image 2.5, Imagen 4.0 Preview | 8-15 |
| **Ultra** ($0.05+/MP) | FLUX.2 Pro, FLUX.1 Canny Pro, FLUX Kontext Max, FLUX.2 Max, Imagen 4.0 Ultra, Ideogram 3.0, Gemini 3 Pro Image | 18-30 |

**Video Generation Credits (by model):**

| Tier | Models | Credits/Video |
|---|---|---|
| **Budget** (< $0.25) | Seedance Lite, Kling 2.1/1.6 Standard | 5-8 |
| **Standard** ($0.25-$0.50) | MiniMax Director, Vidu Q1, Vidu 2.0, PixVerse V5, Kling 2.1/1.6 Pro, Wan 2.2 I2V | 10-18 |
| **Premium** ($0.50-$1.00) | Hailuo 02, Seedance Pro, Sora 2, Wan 2.2 T2V, Veo 3.0 Fast, Kling 2.1/2.0 Master | 20-35 |
| **Ultra** ($1.00+) | Veo 3.0, Veo 3.0 Fast Audio, Veo 3.0 Audio, Sora 2 Pro, Veo 2.0 | 40-90 |

The exact credit-to-cost mapping should be stored in `site_settings` and configurable from `/admin/settings` so you can adjust margins without code changes.

### models.ts — Master Model Registry

The file `src/lib/together/models.ts` must export a complete typed registry of ALL models. This is the single source of truth for the entire app. Example structure:

```typescript
export type ModelCapability = 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video';
export type ModelCategory = 'google' | 'flux' | 'bytedance' | 'qwen' | 'wan' | 'ideogram' | 'hidream' | 'rundiffusion' | 'stability' | 'lykon' | 'openai' | 'minimax' | 'kling' | 'pixverse' | 'vidu';

export interface AIModel {
  id: string;                    // Together.ai API string
  displayName: string;
  category: ModelCategory;
  categoryLabel: string;         // "Google", "Black Forest Labs", etc.
  type: 'image' | 'video';
  capabilities: ModelCapability[];
  credits: number;               // Nyx credits per generation
  togetherPrice: string;         // Display string like "$0.04/MP" or "$1.60/video"
  resolution?: string;           // "Up to 4K", "720p", "1080p"
  duration?: string;             // For video: "5s", "8s", "10s"
  hasAudio?: boolean;            // For video models with audio
  defaultSteps?: number;         // For image models
  supportsImageUrl?: boolean;    // Can accept reference image (I2I)
  supportsFrameImages?: boolean; // Can accept frame images (I2V)
  description: string;           // One-line description for UI
  badge?: string;                // "NEW", "POPULAR", "FAST", "CHEAPEST"
  enabled: boolean;              // Toggle from admin
  aspectRatios: string[];        // Supported aspect ratios
  maxWidth?: number;
  maxHeight?: number;
}

export const IMAGE_MODELS: AIModel[] = [
  {
    id: 'google/gemini-3-pro-image',
    displayName: 'Gemini 3 Pro Image',
    category: 'google',
    categoryLabel: 'Google',
    type: 'image',
    capabilities: ['text-to-image', 'image-to-image'],
    credits: 20,
    togetherPrice: '$0.134/image',
    resolution: 'Up to 4K',
    supportsImageUrl: true,
    description: 'SOTA text rendering, 4K output, 14-image composition',
    badge: 'NEW',
    enabled: true,
    aspectRatios: ['1:1', '3:2', '2:3', '4:3', '3:4', '4:5', '5:4', '9:16', '16:9', '21:9'],
  },
  // ... ALL 31 image models listed above ...
];

export const VIDEO_MODELS: AIModel[] = [
  {
    id: 'google/veo-3.0-audio',
    displayName: 'Veo 3.0 + Audio',
    category: 'google',
    categoryLabel: 'Google',
    type: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    credits: 90,
    togetherPrice: '$3.20/video',
    resolution: '720p',
    duration: '8s',
    hasAudio: true,
    supportsFrameImages: true,
    description: 'Premium video with synchronized audio generation',
    badge: 'NEW',
    enabled: true,
    aspectRatios: ['16:9', '9:16', '1:1'],
  },
  // ... ALL 22 video models listed above ...
];

export const ALL_MODELS = [...IMAGE_MODELS, ...VIDEO_MODELS];

// Helper functions
export function getModelsForCapability(cap: ModelCapability): AIModel[] { ... }
export function getModelById(id: string): AIModel | undefined { ... }
export function getModelCredits(id: string): number { ... }
export function getEnabledModels(type: 'image' | 'video'): AIModel[] { ... }
export function getModelsByCategory(category: ModelCategory): AIModel[] { ... }
```

**CRITICAL:** Every single model from both tables above must be in this registry. The model selector components read from this registry. The admin settings page can toggle `enabled` per model. Credit costs can be overridden from admin.

---

## STRIPE INTEGRATION DETAILS

### Products to Create in Stripe:

**Subscription Products (each with monthly + annual price):**
1. `nyx_pro` — Pro Plan ($20/mo or $120/yr)
2. `nyx_enterprise` — Enterprise Plan ($99/mo or $594/yr)

**One-time Products:**
1. `nyx_starter_pack` — 100 credits — $5
2. `nyx_growth_pack` — 500 credits — $20
3. `nyx_pro_pack` — 2,000 credits — $60
4. `nyx_max_pack` — 5,000 credits — $125

### Webhook Events to Handle:

```typescript
// stripe/webhooks.ts — handle these events:
'checkout.session.completed'     // → create subscription or add credit pack
'customer.subscription.updated'  // → update tier/status
'customer.subscription.deleted'  // → deactivate, set to free tier
'invoice.payment_succeeded'      // → renew monthly credits
'invoice.payment_failed'         // → flag account, send notification
```

### Checkout Flow:
1. User clicks "Subscribe" on pricing page
2. API creates Stripe Checkout Session with proper price ID
3. User completes payment on Stripe-hosted checkout
4. Webhook fires `checkout.session.completed`
5. Backend creates subscription record in Appwrite, adds credits to profile
6. User redirected back to `/dashboard` with success message

### Customer Portal:
- Link from `/dashboard/subscription` opens Stripe Customer Portal
- Users can upgrade/downgrade/cancel/update payment method
- All changes sync via webhooks

---

## PAGE SPECIFICATIONS

### HOME PAGE (`/`)
1. **Hero Section:** Full-width gradient background with animated particles/mesh. Large headline "Create Beyond Imagination", subheadline about AI-powered creation. CTA buttons: "Start Creating" → /studio/text-to-image, "View Pricing" → /pricing. Showcase a rotating gallery of AI-generated sample images/videos.
2. **Feature Cards:** 4 cards for Text-to-Image, Image-to-Image, Text-to-Video, Image-to-Video. Each with custom icon, title, description, "Try Now" link.
3. **Model Showcase:** Animated logo carousel of ALL supported AI providers: Google (Imagen 4, Veo 3, Gemini, Flash Image), Black Forest Labs (FLUX.2, FLUX.1, Kontext), OpenAI (Sora 2), ByteDance (Seedream, Seedance, SeedEdit), Kuaishou (Kling 2.1), MiniMax (Hailuo), PixVerse, Wan-AI, Vidu, Ideogram, HiDream, Stability AI, Qwen. Show provider logos scrolling.
4. **How It Works:** 3-step process (Choose Model → Describe → Generate & Download)
5. **Use Cases Grid:** 8 cards showing what users can create (Photorealistic, Product Photography, Social Media, Artistic, Marketing, etc.)
6. **Testimonials:** 3 testimonial cards with avatars
7. **Pricing Preview:** Condensed pricing comparison with "View Full Pricing" CTA
8. **CTA Footer:** "Ready to Create?" section with signup CTA
9. **Footer:** Logo, feature links, legal links, social links

### STUDIO PAGES

Each studio page (`/studio/text-to-image`, `/studio/image-to-image`, `/studio/text-to-video`, `/studio/image-to-video`) follows this layout:

**Left Panel (Controls):**
- Page title + description
- AI Model selector dropdown (with model icons, names, descriptions, credit costs)
- Prompt textarea (5000 char max with counter)
- For image-to-* pages: drag-and-drop image upload zone
- Resolution picker (varies by model)
- Aspect ratio picker (Auto, 1:1, 9:16, 16:9, 3:4, 4:3, 3:2, 2:3, 5:4, 4:5, 21:9)
- For video: Duration picker (5s, 8s, 10s, 15s — varies by model)
- Advanced settings collapsible (steps, seed, negative prompt)
- Credit cost display (updates dynamically based on selections)
- "Generate" button (disabled if insufficient credits, shows cost)

**Right Panel (Results):**
- Before generation: placeholder with instructions
- During generation: animated loading state with progress for video
- After generation: full-size preview with download button, share options
- Generation history: scrollable list of recent generations in this session

**Below the studio tool (SEO content — match Nano Banana's approach):**
- Model comparison table
- "Why Choose Our Platform" features grid
- "How to Create" 3-step guide
- "What You Can Create" use cases
- Testimonials
- FAQ accordion
- CTA section

### PRICING PAGE (`/pricing`)
- Monthly/Annual toggle (annual shows 50% savings badge)
- 3 subscription cards side by side (Free, Pro, Enterprise)
- Detailed feature comparison list on each card
- Below: 4 credit pack cards in a row
- FAQ section at bottom

### PROMPTS PAGE (`/prompts`)
- Grid gallery of prompt examples with preview images
- Filter by category (text-to-image, image-to-image, text-to-video, image-to-video)
- Search bar
- Click a prompt → copies to clipboard or opens in studio with prompt pre-filled
- Data managed entirely from `/admin/prompts`

### PROFILE PAGE (`/dashboard/profile`)
- Avatar section: current avatar display + two options:
  1. Upload custom photo
  2. Generate AI avatar (user enters a prompt like "professional headshot of a cyberpunk character", system uses Together.ai FLUX to generate, user can regenerate or accept)
- Full name, email (read-only from auth), display name
- Theme preference (persisted)
- Notification preferences
- Account deletion option
- Sign out button

### ADMIN DASHBOARD (`/admin`)

**Auth Guard:** Only users with `role = 'admin'` in profiles collection can access `/admin/*`. Redirect others to `/dashboard`.

**Admin Dashboard Home (`/admin`):**
- KPI cards row: Total Users, Active Subscriptions, Revenue (MTD), Total Generations, Credits Used Today
- Revenue chart (line chart, last 30 days)
- Generations chart (bar chart by type, last 30 days)
- Recent user signups table (last 10)
- Active generation jobs (real-time)
- System status indicators (Together.ai API, Stripe, Appwrite)

**User Management (`/admin/users`):**
- Searchable, sortable, paginated table of all users
- Columns: Avatar, Name, Email, Role, Tier, Credits, Generations, Status, Joined, Actions
- Click user → detail panel: full profile, generation history, credit transactions, subscription details
- Actions: Adjust credits (+/-), Change role (user/admin), Suspend/Unsuspend, View as user
- Bulk actions: Export CSV, mass email

**Subscription Management (`/admin/subscriptions`):**
- Table of all active/past subscriptions
- Revenue breakdown by tier (pie chart)
- MRR (Monthly Recurring Revenue) tracking
- Churn rate display
- Individual subscription detail with Stripe link

**Prompt Management (`/admin/prompts`):**
- CRUD interface for prompt gallery
- Fields: Title, Prompt Text, Category, Tags, Preview Image (upload or generate), Featured toggle, Published toggle, Sort Order
- Drag-and-drop reordering
- Bulk publish/unpublish

**API Monitoring (`/admin/monitoring`):**
- Real-time Together.ai API status
- Request latency chart (p50, p95, p99 over time)
- Error rate chart
- Requests by model (bar chart)
- Recent errors table with details
- Cost tracking: estimated Together.ai spend per day/week/month
- Rate limit status

**Analytics (`/admin/analytics`):**
- Page views over time (line chart)
- Hits per page (bar chart, sortable)
- User activity: DAU, WAU, MAU metrics
- Admin vs non-admin visits breakdown
- Geographic distribution (if available from IP hash)
- Top referrers
- Generation funnel: visits → signups → first generation → subscription
- Session duration estimates

**Settings (`/admin/settings`):**
- Model configuration: enable/disable models, set credit costs
- Feature flags: toggle each studio tool on/off
- Pricing configuration: update prices (syncs to Stripe)
- Maintenance mode toggle
- Email template management
- API key status (masked display)

---

## DESIGN SYSTEM — "MIDNIGHT NEXUS" THEME

### Color Tokens (tailwind.config.ts)

```typescript
colors: {
  // Base
  nyx: {
    bg: '#0a0a0f',           // Deep midnight background
    surface: '#12121a',       // Card/panel background
    surfaceHover: '#1a1a2e',  // Hover state
    border: '#2a2a3e',        // Subtle borders
    borderBright: '#3a3a5e',  // Active borders
  },
  // Primary gradient: purple → cyan
  primary: {
    50: '#f3e8ff',
    100: '#e0cfff',
    200: '#c084fc',
    300: '#a855f7',
    400: '#9333ea',
    500: '#7c3aed',           // Main purple
    600: '#6d28d9',
    700: '#5b21b6',
    800: '#4c1d95',
    900: '#3b0764',
  },
  accent: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',           // Main cyan
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}
```

### Gradient Classes
```css
.gradient-primary { background: linear-gradient(135deg, #7c3aed, #06b6d4); }
.gradient-text { background: linear-gradient(135deg, #a855f7, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.gradient-border { border-image: linear-gradient(135deg, #7c3aed, #06b6d4) 1; }
.gradient-glow { box-shadow: 0 0 40px rgba(124, 58, 237, 0.3), 0 0 80px rgba(6, 182, 212, 0.1); }
```

### Light Mode Overrides
When `data-theme="light"`:
- Background: #f8fafc
- Surface: #ffffff
- Text: #0f172a
- Keep gradient accents but soften glow effects

### Typography
- Headings: Inter (bold, tracking tight)
- Body: Inter (regular)
- Code/monospace: JetBrains Mono

### Animations (use sparingly)
- Gradient mesh background on hero (subtle CSS animation)
- Card hover: translateY(-2px) + glow intensify
- Loading states: skeleton pulse with gradient shimmer
- Page transitions: fade-in
- Generation progress: animated gradient bar

---

## LOGO & ICON SPECIFICATIONS

Generate these as inline SVGs or React components — NO external image files for icons:

1. **Logo Mark:** A stylized "N" formed from intersecting geometric lines creating a nexus/network pattern. Purple-to-cyan gradient fill. Should work at 24x24px up to 512x512px.

2. **Full Wordmark:** Logo mark + "NYX-NET" in Inter Bold, with "NYX" in gradient and "-NET" in white/gray.

3. **Favicon:** Simplified logo mark that reads at 16x16px.

4. **Studio Tool Icons (4):**
   - Text-to-Image: Stylized text cursor transforming into an image frame
   - Image-to-Image: Two overlapping image frames with transformation arrows
   - Text-to-Video: Text cursor transforming into a play button/video frame
   - Image-to-Video: Image frame morphing into a video play button

5. **Feature Icons:** Use Lucide React icons for standard features (Zap for speed, Shield for security, etc.)

---

## CRITICAL REQUIREMENTS — READ CAREFULLY

1. **NO PLACEHOLDER CODE.** Every function must be fully implemented. Every API call must be real. Every database query must work. If a button says "Generate", it must call Together.ai and return real results.

2. **NO `// TODO` COMMENTS.** No "implement later" notes. No stub functions. Everything works end-to-end on first deploy.

3. **FULL ERROR HANDLING.** Every API call wrapped in try/catch. User-facing error messages. Retry logic for video polling. Graceful degradation.

4. **REAL CREDIT SYSTEM.** Credits are checked BEFORE generation starts. Credits are deducted via sequential read-update-log pattern. Insufficient credits shows upgrade prompt. Transaction log is immutable.

5. **REAL AUTH FLOW.** Appwrite Auth with email/password + Google/GitHub OAuth. Session management via cookies. Protected routes via middleware.

6. **REAL STRIPE INTEGRATION.** Working checkout sessions. Working webhooks that update Appwrite database. Working customer portal. Credit pack purchases add credits immediately.

7. **REAL ADMIN BACKEND.** Not a mockup dashboard. Real data from real Appwrite queries. Real charts from real metrics. Real user management with real actions.

8. **REAL ANALYTICS.** Middleware tracks every page view via fire-and-forget API call. API routes log every generation. Admin dashboard shows real numbers.

9. **REAL-TIME UPDATES.** Use Appwrite Realtime for:
   - Credit balance updates after generation
   - Admin dashboard live stats
   - Video generation status updates

10. **PRODUCTION-READY.** Proper TypeScript types everywhere. Proper loading states. Proper empty states. Responsive design (mobile-first). SEO metadata on every page. Proper image optimization. Proper caching headers.

11. **VIDEO GENERATION POLLING.** Implement proper async video generation:
    - Submit job → show "Processing" with animated indicator
    - Poll every 5 seconds via API route (not client-side direct to Together.ai)
    - Update UI when complete
    - Handle timeouts (max 5 minutes)
    - Handle failures with retry option

12. **FILE UPLOADS.** For image-to-* tools:
    - Client uploads image to Appwrite Storage bucket
    - Server passes Appwrite Storage URL to Together.ai
    - Generated output downloaded and stored in Appwrite Storage
    - Thumbnails generated for gallery

---

## DEPLOYMENT CHECKLIST

Before deploying to Vercel:
1. All environment variables set in Vercel dashboard
2. Appwrite project created with database, collections, and buckets (run `scripts/setup-appwrite.ts`)
3. Appwrite OAuth providers configured (Google, GitHub) with correct redirect URLs
4. Stripe products/prices created with correct IDs in env vars
5. Stripe webhook endpoint configured: `https://nyx-net.com/api/stripe/webhook`
6. Together.ai API key has sufficient balance
7. Appwrite Storage buckets created: `uploads`, `generations`, `avatars`
8. First admin user: create account normally, then set `role = 'admin'` in profiles collection
9. DNS configured for nyx-net.com → Vercel

---

## BUILD ORDER (Recommended for Claude Code)

### Phase 1: Foundation
1. Initialize Next.js project with TypeScript, Tailwind, App Router
2. Set up Appwrite client libraries (browser client + server admin/session clients)
3. Create Appwrite setup script for collections, buckets, seed data
4. Create design system (globals.css, tailwind.config.ts, theme provider)
5. Generate logo SVGs and brand icons
6. Build UI component library (all components in /components/ui/)

### Phase 2: Auth & Profile
7. Implement Appwrite Auth (login, signup, OAuth callback, reset password)
8. Build auth middleware and route protection
9. Build profile page with avatar upload + AI avatar generation
10. Build theme toggle (dark default, persisted)

### Phase 3: Core Studio
11. Build Together.ai client library (image.ts, video.ts, models.ts)
12. Build credit system (check, deduct, add functions — sequential pattern)
13. Build shared studio components (prompt-input, model-selector, etc.)
14. Build Text-to-Image page (full implementation)
15. Build Image-to-Image page (full implementation)
16. Build Text-to-Video page (full implementation with polling)
17. Build Image-to-Video page (full implementation with polling)

### Phase 4: Monetization
18. Set up Stripe products, prices, and webhook
19. Build pricing page with monthly/annual toggle
20. Build checkout flow (subscriptions + credit packs)
21. Build subscription management page
22. Build Stripe webhook handler (all events)

### Phase 5: Marketing & Content
23. Build home/landing page
24. Build prompts gallery page (public-facing)
25. Build SEO content sections for each studio page
26. Add OpenGraph metadata, sitemap, robots.txt

### Phase 6: Admin Backend
27. Build admin layout with sidebar and role guard
28. Build admin dashboard with KPI cards and charts
29. Build user management page
30. Build subscription management page
31. Build prompt management CRUD
32. Build API monitoring dashboard
33. Build analytics dashboard
34. Build settings page

### Phase 7: Polish
35. Add page view tracking middleware (fire-and-forget to /api/analytics/pageview)
36. Add API usage logging to all generation endpoints
37. Add Appwrite Realtime subscriptions for live updates
38. Add proper loading/error/empty states everywhere
39. Responsive design pass (mobile, tablet, desktop)
40. Performance optimization (image optimization, code splitting, caching)

---

## FINAL NOTES

- Use `together-ai` npm package (official SDK) for API calls
- Use `stripe` npm package for server-side Stripe operations
- Use `@stripe/stripe-js` for client-side Stripe
- Use `appwrite` for client-side Appwrite (browser)
- Use `node-appwrite` for server-side Appwrite (API routes, middleware)
- Use `zustand` for client state management
- Use `recharts` for admin dashboard charts (dynamically imported)
- Use `react-dropzone` for file uploads
- Use `next-themes` for theme management
- Use `zod` for input validation
- Use `date-fns` for date formatting
- All API routes should validate authentication and check credits before processing
- All admin routes should verify admin role via profiles collection
- Store generated media in Appwrite Storage with organized bucket structure
- Use Appwrite Realtime for live credit updates and admin monitoring
- Implement proper rate limiting on generation endpoints
- Log all admin actions to admin_activity_log collection
- EVERY page must have proper `<title>`, `<meta description>`, and OpenGraph tags
- **node-appwrite v22+**: No `InputFile` export — use `new File([Buffer.from(...)], filename, { type })` for storage uploads
- **Stripe client**: Use lazy Proxy-based initialization to avoid build-time failures
- **Static prerendering**: Use `export const dynamic = 'force-dynamic'` on layouts to prevent failures with client components

**Build this complete. Build this right. No shortcuts. No placeholders. Ship it.**
