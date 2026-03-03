// ---------------------------------------------------------------------------
// Base row type (Supabase returns id, created_at, updated_at)
// ---------------------------------------------------------------------------
export interface DbRow {
  id: string
  created_at: string
  updated_at?: string
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export interface Profile extends DbRow {
  user_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  avatar_prompt: string | null
  role: 'user' | 'admin'
  credits_balance: number
  credits_monthly: number
  subscription_tier: 'free' | 'pro' | 'enterprise'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  subscription_period: 'monthly' | 'annual' | null
  current_period_end: string | null
  total_generations: number
  total_images: number
  total_videos: number
  total_avatars: number
  last_active_at: string | null
  bio: string | null
  location: string | null
  website: string | null
}

export interface ProfileCreate {
  user_id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  avatar_prompt?: string | null
  role?: 'user' | 'admin'
  credits_balance?: number
  credits_monthly?: number
  subscription_tier?: 'free' | 'pro' | 'enterprise'
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  subscription_status?: string | null
  subscription_period?: 'monthly' | 'annual' | null
  current_period_end?: string | null
  total_generations?: number
  total_images?: number
  total_videos?: number
  total_avatars?: number
  last_active_at?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
}

export type ProfileUpdate = Partial<Omit<ProfileCreate, 'user_id'>>

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------
export type GenerationType = 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video' | 'ugc-avatar'
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Generation extends DbRow {
  user_id: string
  type: GenerationType
  model: string
  prompt: string
  negative_prompt: string | null
  input_image_url: string | null
  output_url: string | null
  output_thumbnail_url: string | null
  width: number | null
  height: number | null
  duration_seconds: number | null
  resolution: string | null
  aspect_ratio: string | null
  steps: number | null
  seed: number | null
  credits_used: number
  status: GenerationStatus
  error_message: string | null
  input_audio_url: string | null
  together_job_id: string | null
  metadata: Record<string, any> | null
  completed_at: string | null
}

export interface GenerationCreate {
  user_id: string
  type: GenerationType
  model: string
  prompt: string
  negative_prompt?: string | null
  input_image_url?: string | null
  output_url?: string | null
  output_thumbnail_url?: string | null
  width?: number | null
  height?: number | null
  duration_seconds?: number | null
  resolution?: string | null
  aspect_ratio?: string | null
  steps?: number | null
  seed?: number | null
  credits_used: number
  status?: GenerationStatus
  error_message?: string | null
  input_audio_url?: string | null
  together_job_id?: string | null
  metadata?: Record<string, any> | null
  completed_at?: string | null
}

export type GenerationUpdate = Partial<Omit<GenerationCreate, 'user_id'>>

// ---------------------------------------------------------------------------
// Credit Transaction
// ---------------------------------------------------------------------------
export type CreditTransactionType =
  | 'subscription_renewal'
  | 'credit_pack_purchase'
  | 'generation_debit'
  | 'admin_adjustment'
  | 'refund'

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: CreditTransactionType
  description: string | null
  reference_id: string | null
  balance_after: number
  created_at: string
}

export interface CreditTransactionCreate {
  user_id: string
  amount: number
  type: CreditTransactionType
  description?: string | null
  reference_id?: string | null
  balance_after: number
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------
export type SubscriptionTier = 'free' | 'pro' | 'enterprise'
export type SubscriptionPeriod = 'monthly' | 'annual'

export interface Subscription extends DbRow {
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  tier: SubscriptionTier
  period: SubscriptionPeriod
  status: string
  credits_per_month: number
  price_monthly: number
  price_annual: number
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export interface SubscriptionCreate {
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  tier: SubscriptionTier
  period: SubscriptionPeriod
  status: string
  credits_per_month: number
  price_monthly: number
  price_annual: number
  current_period_start: string
  current_period_end: string
  cancel_at_period_end?: boolean
}

export type SubscriptionUpdate = Partial<Omit<SubscriptionCreate, 'user_id'>>

// ---------------------------------------------------------------------------
// Credit Pack Purchase
// ---------------------------------------------------------------------------
export interface CreditPackPurchase {
  id: string
  user_id: string
  pack_name: string
  credits_amount: number
  price: number
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  status: string
  expires_at: string | null
  created_at: string
}

export interface CreditPackPurchaseCreate {
  user_id: string
  pack_name: string
  credits_amount: number
  price: number
  stripe_payment_intent_id?: string | null
  stripe_checkout_session_id?: string | null
  status?: string
  expires_at?: string | null
}

// ---------------------------------------------------------------------------
// Prompt (Gallery)
// ---------------------------------------------------------------------------
export type PromptCategory = 'general' | 'photography' | 'art' | 'anime' | 'fantasy' | 'sci-fi' | 'nature' | 'portrait' | 'abstract'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'admin'

export interface Prompt extends DbRow {
  title: string
  prompt_text: string
  category: PromptCategory
  model_type: 'image' | 'video'
  tags: string[]
  preview_image_url: string | null
  model_used: string | null
  is_featured: boolean
  is_published: boolean
  usage_count: number
  sort_order: number
  created_by: string | null
  submission_status: SubmissionStatus
  submitted_by: string | null
  submitter_name: string | null
}

export interface PromptCreate {
  title: string
  prompt_text: string
  category: PromptCategory
  tags?: string[]
  preview_image_url?: string | null
  model_used?: string | null
  is_featured?: boolean
  is_published?: boolean
  sort_order?: number
  created_by?: string | null
}

export type PromptUpdate = Partial<PromptCreate>

// ---------------------------------------------------------------------------
// Page View (Analytics)
// ---------------------------------------------------------------------------
export interface PageView {
  id: string
  path: string
  user_id: string | null
  is_admin: boolean
  session_id: string | null
  referrer: string | null
  user_agent: string | null
  ip_hash: string | null
  country: string | null
  created_at: string
}

export interface PageViewCreate {
  path: string
  user_id?: string | null
  is_admin?: boolean
  session_id?: string | null
  referrer?: string | null
  user_agent?: string | null
  ip_hash?: string | null
  country?: string | null
}

// ---------------------------------------------------------------------------
// API Usage Log
// ---------------------------------------------------------------------------
export interface ApiUsageLog {
  id: string
  user_id: string | null
  endpoint: string
  model: string
  request_type: string
  tokens_used: number | null
  cost_estimate: number | null
  latency_ms: number | null
  status_code: number | null
  error: string | null
  request_metadata: Record<string, any> | null
  created_at: string
}

export interface ApiUsageLogCreate {
  user_id?: string | null
  endpoint: string
  model: string
  request_type: string
  tokens_used?: number | null
  cost_estimate?: number | null
  latency_ms?: number | null
  status_code?: number | null
  error?: string | null
  request_metadata?: Record<string, any> | null
}

// ---------------------------------------------------------------------------
// Admin Activity Log
// ---------------------------------------------------------------------------
export interface AdminActivityLog {
  id: string
  admin_id: string
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, any> | null
  created_at: string
}

export interface AdminActivityLogCreate {
  admin_id: string
  action: string
  target_type?: string | null
  target_id?: string | null
  details?: Record<string, any> | null
}

// ---------------------------------------------------------------------------
// Site Settings
// ---------------------------------------------------------------------------
export interface SiteSetting extends DbRow {
  key: string
  value: Record<string, any>
  description: string | null
  updated_by: string | null
}

export interface SiteSettingCreate {
  key: string
  value: Record<string, any>
  description?: string | null
  updated_by?: string | null
}

export type SiteSettingUpdate = Partial<Omit<SiteSettingCreate, 'key'>>

// ---------------------------------------------------------------------------
// Affiliate
// ---------------------------------------------------------------------------
export interface Affiliate extends DbRow {
  user_id: string
  code: string
  status: string
  total_clicks: number
  total_signups: number
  total_conversions: number
  total_earnings: number
  pending_balance: number
  paid_out: number
}

export interface AffiliateEvent {
  id: string
  affiliate_id: string
  type: string
  referred_user_id: string | null
  order_id: string | null
  sale_amount: number
  commission: number
  created_at: string
}

// ---------------------------------------------------------------------------
// User Role type
// ---------------------------------------------------------------------------
export type UserRole = 'user' | 'admin'
