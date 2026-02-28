# Nyx-Net Setup Guide

## 1. Appwrite Setup

### Create Project
1. Go to [cloud.appwrite.io](https://cloud.appwrite.io) and create a new project
2. Copy the Project ID → `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
3. Go to **Settings > API Keys** → create a key with all scopes → `APPWRITE_API_KEY`

### Configure Auth
1. In the Appwrite Console, go to **Auth > Settings**
2. Enable **Email/Password** sign-in
3. Enable **OAuth2 Providers**:
   - **Google**: Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com) → set redirect URI to `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/[PROJECT_ID]`
   - **GitHub**: Create OAuth app at [github.com/settings/developers](https://github.com/settings/developers) → set callback URL to `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/[PROJECT_ID]`

### Run Setup Script
```bash
# Fill in your .env.local first (copy from .env.local.example)
cp .env.local.example .env.local
# Edit .env.local with your Appwrite credentials

# Install dependencies
npm install

# Run the Appwrite setup script (creates database, collections, buckets, seed data)
npx tsx scripts/setup-appwrite.ts
```

This creates:
- Database: `nyx_net_db`
- 10 collections with all attributes and indexes
- 3 storage buckets (uploads, generations, avatars)
- Default site settings

---

## 2. Stripe Setup

### Create Products in Stripe Dashboard

Go to [dashboard.stripe.com/products](https://dashboard.stripe.com/products) and create:

#### Subscription Products

**Pro Plan** (`nyx_pro`):
- Monthly price: $20/month (recurring) → copy Price ID → `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID`
- Annual price: $120/year (recurring) → copy Price ID → `NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID`

**Enterprise Plan** (`nyx_enterprise`):
- Monthly price: $99/month (recurring) → copy Price ID → `NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID`
- Annual price: $594/year (recurring) → copy Price ID → `NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID`

#### Credit Pack Products (one-time payments)

| Product | Price | Price ID env var |
|---|---|---|
| Starter Pack (100 credits) | $5 | `NEXT_PUBLIC_STRIPE_PACK_100_PRICE_ID` |
| Creator Pack (500 credits) | $20 | `NEXT_PUBLIC_STRIPE_PACK_500_PRICE_ID` |
| Professional Pack (2,000 credits) | $60 | `NEXT_PUBLIC_STRIPE_PACK_2000_PRICE_ID` |
| Studio Pack (5,000 credits) | $125 | `NEXT_PUBLIC_STRIPE_PACK_5000_PRICE_ID` |

### Configure Webhook

1. Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### For Local Development

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook signing secret output to STRIPE_WEBHOOK_SECRET in .env.local
```

### Configure Customer Portal

1. Go to [dashboard.stripe.com/settings/billing/portal](https://dashboard.stripe.com/settings/billing/portal)
2. Enable:
   - Cancel subscription
   - Switch plans (upgrade/downgrade)
   - Update payment method
   - View invoices

---

## 3. Together.ai Setup

1. Sign up at [together.ai](https://www.together.ai/)
2. Go to [api.together.ai/settings/api-keys](https://api.together.ai/settings/api-keys)
3. Create an API key → `TOGETHER_API_KEY`
4. Add credits to your account for API usage

---

## 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` — `https://cloud.appwrite.io/v1`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` — Your Appwrite project ID
- `APPWRITE_API_KEY` — Appwrite API key with all scopes
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID` — `nyx_net_db` (default)
- `TOGETHER_API_KEY` — Together.ai API key
- `STRIPE_SECRET_KEY` — Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- All 8 `STRIPE_*_PRICE_ID` variables

---

## 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 6. Create Admin User

1. Sign up normally through the app
2. In the Appwrite Console, go to **Databases > nyx_net_db > profiles**
3. Find your profile document
4. Edit the `role` field from `user` to `admin`
5. You can now access `/admin` in the app

---

## 7. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Update NEXT_PUBLIC_APP_URL to your production URL
# Update Stripe webhook endpoint to production URL
# Update Appwrite OAuth redirect URIs to production URL
```
