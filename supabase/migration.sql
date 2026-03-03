-- ============================================================================
-- Tynkerlab.ai — Supabase Migration Script
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Helper: auto-update updated_at on every row change
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text UNIQUE NOT NULL,
  email       text NOT NULL,
  full_name   text,
  avatar_url  text,
  avatar_prompt text,
  role        text NOT NULL DEFAULT 'user',
  credits_balance   int NOT NULL DEFAULT 0,
  credits_monthly   int NOT NULL DEFAULT 0,
  subscription_tier text NOT NULL DEFAULT 'free',
  stripe_customer_id     text,
  stripe_subscription_id text,
  subscription_status    text,
  subscription_period    text,
  current_period_end     timestamptz,
  total_generations int NOT NULL DEFAULT 0,
  total_images     int NOT NULL DEFAULT 0,
  total_videos     int NOT NULL DEFAULT 0,
  last_active_at   timestamptz,
  bio        text,
  location   text,
  website    text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- generations
CREATE TABLE IF NOT EXISTS generations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          text NOT NULL,
  type             text NOT NULL,
  model            text NOT NULL,
  prompt           text NOT NULL,
  negative_prompt  text,
  input_image_url  text,
  output_url       text,
  output_thumbnail_url text,
  width            int,
  height           int,
  duration_seconds int,
  resolution       text,
  aspect_ratio     text,
  steps            int,
  seed             bigint,
  credits_used     int NOT NULL DEFAULT 0,
  status           text NOT NULL DEFAULT 'pending',
  error_message    text,
  together_job_id  text,
  metadata         jsonb,
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER generations_updated_at
  BEFORE UPDATE ON generations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_together_job_id ON generations(together_job_id);

-- credit_transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text NOT NULL,
  amount        int NOT NULL,
  type          text NOT NULL,
  description   text,
  reference_id  text,
  balance_after int NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 text NOT NULL,
  stripe_subscription_id  text UNIQUE NOT NULL,
  stripe_customer_id      text NOT NULL,
  tier                    text NOT NULL,
  period                  text NOT NULL,
  status                  text NOT NULL,
  credits_per_month       int NOT NULL DEFAULT 0,
  price_monthly           numeric(10,2) NOT NULL DEFAULT 0,
  price_annual            numeric(10,2) NOT NULL DEFAULT 0,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- credit_pack_purchases
CREATE TABLE IF NOT EXISTS credit_pack_purchases (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    text NOT NULL,
  pack_name                  text NOT NULL,
  credits_amount             int NOT NULL,
  price                      numeric(10,2) NOT NULL,
  stripe_payment_intent_id   text,
  stripe_checkout_session_id text,
  status                     text NOT NULL DEFAULT 'pending',
  expires_at                 timestamptz,
  created_at                 timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_pack_purchases_user_id ON credit_pack_purchases(user_id);

-- prompts
CREATE TABLE IF NOT EXISTS prompts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  prompt_text       text NOT NULL,
  category          text NOT NULL DEFAULT 'general',
  model_type        text NOT NULL DEFAULT 'image',
  tags              text[] DEFAULT '{}',
  preview_image_url text,
  model_used        text,
  is_featured       boolean NOT NULL DEFAULT false,
  is_published      boolean NOT NULL DEFAULT false,
  usage_count       int NOT NULL DEFAULT 0,
  sort_order        int NOT NULL DEFAULT 0,
  created_by        text,
  submission_status text NOT NULL DEFAULT 'admin',
  submitted_by      text,
  submitter_name    text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_prompts_is_published ON prompts(is_published);
CREATE INDEX IF NOT EXISTS idx_prompts_is_featured ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);

-- page_views
CREATE TABLE IF NOT EXISTS page_views (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path       text NOT NULL,
  user_id    text,
  is_admin   boolean NOT NULL DEFAULT false,
  session_id text,
  referrer   text,
  user_agent text,
  ip_hash    text,
  country    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);

-- api_usage_log
CREATE TABLE IF NOT EXISTS api_usage_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          text,
  endpoint         text NOT NULL,
  model            text NOT NULL,
  request_type     text NOT NULL,
  tokens_used      int,
  cost_estimate    numeric(10,6),
  latency_ms       int,
  status_code      int,
  error            text,
  request_metadata jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_log_created_at ON api_usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_log_status_code ON api_usage_log(status_code);

-- admin_activity_log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    text NOT NULL,
  action      text NOT NULL,
  target_type text,
  target_id   text,
  details     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);

-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  value       jsonb NOT NULL DEFAULT '{}',
  description text,
  updated_by  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- affiliates
CREATE TABLE IF NOT EXISTS affiliates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text UNIQUE NOT NULL,
  code              text UNIQUE NOT NULL,
  status            text NOT NULL DEFAULT 'active',
  total_clicks      int NOT NULL DEFAULT 0,
  total_signups     int NOT NULL DEFAULT 0,
  total_conversions int NOT NULL DEFAULT 0,
  total_earnings    numeric(10,2) NOT NULL DEFAULT 0,
  pending_balance   numeric(10,2) NOT NULL DEFAULT 0,
  paid_out          numeric(10,2) NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- affiliate_events
CREATE TABLE IF NOT EXISTS affiliate_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id    uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  type            text NOT NULL,
  referred_user_id text,
  order_id        text,
  sale_amount     numeric(10,2) NOT NULL DEFAULT 0,
  commission      numeric(10,2) NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_events_affiliate_id ON affiliate_events(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_events_created_at ON affiliate_events(created_at);

-- ---------------------------------------------------------------------------
-- 3. Atomic credit deduction function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id text,
  p_amount int,
  p_description text,
  p_reference_id text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_new_balance int;
BEGIN
  -- Lock the row to prevent concurrent deductions
  SELECT * INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_profile.credits_balance < p_amount THEN
    RETURN false;
  END IF;

  v_new_balance := v_profile.credits_balance - p_amount;

  UPDATE profiles
  SET credits_balance = v_new_balance
  WHERE id = v_profile.id;

  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id, balance_after)
  VALUES (p_user_id, -p_amount, 'generation_debit', p_description, p_reference_id, v_new_balance);

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 4. Row Level Security (RLS)
-- ---------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_pack_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_events ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically.
-- Authenticated users can read/write their own rows.

-- profiles: users can read/update their own profile
CREATE POLICY profiles_select ON profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);
CREATE POLICY profiles_update ON profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()::text);

-- generations: users can read their own generations
CREATE POLICY generations_select ON generations FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

-- credit_transactions: users can read their own
CREATE POLICY credit_transactions_select ON credit_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

-- prompts: public read for published prompts
CREATE POLICY prompts_select_published ON prompts FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- site_settings: public read
CREATE POLICY site_settings_select ON site_settings FOR SELECT TO anon, authenticated
  USING (true);

-- Service role (used by API routes) bypasses all RLS, so no additional
-- policies needed for server-side operations.

-- ---------------------------------------------------------------------------
-- 5. Storage Buckets
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('generations', 'generations', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow authenticated uploads, public reads
CREATE POLICY storage_uploads_select ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('uploads', 'avatars', 'generations'));

CREATE POLICY storage_uploads_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('uploads', 'avatars', 'generations'));

CREATE POLICY storage_uploads_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('uploads', 'avatars', 'generations'));

-- ---------------------------------------------------------------------------
-- UGC Avatar support
-- ---------------------------------------------------------------------------
ALTER TABLE generations ADD COLUMN IF NOT EXISTS input_audio_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_avatars int NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- Done! Verify with: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- ---------------------------------------------------------------------------
