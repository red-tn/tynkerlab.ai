-- Affiliate System Wiring — Schema Additions
-- Run this in the Supabase SQL Editor after the main migration.sql

-- Track which affiliate referred a user
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by text;

-- Affiliate payout method (venmo, paypal, zelle)
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS payment_handle text;

-- Stripe coupon/promotion code created for each affiliate
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS stripe_promotion_code_id text;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS stripe_coupon_id text;
