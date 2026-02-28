import { Models } from 'appwrite'

// ---------------------------------------------------------------------------
// Base document type (Appwrite adds $id, $collectionId, $databaseId, etc.)
// ---------------------------------------------------------------------------
export type AppwriteDocument = Models.Document

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export interface Profile extends AppwriteDocument {
  userId: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  avatarPrompt: string | null
  role: 'user' | 'admin'
  creditsBalance: number
  creditsMonthly: number
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionStatus: string | null
  subscriptionPeriod: 'monthly' | 'annual' | null
  currentPeriodEnd: string | null
  totalGenerations: number
  totalImages: number
  totalVideos: number
  lastActiveAt: string | null
  bio: string | null
  location: string | null
  website: string | null
}

export interface ProfileCreate {
  userId: string
  email: string
  fullName?: string | null
  avatarUrl?: string | null
  avatarPrompt?: string | null
  role?: 'user' | 'admin'
  creditsBalance?: number
  creditsMonthly?: number
  subscriptionTier?: 'free' | 'pro' | 'enterprise'
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  subscriptionStatus?: string | null
  subscriptionPeriod?: 'monthly' | 'annual' | null
  currentPeriodEnd?: string | null
  totalGenerations?: number
  totalImages?: number
  totalVideos?: number
  lastActiveAt?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
}

export type ProfileUpdate = Partial<Omit<ProfileCreate, 'userId'>>

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------
export type GenerationType = 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video'
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Generation extends AppwriteDocument {
  userId: string
  type: GenerationType
  model: string
  prompt: string
  negativePrompt: string | null
  inputImageUrl: string | null
  outputUrl: string | null
  outputThumbnailUrl: string | null
  width: number | null
  height: number | null
  durationSeconds: number | null
  resolution: string | null
  aspectRatio: string | null
  steps: number | null
  seed: number | null
  creditsUsed: number
  status: GenerationStatus
  errorMessage: string | null
  togetherJobId: string | null
  metadata: string | null // JSON string in Appwrite
  completedAt: string | null
}

export interface GenerationCreate {
  userId: string
  type: GenerationType
  model: string
  prompt: string
  negativePrompt?: string | null
  inputImageUrl?: string | null
  outputUrl?: string | null
  outputThumbnailUrl?: string | null
  width?: number | null
  height?: number | null
  durationSeconds?: number | null
  resolution?: string | null
  aspectRatio?: string | null
  steps?: number | null
  seed?: number | null
  creditsUsed: number
  status?: GenerationStatus
  errorMessage?: string | null
  togetherJobId?: string | null
  metadata?: string | null
  completedAt?: string | null
}

export type GenerationUpdate = Partial<Omit<GenerationCreate, 'userId'>>

// ---------------------------------------------------------------------------
// Credit Transaction
// ---------------------------------------------------------------------------
export type CreditTransactionType =
  | 'subscription_renewal'
  | 'credit_pack_purchase'
  | 'generation_debit'
  | 'admin_adjustment'
  | 'refund'

export interface CreditTransaction extends AppwriteDocument {
  userId: string
  amount: number
  type: CreditTransactionType
  description: string | null
  referenceId: string | null
  balanceAfter: number
}

export interface CreditTransactionCreate {
  userId: string
  amount: number
  type: CreditTransactionType
  description?: string | null
  referenceId?: string | null
  balanceAfter: number
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------
export type SubscriptionTier = 'basic' | 'standard' | 'pro'
export type SubscriptionPeriod = 'monthly' | 'annual'

export interface Subscription extends AppwriteDocument {
  userId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  tier: SubscriptionTier
  period: SubscriptionPeriod
  status: string
  creditsPerMonth: number
  priceMonthly: number
  priceAnnual: number
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export interface SubscriptionCreate {
  userId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  tier: SubscriptionTier
  period: SubscriptionPeriod
  status: string
  creditsPerMonth: number
  priceMonthly: number
  priceAnnual: number
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd?: boolean
}

export type SubscriptionUpdate = Partial<Omit<SubscriptionCreate, 'userId'>>

// ---------------------------------------------------------------------------
// Credit Pack Purchase
// ---------------------------------------------------------------------------
export interface CreditPackPurchase extends AppwriteDocument {
  userId: string
  packName: string
  creditsAmount: number
  price: number
  stripePaymentIntentId: string | null
  stripeCheckoutSessionId: string | null
  status: string
  expiresAt: string | null
}

export interface CreditPackPurchaseCreate {
  userId: string
  packName: string
  creditsAmount: number
  price: number
  stripePaymentIntentId?: string | null
  stripeCheckoutSessionId?: string | null
  status?: string
  expiresAt?: string | null
}

// ---------------------------------------------------------------------------
// Prompt (Gallery)
// ---------------------------------------------------------------------------
export type PromptCategory = 'general' | 'photography' | 'art' | 'anime' | 'fantasy' | 'sci-fi' | 'nature' | 'portrait' | 'abstract'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'admin'

export interface Prompt extends AppwriteDocument {
  title: string
  promptText: string
  category: PromptCategory
  modelType: 'image' | 'video'
  tags: string[]
  previewImageUrl: string | null
  modelUsed: string | null
  isFeatured: boolean
  isPublished: boolean
  usageCount: number
  sortOrder: number
  createdBy: string | null
  submissionStatus: SubmissionStatus
  submittedBy: string | null
  submitterName: string | null
}

export interface PromptCreate {
  title: string
  promptText: string
  category: PromptCategory
  tags?: string[]
  previewImageUrl?: string | null
  modelUsed?: string | null
  isFeatured?: boolean
  isPublished?: boolean
  sortOrder?: number
  createdBy?: string | null
}

export type PromptUpdate = Partial<PromptCreate>

// ---------------------------------------------------------------------------
// Page View (Analytics)
// ---------------------------------------------------------------------------
export interface PageView extends AppwriteDocument {
  path: string
  userId: string | null
  isAdmin: boolean
  sessionId: string | null
  referrer: string | null
  userAgent: string | null
  ipHash: string | null
  country: string | null
}

export interface PageViewCreate {
  path: string
  userId?: string | null
  isAdmin?: boolean
  sessionId?: string | null
  referrer?: string | null
  userAgent?: string | null
  ipHash?: string | null
  country?: string | null
}

// ---------------------------------------------------------------------------
// API Usage Log
// ---------------------------------------------------------------------------
export interface ApiUsageLog extends AppwriteDocument {
  userId: string | null
  endpoint: string
  model: string
  requestType: string
  tokensUsed: number | null
  costEstimate: number | null
  latencyMs: number | null
  statusCode: number | null
  error: string | null
  requestMetadata: string | null // JSON string
}

export interface ApiUsageLogCreate {
  userId?: string | null
  endpoint: string
  model: string
  requestType: string
  tokensUsed?: number | null
  costEstimate?: number | null
  latencyMs?: number | null
  statusCode?: number | null
  error?: string | null
  requestMetadata?: string | null
}

// ---------------------------------------------------------------------------
// Admin Activity Log
// ---------------------------------------------------------------------------
export interface AdminActivityLog extends AppwriteDocument {
  adminId: string
  action: string
  targetType: string | null
  targetId: string | null
  details: string | null // JSON string
}

export interface AdminActivityLogCreate {
  adminId: string
  action: string
  targetType?: string | null
  targetId?: string | null
  details?: string | null
}

// ---------------------------------------------------------------------------
// Site Settings
// ---------------------------------------------------------------------------
export interface SiteSetting extends AppwriteDocument {
  key: string
  value: string // JSON string
  description: string | null
  updatedBy: string | null
}

export interface SiteSettingCreate {
  key: string
  value: string
  description?: string | null
  updatedBy?: string | null
}

export type SiteSettingUpdate = Partial<Omit<SiteSettingCreate, 'key'>>

// ---------------------------------------------------------------------------
// User Role type
// ---------------------------------------------------------------------------
export type UserRole = 'user' | 'admin'
