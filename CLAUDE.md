# Nyx-Net — Project Context

## Overview
Nyx-Net.com is an AI-powered image & video generation SaaS platform. Users select from 54 AI models (32 image, 22 video) via Together.ai, pay with a credit system powered by Stripe, and manage everything through a full admin backend.

## Tech Stack
- **Framework:** Next.js 16+ (App Router, TypeScript, Tailwind CSS)
- **Auth/Database/Storage:** Appwrite Cloud (regional endpoint: `nyc.cloud.appwrite.io`)
- **Payments:** Stripe (test mode configured)
- **AI Backend:** Together.ai API (`together-ai` SDK)
- **State:** Zustand
- **Charts:** Recharts (dynamically imported)
- **Design:** "Midnight Nexus" theme — dark default (#0a0a0f), purple-to-cyan gradients

## Current Version: 1.0.0

## Build Status: Complete (all 7 phases, 39 routes, 0 build errors)

## Key Architecture Decisions
- **Appwrite (not Supabase):** Switched mid-build. Uses document-based collections, `node-appwrite` v22 server-side, `appwrite` client-side
- **node-appwrite v22:** No `InputFile` export — use `new File([Buffer.from(...)], filename, { type })` for storage uploads
- **Single storage bucket:** Free plan limits to 1 bucket. All three logical buckets (uploads, generations, avatars) point to the same `uploads` bucket ID
- **Credit system:** Sequential read-update-log pattern (no atomic SQL in Appwrite). `addCredits(userId, amount, description, referenceId?, type?)`
- **Stripe client:** Lazy Proxy-based initialization to avoid build-time failures when env vars aren't available
- **Static prerendering:** `export const dynamic = 'force-dynamic'` on root layout + auth/marketing layouts to prevent SSR failures with client components
- **Together.ai SDK:** Use `together.images.generate()` (not `.create()`), `as any` casts needed for strict typing

## Appwrite Configuration
- **Endpoint:** `https://nyc.cloud.appwrite.io/v1`
- **Project ID:** `69a0d9bc0020e9868799`
- **Database ID:** `69a1024b0026a0909987`
- **Collections (10):** profiles, generations, credit_transactions, subscriptions, credit_pack_purchases, prompts, page_views, api_usage_log, admin_activity_log, site_settings
- **Storage:** Single `uploads` bucket (free plan limit)
- **Auth:** Email/password + Google OAuth configured
- **Free plan attribute size limits:** String fields reduced (prompt: 1500, metadata: 1000, site_settings.value: 5000)

## Stripe Configuration (Test Mode)
- Products created: Pro ($20/mo), Enterprise ($99/mo), 4 credit packs ($5–$125)
- All 8 price IDs configured in `.env.local`
- Webhook endpoint: `/api/stripe/webhook` (needs Stripe CLI for local testing)

## File Structure Highlights
```
src/lib/appwrite/client.ts    — Browser client (Account, Databases, Storage)
src/lib/appwrite/server.ts    — Server clients: createAdminClient(), createSessionClient()
src/lib/together/models.ts    — Master model registry (single source of truth)
src/lib/stripe/client.ts      — Lazy Proxy-based Stripe instance
src/lib/credits.ts             — Credit check/deduct/add/refund
scripts/setup-appwrite.ts     — Collection/bucket/seed setup script
middleware.ts                  — Auth routing + analytics tracking
```

## Common Gotchas
- Appwrite free plan: 1 database, 1 bucket, limited attribute sizes per collection
- Appwrite: Cannot set default values on required attributes (use required=false with default)
- Zod uses `.issues` not `.errors` for validation error access
- Subscription tiers are `'free' | 'pro' | 'enterprise'` (not basic/standard/pro)
- Avatar component uses `fallback` prop (not `name`)
- Footer link keys use `link.label` (not `link.href`) to avoid duplicate `#` key errors
- ThemeToggle needs `mounted` state to prevent hydration mismatch

## What's Done
- All 7 build phases complete (Foundation → Auth → Studio → Monetization → Marketing → Admin → Polish)
- 39 routes (37 dynamic, 2 static)
- Appwrite fully configured (10 collections, indexes, seed data)
- Stripe products/prices created in test mode
- Together.ai API key configured
- Google OAuth enabled in Appwrite
- Build prompt (`nyx-net-build-prompt.md`) updated to reflect Appwrite
- Setup guide (`SETUP.md`) created
- Vercel deployment config (`vercel.json`) added

## What's Remaining
- Test full auth flow (login/signup/OAuth)
- Test image/video generation end-to-end with real Together.ai calls
- Test Stripe checkout flow (need Stripe CLI for webhooks locally)
- Configure GitHub OAuth in Appwrite (optional)
- Deploy to Vercel with production env vars
- Set up production Stripe webhook endpoint
