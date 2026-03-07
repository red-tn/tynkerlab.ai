-- ============================================================================
-- Tynkerlab.ai — Security & Performance Fix Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 🔴 CRITICAL FIX 1: Lock down add_credits — only service_role can call it
-- Previously callable by anon with SECURITY DEFINER = free credits for anyone
-- ---------------------------------------------------------------------------
-- Drop any stale overloads (UUID version from earlier migration attempts)
DROP FUNCTION IF EXISTS add_credits(UUID, INTEGER, TEXT, TEXT, TEXT);

-- Recreate with SECURITY INVOKER (not DEFINER) and revoke from public
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id TEXT,
  p_amount INTEGER,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'admin_adjustment'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER  -- Runs as the calling role, NOT as the function owner
AS $$
DECLARE
  v_profile_id TEXT;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  SELECT id, credits_balance INTO v_profile_id, v_current_balance
  FROM profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_profile_id IS NULL THEN
    RETURN FALSE;
  END IF;

  v_new_balance := v_current_balance + p_amount;

  UPDATE profiles
  SET credits_balance = v_new_balance
  WHERE id = v_profile_id;

  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id, balance_after)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, v_new_balance);

  RETURN TRUE;
END;
$$;

-- Revoke from everyone, then grant only to service_role
REVOKE ALL ON FUNCTION add_credits(TEXT, INTEGER, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION add_credits(TEXT, INTEGER, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION add_credits(TEXT, INTEGER, TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION add_credits(TEXT, INTEGER, TEXT, TEXT, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- 🔴 CRITICAL FIX 2: Lock down deduct_credits — only service_role can call it
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id TEXT,
  p_amount INT,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_new_balance INT;
BEGIN
  SELECT * INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF v_profile.credits_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  v_new_balance := v_profile.credits_balance - p_amount;

  UPDATE profiles
  SET credits_balance = v_new_balance
  WHERE id = v_profile.id;

  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id, balance_after)
  VALUES (p_user_id, -p_amount, 'generation_debit', p_description, p_reference_id, v_new_balance);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION deduct_credits(TEXT, INT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION deduct_credits(TEXT, INT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION deduct_credits(TEXT, INT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits(TEXT, INT, TEXT, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- 🟡 FIX 3: profiles INSERT policy for new signups
-- Auth trigger or server-side creates profiles, but add policy for safety
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_insert' AND tablename = 'profiles') THEN
    CREATE POLICY profiles_insert ON profiles FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid()::text);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 🟡 FIX 4: Restrict site_settings — only authenticated users (not anon)
-- Prevents unauthenticated scraping of all settings
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS site_settings_select ON site_settings;
CREATE POLICY site_settings_select ON site_settings FOR SELECT TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- 🟢 PERFORMANCE FIX 5: Missing indexes on page_views
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_ip_hash ON page_views(ip_hash);
CREATE INDEX IF NOT EXISTS idx_page_views_path_created_at ON page_views(path, created_at);

-- ---------------------------------------------------------------------------
-- 🟢 PERFORMANCE FIX 6: Drop duplicate slug indexes
-- The UNIQUE constraint already creates an implicit index
-- ---------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_templates_slug;
DROP INDEX IF EXISTS idx_blog_posts_slug;

-- ---------------------------------------------------------------------------
-- 🟢 PERFORMANCE FIX 7: Prune old page_views (older than 90 days)
-- Run this periodically or set up a pg_cron job
-- ---------------------------------------------------------------------------
DELETE FROM page_views WHERE created_at < now() - interval '90 days';

-- ---------------------------------------------------------------------------
-- Verify: list all functions and their privileges
-- ---------------------------------------------------------------------------
-- SELECT proname, proacl FROM pg_proc WHERE proname IN ('add_credits', 'deduct_credits');

-- Verify: check RLS policies
-- SELECT tablename, policyname, cmd, roles FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

-- ============================================================================
-- DONE! Critical security holes patched.
-- ============================================================================
