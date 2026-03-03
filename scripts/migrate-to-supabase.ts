/**
 * Appwrite → Supabase Migration Script
 *
 * Migrates all data from Appwrite collections + storage to Supabase.
 * Uses Appwrite REST API directly (no SDK needed since we uninstalled it).
 *
 * Usage:
 *   npx tsx scripts/migrate-to-supabase.ts
 *
 * Required env vars in .env.local:
 *   NEXT_PUBLIC_APPWRITE_ENDPOINT   (e.g. https://nyc.cloud.appwrite.io/v1)
 *   NEXT_PUBLIC_APPWRITE_PROJECT_ID (e.g. 69a0d9bc0020e9868799)
 *   NEXT_PUBLIC_APPWRITE_DATABASE_ID (e.g. 69a1024b0026a0909987)
 *   APPWRITE_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as dotenv from 'dotenv'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import * as path from 'path'

// Load env FIRST, before anything else reads process.env
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

// ---------------------------------------------------------------------------
// Field mapping: Appwrite camelCase → Supabase snake_case
// ---------------------------------------------------------------------------

const FIELD_MAPS: Record<string, Record<string, string>> = {
  profiles: {
    userId: 'user_id', fullName: 'full_name', avatarUrl: 'avatar_url',
    avatarPrompt: 'avatar_prompt', creditsBalance: 'credits_balance',
    creditsMonthly: 'credits_monthly', subscriptionTier: 'subscription_tier',
    stripeCustomerId: 'stripe_customer_id', stripeSubscriptionId: 'stripe_subscription_id',
    subscriptionStatus: 'subscription_status', subscriptionPeriod: 'subscription_period',
    currentPeriodEnd: 'current_period_end', totalGenerations: 'total_generations',
    totalImages: 'total_images', totalVideos: 'total_videos', lastActiveAt: 'last_active_at',
  },
  generations: {
    userId: 'user_id', negativePrompt: 'negative_prompt', inputImageUrl: 'input_image_url',
    outputUrl: 'output_url', outputThumbnailUrl: 'output_thumbnail_url',
    durationSeconds: 'duration_seconds', aspectRatio: 'aspect_ratio',
    creditsUsed: 'credits_used', errorMessage: 'error_message',
    togetherJobId: 'together_job_id', completedAt: 'completed_at',
  },
  credit_transactions: {
    userId: 'user_id', referenceId: 'reference_id', balanceAfter: 'balance_after',
  },
  subscriptions: {
    userId: 'user_id', stripeSubscriptionId: 'stripe_subscription_id',
    stripeCustomerId: 'stripe_customer_id', creditsPerMonth: 'credits_per_month',
    priceMonthly: 'price_monthly', priceAnnual: 'price_annual',
    currentPeriodStart: 'current_period_start', currentPeriodEnd: 'current_period_end',
    cancelAtPeriodEnd: 'cancel_at_period_end',
  },
  credit_pack_purchases: {
    userId: 'user_id', packName: 'pack_name', creditsAmount: 'credits_amount',
    stripePaymentIntentId: 'stripe_payment_intent_id',
    stripeCheckoutSessionId: 'stripe_checkout_session_id', expiresAt: 'expires_at',
  },
  prompts: {
    promptText: 'prompt_text', modelType: 'model_type',
    previewImageUrl: 'preview_image_url', modelUsed: 'model_used',
    isFeatured: 'is_featured', isPublished: 'is_published',
    usageCount: 'usage_count', sortOrder: 'sort_order',
    createdBy: 'created_by', submissionStatus: 'submission_status',
    submittedBy: 'submitted_by', submitterName: 'submitter_name',
  },
  page_views: {
    userId: 'user_id', isAdmin: 'is_admin', sessionId: 'session_id',
    userAgent: 'user_agent', ipHash: 'ip_hash',
  },
  api_usage_log: {
    userId: 'user_id', requestType: 'request_type', tokensUsed: 'tokens_used',
    costEstimate: 'cost_estimate', latencyMs: 'latency_ms',
    statusCode: 'status_code', requestMetadata: 'request_metadata',
  },
  admin_activity_log: {
    adminId: 'admin_id', targetType: 'target_type', targetId: 'target_id',
  },
  site_settings: {
    updatedBy: 'updated_by',
  },
  affiliates: {
    userId: 'user_id', totalClicks: 'total_clicks', totalSignups: 'total_signups',
    totalConversions: 'total_conversions', totalEarnings: 'total_earnings',
    pendingBalance: 'pending_balance', paidOut: 'paid_out',
    createdAt: '__skip__',  // Appwrite stored this as a custom attribute; we use $createdAt → created_at instead
  },
  affiliate_events: {
    affiliateId: 'affiliate_id', referredUserId: 'referred_user_id',
    orderId: 'order_id', saleAmount: 'sale_amount',
    createdAt: '__skip__',
  },
}

/** Convert an Appwrite document to a Supabase row */
function mapDocument(collection: string, doc: any): Record<string, any> {
  const fieldMap = FIELD_MAPS[collection] || {}
  const row: Record<string, any> = {}

  // Tables that have an updated_at column
  const HAS_UPDATED_AT = new Set([
    'profiles', 'generations', 'subscriptions', 'prompts',
    'site_settings', 'affiliates',
  ])

  row.id = doc.$id
  row.created_at = doc.$createdAt
  if (doc.$updatedAt && HAS_UPDATED_AT.has(collection)) {
    row.updated_at = doc.$updatedAt
  }

  for (const [key, value] of Object.entries(doc)) {
    if (key.startsWith('$')) continue

    const snakeKey = fieldMap[key] || key
    if (snakeKey === '__skip__') continue
    if (['metadata', 'details', 'requestMetadata'].includes(key) && typeof value === 'string') {
      try { row[snakeKey] = JSON.parse(value) } catch { row[snakeKey] = value }
    } else if (key === 'value' && collection === 'site_settings' && typeof value === 'string') {
      try { row[snakeKey] = JSON.parse(value) } catch { row[snakeKey] = value }
    } else {
      row[snakeKey] = value
    }
  }

  return row
}

const COLLECTIONS = [
  'profiles', 'generations', 'credit_transactions', 'subscriptions',
  'credit_pack_purchases', 'prompts', 'page_views', 'api_usage_log',
  'admin_activity_log', 'site_settings', 'affiliates', 'affiliate_events',
]

// ---------------------------------------------------------------------------
// Main — everything that touches env vars lives here
// ---------------------------------------------------------------------------

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗')
  console.log('║   Appwrite → Supabase Migration                  ║')
  console.log('╚═══════════════════════════════════════════════════╝')

  // Validate env vars
  const required = [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT', 'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID', 'APPWRITE_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  ]
  const missing = required.filter(k => !process.env[k])
  if (missing.length) {
    console.error(`\nMissing env vars: ${missing.join(', ')}`)
    console.error(`\nMake sure these are set in your .env.local file:`)
    for (const k of missing) console.error(`  ${k}=<value>`)
    process.exit(1)
  }

  // Read config AFTER env validation
  const AW_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
  const AW_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  const AW_DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
  const AW_KEY = process.env.APPWRITE_API_KEY!
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  console.log(`\nAppwrite: ${AW_ENDPOINT} (project ${AW_PROJECT})`)
  console.log(`Supabase: ${SB_URL}`)

  // Create Supabase client AFTER env vars are confirmed present
  const supabase = createClient(SB_URL, SB_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Appwrite REST helpers
  const awHeaders = {
    'X-Appwrite-Project': AW_PROJECT,
    'X-Appwrite-Key': AW_KEY,
    'Content-Type': 'application/json',
  }

  async function awFetch(urlPath: string) {
    const res = await fetch(`${AW_ENDPOINT}${urlPath}`, { headers: awHeaders })
    if (!res.ok) throw new Error(`Appwrite ${urlPath}: ${res.status} ${await res.text()}`)
    return res.json()
  }

  /** Build Appwrite REST query params (JSON-encoded format for v1.5+) */
  function awQueryParams(limit: number, offset: number): string {
    const q1 = encodeURIComponent(JSON.stringify({ method: 'limit', values: [limit] }))
    const q2 = encodeURIComponent(JSON.stringify({ method: 'offset', values: [offset] }))
    return `queries[]=${q1}&queries[]=${q2}`
  }

  async function awListAll(collectionId: string): Promise<any[]> {
    const docs: any[] = []
    let offset = 0
    const limit = 100
    while (true) {
      const url = `/databases/${AW_DB}/collections/${collectionId}/documents?${awQueryParams(limit, offset)}`
      const res = await awFetch(url)
      docs.push(...res.documents)
      if (docs.length >= res.total || res.documents.length < limit) break
      offset += limit
    }
    return docs
  }

  async function awListFiles(bucketId: string): Promise<any[]> {
    const files: any[] = []
    let offset = 0
    const limit = 100
    while (true) {
      const url = `/storage/buckets/${bucketId}/files?${awQueryParams(limit, offset)}`
      const res = await awFetch(url)
      files.push(...res.files)
      if (files.length >= res.total || res.files.length < limit) break
      offset += limit
    }
    return files
  }

  async function awDownloadFile(bucketId: string, fileId: string): Promise<Buffer> {
    const res = await fetch(`${AW_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view`, {
      headers: { 'X-Appwrite-Project': AW_PROJECT, 'X-Appwrite-Key': AW_KEY },
    })
    if (!res.ok) throw new Error(`Download ${fileId}: ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
  }

  // =========================================================================
  // Step 1: Migrate collection data
  // =========================================================================
  console.log('\n=== Migrating Collections ===\n')

  for (const collection of COLLECTIONS) {
    process.stdout.write(`  ${collection}: fetching... `)
    try {
      const docs = await awListAll(collection)
      console.log(`${docs.length} documents`)

      if (docs.length === 0) continue

      const rows = docs.map(doc => mapDocument(collection, doc))

      const batchSize = 500
      let inserted = 0
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        const { error } = await supabase.from(collection).upsert(batch, { onConflict: 'id' })
        if (error) {
          console.error(`    ERROR batch ${i}: ${error.message}`)
          for (const row of batch) {
            const { error: rowErr } = await supabase.from(collection).upsert(row, { onConflict: 'id' })
            if (rowErr) {
              console.error(`    SKIP row ${row.id}: ${rowErr.message}`)
            } else {
              inserted++
            }
          }
        } else {
          inserted += batch.length
        }
      }
      console.log(`    → ${inserted}/${docs.length} rows inserted`)
    } catch (err: any) {
      console.error(`    FAILED: ${err.message}`)
    }
  }

  // =========================================================================
  // Step 2: Migrate storage files
  // =========================================================================
  console.log('\n=== Migrating Storage ===\n')

  process.stdout.write('  Listing Appwrite files... ')
  let files: any[] = []
  try {
    files = await awListFiles('uploads')
    console.log(`${files.length} files found`)
  } catch (err: any) {
    console.error(`FAILED: ${err.message}`)
  }

  if (files.length > 0) {
    let migrated = 0, skipped = 0, failed = 0

    for (const file of files) {
      const fileId = file.$id
      const fileName = file.name || fileId
      const mimeType = file.mimeType || 'application/octet-stream'

      let targetBucket = 'uploads'
      if (fileName.includes('avatar') || fileId.includes('avatar')) {
        targetBucket = 'avatars'
      } else if (fileName.includes('gen-') || fileName.includes('generation')) {
        targetBucket = 'generations'
      }

      const targetPath = fileName

      try {
        const { data: existing } = await supabase.storage.from(targetBucket).list('', {
          search: fileName, limit: 1,
        })
        if (existing && existing.some(f => f.name === fileName)) {
          skipped++
          continue
        }

        const buffer = await awDownloadFile('uploads', fileId)

        const { error } = await supabase.storage
          .from(targetBucket)
          .upload(targetPath, buffer, { contentType: mimeType, upsert: true })

        if (error) {
          console.error(`    FAIL ${fileId} → ${targetBucket}/${targetPath}: ${error.message}`)
          failed++
        } else {
          migrated++
          if (migrated % 10 === 0) process.stdout.write(`  ${migrated} files migrated...\r`)
        }
      } catch (err: any) {
        console.error(`    FAIL ${fileId}: ${err.message}`)
        failed++
      }
    }

    console.log(`\n  Storage: ${migrated} migrated, ${skipped} skipped, ${failed} failed`)
  }

  // =========================================================================
  // Step 3: Rewrite Appwrite storage URLs → Supabase
  // =========================================================================
  console.log('\n=== Updating Storage URLs ===\n')

  const sbStorageUrl = `${SB_URL}/storage/v1/object/public`

  function rewriteUrl(url: string | null): string | null {
    if (!url) return null
    const match = url.match(/\/storage\/buckets\/uploads\/files\/([^/]+)\/view/)
    if (!match) return url
    return `${sbStorageUrl}/uploads/${match[1]}`
  }

  // profiles.avatar_url
  const { data: profiles } = await supabase.from('profiles').select('id, avatar_url')
  if (profiles) {
    let updated = 0
    for (const p of profiles) {
      if (p.avatar_url && p.avatar_url.includes('appwrite')) {
        const newUrl = rewriteUrl(p.avatar_url)
        if (newUrl !== p.avatar_url) {
          await supabase.from('profiles').update({ avatar_url: newUrl }).eq('id', p.id)
          updated++
        }
      }
    }
    console.log(`  profiles.avatar_url: ${updated} updated`)
  }

  // generations.output_url + input_image_url
  const { data: generations } = await supabase.from('generations').select('id, output_url, input_image_url')
  if (generations) {
    let updated = 0
    for (const g of generations) {
      const updates: any = {}
      if (g.output_url?.includes('appwrite')) updates.output_url = rewriteUrl(g.output_url)
      if (g.input_image_url?.includes('appwrite')) updates.input_image_url = rewriteUrl(g.input_image_url)
      if (Object.keys(updates).length > 0) {
        await supabase.from('generations').update(updates).eq('id', g.id)
        updated++
      }
    }
    console.log(`  generations URLs: ${updated} updated`)
  }

  // prompts.preview_image_url
  const { data: prompts } = await supabase.from('prompts').select('id, preview_image_url')
  if (prompts) {
    let updated = 0
    for (const p of prompts) {
      if (p.preview_image_url?.includes('appwrite')) {
        const newUrl = rewriteUrl(p.preview_image_url)
        if (newUrl !== p.preview_image_url) {
          await supabase.from('prompts').update({ preview_image_url: newUrl }).eq('id', p.id)
          updated++
        }
      }
    }
    console.log(`  prompts.preview_image_url: ${updated} updated`)
  }

  // =========================================================================
  // Step 4: Migrate auth users + remap user_id
  // =========================================================================
  console.log('\n=== Auth Users ===\n')

  let awUsers: any[] = []
  let offset = 0
  while (true) {
    const res = await awFetch(`/users?${awQueryParams(100, offset)}`)
    awUsers.push(...res.users)
    if (awUsers.length >= res.total || res.users.length < 100) break
    offset += 100
  }

  console.log(`  Found ${awUsers.length} Appwrite auth users`)

  const oauthUsers = awUsers.filter(u => u.identities?.some((i: any) => i.provider !== 'email'))
  const emailUsers = awUsers.filter(u => !u.identities?.length || u.identities.every((i: any) => i.provider === 'email'))

  console.log(`  OAuth users: ${oauthUsers.length} (will auto-link on next sign-in)`)
  console.log(`  Email/password users: ${emailUsers.length} (will need "Forgot password")`)

  if (emailUsers.length > 0) {
    console.log('\n  Creating Supabase auth accounts for email users...')
    let created = 0, skippedAuth = 0
    for (const user of emailUsers) {
      try {
        const { error } = await supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: true,
          user_metadata: {
            full_name: user.name || '',
            migrated_from_appwrite: true,
            appwrite_user_id: user.$id,
          },
        })
        if (error) {
          if (error.message.includes('already been registered')) skippedAuth++
          else console.error(`    FAIL ${user.email}: ${error.message}`)
        } else {
          created++
        }
      } catch (err: any) {
        console.error(`    FAIL ${user.email}: ${err.message}`)
      }
    }
    console.log(`    ${created} created, ${skippedAuth} already existed`)
  }

  // Remap user_id from Appwrite IDs to Supabase IDs
  console.log('\n  Remapping user_id to Supabase auth IDs...')

  const { data: sbAuthData } = await supabase.auth.admin.listUsers()
  const sbUsers = sbAuthData?.users || []

  const emailToSbId = new Map<string, string>()
  for (const u of sbUsers) {
    if (u.email) emailToSbId.set(u.email.toLowerCase(), u.id)
  }

  const { data: profileRows } = await supabase.from('profiles').select('id, user_id, email')
  if (profileRows) {
    let remapped = 0
    for (const profile of profileRows) {
      const sbId = emailToSbId.get(profile.email?.toLowerCase())
      if (sbId && sbId !== profile.user_id) {
        const oldId = profile.user_id
        await supabase.from('profiles').update({ user_id: sbId }).eq('id', profile.id)
        await supabase.from('generations').update({ user_id: sbId }).eq('user_id', oldId)
        await supabase.from('credit_transactions').update({ user_id: sbId }).eq('user_id', oldId)
        await supabase.from('subscriptions').update({ user_id: sbId }).eq('user_id', oldId)
        await supabase.from('credit_pack_purchases').update({ user_id: sbId }).eq('user_id', oldId)
        remapped++
      }
    }
    console.log(`    ${remapped} profiles remapped`)
  }

  // =========================================================================
  // Done
  // =========================================================================
  console.log('\n╔═══════════════════════════════════════════════════╗')
  console.log('║   Migration Complete!                             ║')
  console.log('╠═══════════════════════════════════════════════════╣')
  console.log('║   Next steps:                                     ║')
  console.log('║   1. Email/password users: use "Forgot password"  ║')
  console.log('║   2. OAuth users: sign in normally (auto-links)   ║')
  console.log('║   3. Verify data in Supabase Dashboard            ║')
  console.log('║   4. Deploy to Vercel with new env vars           ║')
  console.log('╚═══════════════════════════════════════════════════╝')
}

main().catch(err => {
  console.error('\nFATAL:', err)
  process.exit(1)
})
