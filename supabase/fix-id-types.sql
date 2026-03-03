-- ============================================================================
-- Fix: Change id columns from uuid to text to accept Appwrite hex IDs
-- Run this in Supabase SQL Editor BEFORE running the migration script
-- ============================================================================

-- Drop the foreign key on affiliate_events first (references affiliates.id)
ALTER TABLE affiliate_events DROP CONSTRAINT IF EXISTS affiliate_events_affiliate_id_fkey;

-- Change all id primary keys from uuid to text
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE profiles ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE generations ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE generations ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE credit_transactions ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE credit_transactions ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE subscriptions ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE subscriptions ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE credit_pack_purchases ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE credit_pack_purchases ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE prompts ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE prompts ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE page_views ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE page_views ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE api_usage_log ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE api_usage_log ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE admin_activity_log ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE admin_activity_log ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE site_settings ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE site_settings ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE affiliates ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE affiliates ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE affiliate_events ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE affiliate_events ALTER COLUMN id TYPE text USING id::text;

-- Also change affiliate_events.affiliate_id to text (was uuid referencing affiliates.id)
ALTER TABLE affiliate_events ALTER COLUMN affiliate_id TYPE text USING affiliate_id::text;

-- Re-add the foreign key with text types
ALTER TABLE affiliate_events
  ADD CONSTRAINT affiliate_events_affiliate_id_fkey
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE;

-- Set defaults back — use gen_random_uuid()::text so new rows still get auto-IDs
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE generations ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE credit_transactions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE subscriptions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE credit_pack_purchases ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE prompts ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE page_views ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE api_usage_log ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE admin_activity_log ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE site_settings ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE affiliates ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE affiliate_events ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Verify
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND column_name = 'id'
ORDER BY table_name;
