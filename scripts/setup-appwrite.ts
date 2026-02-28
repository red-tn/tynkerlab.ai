import { Client, Databases, Storage, ID, Permission, Role } from 'node-appwrite'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)

const databases = new Databases(client)
const storage = new Storage(client)

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'nyx_net_db'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function createAttr(collectionId: string, fn: () => Promise<any>) {
  try {
    await fn()
    await sleep(500) // Give Appwrite time to process
  } catch (e: any) {
    if (e.code === 409) {
      console.log(`  Attribute already exists, skipping...`)
    } else {
      throw e
    }
  }
}

async function main() {
  console.log('Setting up Appwrite for Tynkerlab...\n')

  // 1. Create Database (or use existing one)
  try {
    await databases.create(DATABASE_ID, 'Tynkerlab Database')
    console.log('✓ Database created')
  } catch (e: any) {
    if (e.code === 409) console.log('→ Database already exists')
    else if (e.code === 403 && e.type === 'additional_resource_not_allowed') {
      // Free plan limit reached — check if our database already exists
      const existing = await databases.list()
      const found = existing.databases.find(d => d.$id === DATABASE_ID)
      if (found) {
        console.log(`→ Using existing database '${found.name}' (${found.$id})`)
      } else {
        console.error('✗ Database limit reached and no matching database found. Delete the existing database or upgrade your plan.')
        process.exit(1)
      }
    } else throw e
  }

  // 2. Create Collections
  const collections = [
    'profiles', 'generations', 'credit_transactions', 'subscriptions',
    'credit_pack_purchases', 'prompts', 'page_views', 'api_usage_log',
    'admin_activity_log', 'site_settings', 'affiliates', 'affiliate_events'
  ]

  for (const col of collections) {
    try {
      await databases.createCollection(DATABASE_ID, col, col, [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ])
      console.log(`✓ Collection '${col}' created`)
    } catch (e: any) {
      if (e.code === 409) console.log(`→ Collection '${col}' already exists`)
      else throw e
    }
  }

  // 3. Create Attributes

  // --- profiles ---
  console.log('\nCreating profile attributes...')
  const pid = 'profiles'
  await createAttr(pid, () => databases.createStringAttribute(DATABASE_ID, pid, 'userId', 36, true))
  await createAttr(pid, () => databases.createEmailAttribute(DATABASE_ID, pid, 'email', true))
  await createAttr(pid, () => databases.createStringAttribute(DATABASE_ID, pid, 'fullName', 255, false, null))
  await createAttr(pid, () => databases.createUrlAttribute(DATABASE_ID, pid, 'avatarUrl', false, undefined))
  await createAttr(pid, () => databases.createStringAttribute(DATABASE_ID, pid, 'avatarPrompt', 5000, false, null))
  await createAttr(pid, () => databases.createEnumAttribute(DATABASE_ID, pid, 'role', ['user', 'admin'], false, 'user'))
  await createAttr(pid, () => databases.createIntegerAttribute(DATABASE_ID, pid, 'creditsBalance', false, 0, undefined, 0))
  await createAttr(pid, () => databases.createIntegerAttribute(DATABASE_ID, pid, 'creditsMonthly', false, 0, undefined, 0))
  await createAttr(pid, () => databases.createEnumAttribute(DATABASE_ID, pid, 'subscriptionTier', ['free', 'pro', 'enterprise'], false, 'free'))
  await createAttr(pid, () => databases.createStringAttribute(DATABASE_ID, pid, 'stripeCustomerId', 255, false, null))
  await createAttr(pid, () => databases.createStringAttribute(DATABASE_ID, pid, 'stripeSubscriptionId', 255, false, null))
  await createAttr(pid, () => databases.createStringAttribute(DATABASE_ID, pid, 'subscriptionStatus', 50, false, 'inactive'))
  await createAttr(pid, () => databases.createEnumAttribute(DATABASE_ID, pid, 'subscriptionPeriod', ['monthly', 'annual'], false, 'monthly'))
  await createAttr(pid, () => databases.createDatetimeAttribute(DATABASE_ID, pid, 'currentPeriodEnd', false))
  await createAttr(pid, () => databases.createIntegerAttribute(DATABASE_ID, pid, 'totalGenerations', false, 0, undefined, 0))
  await createAttr(pid, () => databases.createIntegerAttribute(DATABASE_ID, pid, 'totalImages', false, 0, undefined, 0))
  await createAttr(pid, () => databases.createIntegerAttribute(DATABASE_ID, pid, 'totalVideos', false, 0, undefined, 0))
  await createAttr(pid, () => databases.createDatetimeAttribute(DATABASE_ID, pid, 'lastActiveAt', false))
  await createAttr(pid, () => databases.createStringAttribute(DATABASE_ID, pid, 'bio', 500, false, null))
  await createAttr(pid, () => databases.createStringAttribute(DATABASE_ID, pid, 'location', 100, false, null))
  await createAttr(pid, () => databases.createUrlAttribute(DATABASE_ID, pid, 'website', false, undefined))
  console.log('✓ Profile attributes created')

  // --- generations --- (sizes reduced to fit free plan attribute limits)
  console.log('\nCreating generation attributes...')
  const gid = 'generations'
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'userId', 36, true))
  await createAttr(gid, () => databases.createEnumAttribute(DATABASE_ID, gid, 'type', ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video'], true))
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'model', 100, true))
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'prompt', 1500, false))
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'negativePrompt', 500, false))
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'inputImageUrl', 500, false))
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'outputUrl', 500, false))
  await createAttr(gid, () => databases.createIntegerAttribute(DATABASE_ID, gid, 'width', false))
  await createAttr(gid, () => databases.createIntegerAttribute(DATABASE_ID, gid, 'height', false))
  await createAttr(gid, () => databases.createIntegerAttribute(DATABASE_ID, gid, 'durationSeconds', false))
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'resolution', 20, false))
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'aspectRatio', 10, false))
  await createAttr(gid, () => databases.createIntegerAttribute(DATABASE_ID, gid, 'steps', false))
  await createAttr(gid, () => databases.createIntegerAttribute(DATABASE_ID, gid, 'seed', false))
  await createAttr(gid, () => databases.createIntegerAttribute(DATABASE_ID, gid, 'creditsUsed', false, 0, undefined, 0))
  await createAttr(gid, () => databases.createEnumAttribute(DATABASE_ID, gid, 'status', ['pending', 'processing', 'completed', 'failed'], false, 'pending'))
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'errorMessage', 500, false))
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'togetherJobId', 100, false))
  await createAttr(gid, () => databases.createStringAttribute(DATABASE_ID, gid, 'metadata', 1000, false))
  await createAttr(gid, () => databases.createDatetimeAttribute(DATABASE_ID, gid, 'completedAt', false))
  console.log('✓ Generation attributes created')

  // --- credit_transactions ---
  console.log('\nCreating credit transaction attributes...')
  const ctid = 'credit_transactions'
  await createAttr(ctid, () => databases.createStringAttribute(DATABASE_ID, ctid, 'userId', 36, true))
  await createAttr(ctid, () => databases.createIntegerAttribute(DATABASE_ID, ctid, 'amount', true))
  await createAttr(ctid, () => databases.createEnumAttribute(DATABASE_ID, ctid, 'type', ['subscription_renewal', 'credit_pack_purchase', 'generation_debit', 'admin_adjustment', 'refund'], true))
  await createAttr(ctid, () => databases.createStringAttribute(DATABASE_ID, ctid, 'description', 500, false))
  await createAttr(ctid, () => databases.createStringAttribute(DATABASE_ID, ctid, 'referenceId', 255, false))
  await createAttr(ctid, () => databases.createIntegerAttribute(DATABASE_ID, ctid, 'balanceAfter', true))
  console.log('✓ Credit transaction attributes created')

  // --- subscriptions ---
  console.log('\nCreating subscription attributes...')
  const sid = 'subscriptions'
  await createAttr(sid, () => databases.createStringAttribute(DATABASE_ID, sid, 'userId', 36, true))
  await createAttr(sid, () => databases.createStringAttribute(DATABASE_ID, sid, 'stripeSubscriptionId', 255, true))
  await createAttr(sid, () => databases.createStringAttribute(DATABASE_ID, sid, 'stripeCustomerId', 255, true))
  await createAttr(sid, () => databases.createEnumAttribute(DATABASE_ID, sid, 'tier', ['pro', 'enterprise'], true))
  await createAttr(sid, () => databases.createEnumAttribute(DATABASE_ID, sid, 'period', ['monthly', 'annual'], true))
  await createAttr(sid, () => databases.createStringAttribute(DATABASE_ID, sid, 'status', 50, false, 'active'))
  await createAttr(sid, () => databases.createIntegerAttribute(DATABASE_ID, sid, 'creditsPerMonth', true))
  await createAttr(sid, () => databases.createFloatAttribute(DATABASE_ID, sid, 'priceMonthly', true))
  await createAttr(sid, () => databases.createFloatAttribute(DATABASE_ID, sid, 'priceAnnual', true))
  await createAttr(sid, () => databases.createDatetimeAttribute(DATABASE_ID, sid, 'currentPeriodStart', true))
  await createAttr(sid, () => databases.createDatetimeAttribute(DATABASE_ID, sid, 'currentPeriodEnd', true))
  await createAttr(sid, () => databases.createBooleanAttribute(DATABASE_ID, sid, 'cancelAtPeriodEnd', false, false))
  console.log('✓ Subscription attributes created')

  // --- credit_pack_purchases ---
  console.log('\nCreating credit pack purchase attributes...')
  const cpid = 'credit_pack_purchases'
  await createAttr(cpid, () => databases.createStringAttribute(DATABASE_ID, cpid, 'userId', 36, true))
  await createAttr(cpid, () => databases.createStringAttribute(DATABASE_ID, cpid, 'packName', 100, true))
  await createAttr(cpid, () => databases.createIntegerAttribute(DATABASE_ID, cpid, 'creditsAmount', true))
  await createAttr(cpid, () => databases.createFloatAttribute(DATABASE_ID, cpid, 'price', true))
  await createAttr(cpid, () => databases.createStringAttribute(DATABASE_ID, cpid, 'stripePaymentIntentId', 255, false))
  await createAttr(cpid, () => databases.createStringAttribute(DATABASE_ID, cpid, 'stripeCheckoutSessionId', 255, false))
  await createAttr(cpid, () => databases.createStringAttribute(DATABASE_ID, cpid, 'status', 50, false, 'completed'))
  await createAttr(cpid, () => databases.createDatetimeAttribute(DATABASE_ID, cpid, 'expiresAt', false))
  console.log('✓ Credit pack purchase attributes created')

  // --- prompts ---
  console.log('\nCreating prompt attributes...')
  const prid = 'prompts'
  await createAttr(prid, () => databases.createStringAttribute(DATABASE_ID, prid, 'title', 255, true))
  await createAttr(prid, () => databases.createStringAttribute(DATABASE_ID, prid, 'promptText', 2000, true))
  await createAttr(prid, () => databases.createEnumAttribute(DATABASE_ID, prid, 'category', ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video', 'general'], true))
  await createAttr(prid, () => databases.createEnumAttribute(DATABASE_ID, prid, 'modelType', ['image', 'video'], false, 'image'))
  await createAttr(prid, () => databases.createStringAttribute(DATABASE_ID, prid, 'tags', 100, false, null, true))
  await createAttr(prid, () => databases.createUrlAttribute(DATABASE_ID, prid, 'previewImageUrl', false))
  await createAttr(prid, () => databases.createStringAttribute(DATABASE_ID, prid, 'modelUsed', 255, false))
  await createAttr(prid, () => databases.createBooleanAttribute(DATABASE_ID, prid, 'isFeatured', false, false))
  await createAttr(prid, () => databases.createBooleanAttribute(DATABASE_ID, prid, 'isPublished', false, true))
  await createAttr(prid, () => databases.createIntegerAttribute(DATABASE_ID, prid, 'usageCount', false, 0, undefined, 0))
  await createAttr(prid, () => databases.createIntegerAttribute(DATABASE_ID, prid, 'sortOrder', false, 0, undefined, 0))
  await createAttr(prid, () => databases.createStringAttribute(DATABASE_ID, prid, 'createdBy', 36, false))
  await createAttr(prid, () => databases.createEnumAttribute(DATABASE_ID, prid, 'submissionStatus', ['pending', 'approved', 'rejected', 'admin'], false, 'admin'))
  await createAttr(prid, () => databases.createStringAttribute(DATABASE_ID, prid, 'submittedBy', 36, false))
  await createAttr(prid, () => databases.createStringAttribute(DATABASE_ID, prid, 'submitterName', 100, false))
  console.log('✓ Prompt attributes created')

  // --- page_views ---
  console.log('\nCreating page view attributes...')
  const pvid = 'page_views'
  await createAttr(pvid, () => databases.createStringAttribute(DATABASE_ID, pvid, 'path', 255, true))
  await createAttr(pvid, () => databases.createStringAttribute(DATABASE_ID, pvid, 'userId', 36, false))
  await createAttr(pvid, () => databases.createBooleanAttribute(DATABASE_ID, pvid, 'isAdmin', false, false))
  await createAttr(pvid, () => databases.createStringAttribute(DATABASE_ID, pvid, 'sessionId', 255, false))
  await createAttr(pvid, () => databases.createStringAttribute(DATABASE_ID, pvid, 'referrer', 500, false))
  await createAttr(pvid, () => databases.createStringAttribute(DATABASE_ID, pvid, 'userAgent', 255, false))
  await createAttr(pvid, () => databases.createStringAttribute(DATABASE_ID, pvid, 'ipHash', 64, false))
  await createAttr(pvid, () => databases.createStringAttribute(DATABASE_ID, pvid, 'country', 10, false))
  console.log('✓ Page view attributes created')

  // --- api_usage_log ---
  console.log('\nCreating API usage log attributes...')
  const auid = 'api_usage_log'
  await createAttr(auid, () => databases.createStringAttribute(DATABASE_ID, auid, 'userId', 36, false))
  await createAttr(auid, () => databases.createStringAttribute(DATABASE_ID, auid, 'endpoint', 255, true))
  await createAttr(auid, () => databases.createStringAttribute(DATABASE_ID, auid, 'model', 255, true))
  await createAttr(auid, () => databases.createStringAttribute(DATABASE_ID, auid, 'requestType', 50, true))
  await createAttr(auid, () => databases.createIntegerAttribute(DATABASE_ID, auid, 'tokensUsed', false, 0))
  await createAttr(auid, () => databases.createFloatAttribute(DATABASE_ID, auid, 'costEstimate', false))
  await createAttr(auid, () => databases.createIntegerAttribute(DATABASE_ID, auid, 'latencyMs', false))
  await createAttr(auid, () => databases.createIntegerAttribute(DATABASE_ID, auid, 'statusCode', false))
  await createAttr(auid, () => databases.createStringAttribute(DATABASE_ID, auid, 'error', 500, false))
  await createAttr(auid, () => databases.createStringAttribute(DATABASE_ID, auid, 'requestMetadata', 1000, false))
  console.log('✓ API usage log attributes created')

  // --- admin_activity_log ---
  console.log('\nCreating admin activity log attributes...')
  const aalid = 'admin_activity_log'
  await createAttr(aalid, () => databases.createStringAttribute(DATABASE_ID, aalid, 'adminId', 36, true))
  await createAttr(aalid, () => databases.createStringAttribute(DATABASE_ID, aalid, 'action', 255, true))
  await createAttr(aalid, () => databases.createStringAttribute(DATABASE_ID, aalid, 'targetType', 50, false))
  await createAttr(aalid, () => databases.createStringAttribute(DATABASE_ID, aalid, 'targetId', 255, false))
  await createAttr(aalid, () => databases.createStringAttribute(DATABASE_ID, aalid, 'details', 1000, false))
  console.log('✓ Admin activity log attributes created')

  // --- site_settings ---
  console.log('\nCreating site settings attributes...')
  const ssid = 'site_settings'
  await createAttr(ssid, () => databases.createStringAttribute(DATABASE_ID, ssid, 'key', 100, true))
  await createAttr(ssid, () => databases.createStringAttribute(DATABASE_ID, ssid, 'value', 5000, true))
  await createAttr(ssid, () => databases.createStringAttribute(DATABASE_ID, ssid, 'description', 500, false))
  await createAttr(ssid, () => databases.createStringAttribute(DATABASE_ID, ssid, 'updatedBy', 36, false))
  console.log('✓ Site settings attributes created')

  // --- affiliates ---
  console.log('\nCreating affiliate attributes...')
  const affid = 'affiliates'
  await createAttr(affid, () => databases.createStringAttribute(DATABASE_ID, affid, 'userId', 36, true))
  await createAttr(affid, () => databases.createStringAttribute(DATABASE_ID, affid, 'code', 10, true))
  await createAttr(affid, () => databases.createEnumAttribute(DATABASE_ID, affid, 'status', ['active', 'suspended', 'paused'], false, 'active'))
  await createAttr(affid, () => databases.createIntegerAttribute(DATABASE_ID, affid, 'totalClicks', false, 0, undefined, 0))
  await createAttr(affid, () => databases.createIntegerAttribute(DATABASE_ID, affid, 'totalSignups', false, 0, undefined, 0))
  await createAttr(affid, () => databases.createIntegerAttribute(DATABASE_ID, affid, 'totalConversions', false, 0, undefined, 0))
  await createAttr(affid, () => databases.createFloatAttribute(DATABASE_ID, affid, 'totalEarnings', false, 0))
  await createAttr(affid, () => databases.createFloatAttribute(DATABASE_ID, affid, 'pendingBalance', false, 0))
  await createAttr(affid, () => databases.createFloatAttribute(DATABASE_ID, affid, 'paidOut', false, 0))
  await createAttr(affid, () => databases.createStringAttribute(DATABASE_ID, affid, 'createdAt', 30, true))
  console.log('✓ Affiliate attributes created')

  // --- affiliate_events ---
  console.log('\nCreating affiliate event attributes...')
  const aeid = 'affiliate_events'
  await createAttr(aeid, () => databases.createStringAttribute(DATABASE_ID, aeid, 'affiliateId', 36, true))
  await createAttr(aeid, () => databases.createEnumAttribute(DATABASE_ID, aeid, 'type', ['click', 'signup', 'commission', 'payout'], true))
  await createAttr(aeid, () => databases.createStringAttribute(DATABASE_ID, aeid, 'referredUserId', 36, false))
  await createAttr(aeid, () => databases.createStringAttribute(DATABASE_ID, aeid, 'orderId', 255, false))
  await createAttr(aeid, () => databases.createFloatAttribute(DATABASE_ID, aeid, 'saleAmount', false, 0))
  await createAttr(aeid, () => databases.createFloatAttribute(DATABASE_ID, aeid, 'commission', false, 0))
  await createAttr(aeid, () => databases.createStringAttribute(DATABASE_ID, aeid, 'createdAt', 30, true))
  console.log('✓ Affiliate event attributes created')

  // 4. Wait for attributes to be available
  console.log('\nWaiting for attributes to sync...')
  await sleep(5000)

  // 5. Create Indexes
  console.log('\nCreating indexes...')
  const indexes = [
    { col: 'profiles', key: 'idx_userId', type: 'key' as const, attrs: ['userId'] },
    { col: 'profiles', key: 'idx_email', type: 'unique' as const, attrs: ['email'] },
    { col: 'profiles', key: 'idx_stripeCustomerId', type: 'key' as const, attrs: ['stripeCustomerId'] },
    { col: 'generations', key: 'idx_gen_userId', type: 'key' as const, attrs: ['userId'] },
    { col: 'generations', key: 'idx_gen_status', type: 'key' as const, attrs: ['status'] },
    { col: 'generations', key: 'idx_gen_type', type: 'key' as const, attrs: ['type'] },
    { col: 'credit_transactions', key: 'idx_ct_userId', type: 'key' as const, attrs: ['userId'] },
    { col: 'subscriptions', key: 'idx_sub_userId', type: 'key' as const, attrs: ['userId'] },
    { col: 'subscriptions', key: 'idx_sub_stripeId', type: 'unique' as const, attrs: ['stripeSubscriptionId'] },
    { col: 'prompts', key: 'idx_pr_category', type: 'key' as const, attrs: ['category'] },
    { col: 'prompts', key: 'idx_pr_published', type: 'key' as const, attrs: ['isPublished'] },
    { col: 'page_views', key: 'idx_pv_path', type: 'key' as const, attrs: ['path'] },
    { col: 'api_usage_log', key: 'idx_au_model', type: 'key' as const, attrs: ['model'] },
    { col: 'site_settings', key: 'idx_ss_key', type: 'unique' as const, attrs: ['key'] },
    { col: 'affiliates', key: 'idx_aff_userId', type: 'key' as const, attrs: ['userId'] },
    { col: 'affiliates', key: 'idx_aff_code', type: 'unique' as const, attrs: ['code'] },
    { col: 'affiliate_events', key: 'idx_ae_affiliateId', type: 'key' as const, attrs: ['affiliateId'] },
  ]

  for (const idx of indexes) {
    try {
      await databases.createIndex(DATABASE_ID, idx.col, idx.key, idx.type, idx.attrs)
      console.log(`  ✓ Index '${idx.key}' on '${idx.col}'`)
    } catch (e: any) {
      if (e.code === 409) console.log(`  → Index '${idx.key}' already exists`)
      else console.error(`  ✗ Failed: ${e.message}`)
    }
    await sleep(300)
  }

  // 6. Create Storage Bucket (single bucket for free plan — uploads, generations, avatars all in one)
  console.log('\nCreating storage bucket...')
  try {
    await storage.createBucket(
      'uploads',
      'Tynkerlab Storage',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false,  // fileSecurity
      true,   // enabled
      50 * 1024 * 1024  // 50MB max file size
    )
    console.log(`✓ Bucket 'uploads' created`)
  } catch (e: any) {
    if (e.code === 409) console.log(`→ Bucket 'uploads' already exists`)
    else if (e.code === 403) console.log(`→ Bucket limit reached (using existing bucket)`)
    else throw e
  }

  // 7. Seed default site settings
  console.log('\nSeeding site settings...')
  const settings = [
    {
      key: 'models_config',
      value: JSON.stringify({
        image: [
          'google/imagen-4.0-preview', 'google/imagen-4.0-fast', 'google/imagen-4.0-ultra',
          'google/flash-image-2.5', 'google/gemini-3-pro-image',
          'black-forest-labs/FLUX.2-pro', 'black-forest-labs/FLUX.2-dev', 'black-forest-labs/FLUX.2-flex', 'black-forest-labs/FLUX.2-max',
          'black-forest-labs/FLUX.1.1-pro', 'black-forest-labs/FLUX.1-schnell', 'black-forest-labs/FLUX.1-dev',
          'black-forest-labs/FLUX.1-kontext-pro', 'black-forest-labs/FLUX.1-kontext-max', 'black-forest-labs/FLUX.1-kontext-dev',
          'black-forest-labs/FLUX.1-krea-dev', 'black-forest-labs/FLUX.1-canny-pro',
          'ByteDance-Seed/Seedream-4.0', 'ByteDance-Seed/Seedream-3.0', 'ByteDance/SeedEdit',
          'Qwen/Qwen-Image', 'Qwen/Qwen-Image-Edit', 'Wan-AI/Wan-2.6-Image',
          'ideogram/ideogram-3.0', 'HiDream-ai/HiDream-I1-Full', 'HiDream-ai/HiDream-I1-Dev', 'HiDream-ai/HiDream-I1-Fast',
          'RunDiffusion/Juggernaut-pro-flux', 'Rundiffusion/Juggernaut-Lightning-Flux',
          'stabilityai/stable-diffusion-3-medium', 'stabilityai/stable-diffusion-xl-base-1.0', 'Lykon/DreamShaper',
        ],
        video: [
          'google/veo-3.0', 'google/veo-3.0-audio', 'google/veo-3.0-fast', 'google/veo-3.0-fast-audio', 'google/veo-2.0',
          'openai/sora-2', 'openai/sora-2-pro',
          'minimax/video-01-director', 'minimax/hailuo-02',
          'ByteDance/Seedance-1.0-pro', 'ByteDance/Seedance-1.0-lite',
          'kwaivgI/kling-2.1-master', 'kwaivgI/kling-2.1-pro', 'kwaivgI/kling-2.1-standard',
          'kwaivgI/kling-2.0-master', 'kwaivgI/kling-1.6-pro', 'kwaivgI/kling-1.6-standard',
          'pixverse/pixverse-v5', 'Wan-AI/Wan2.2-T2V-A14B', 'Wan-AI/Wan2.2-I2V-A14B',
          'vidu/vidu-2.0', 'vidu/vidu-q1',
        ],
      }),
      description: 'Available AI models',
    },
    {
      key: 'feature_flags',
      value: JSON.stringify({ text_to_image: true, image_to_image: true, text_to_video: true, image_to_video: true, prompt_gallery: true }),
      description: 'Feature toggles',
    },
    {
      key: 'maintenance_mode',
      value: JSON.stringify(false),
      description: 'Site maintenance mode',
    },
  ]

  for (const setting of settings) {
    try {
      await databases.createDocument(DATABASE_ID, 'site_settings', ID.unique(), setting)
      console.log(`✓ Setting '${setting.key}' seeded`)
    } catch (e: any) {
      console.log(`→ Setting '${setting.key}': ${e.message}`)
    }
  }

  console.log('\n✅ Appwrite setup complete!')
}

main().catch(console.error)
