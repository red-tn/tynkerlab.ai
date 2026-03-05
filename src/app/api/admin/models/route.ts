import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'
import { ALL_MODELS } from '@/lib/together/models'

interface TogetherModel {
  id: string
  object: string
  created: number
  type: string
  display_name: string
  organization: string
  link?: string
  license?: string
  context_length?: number
  pricing?: {
    hourly?: number
    input?: number
    output?: number
    base?: number
    finetune?: number
  }
}

async function fetchTogetherModels(): Promise<TogetherModel[]> {
  try {
    const res = await fetch('https://api.together.xyz/v1/models', {
      headers: { Authorization: `Bearer ${process.env.TOGETHER_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function getModelOverrides(supabase: any): Promise<Record<string, boolean>> {
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'model_overrides')
    .maybeSingle()
  return data?.value || {}
}

// WaveSpeed model (avatar generation, separate provider)
const WAVESPEED_MODELS = [
  {
    id: 'wavespeed/infinitetalk',
    displayName: 'InfiniteTalk (UGC Avatar)',
    type: 'video' as const,
    category: 'wavespeed',
    categoryLabel: 'WaveSpeed AI',
    credits: 50,
    togetherPrice: 'Per-job pricing',
    provider: 'wavespeed',
  },
]

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const fetchApi = searchParams.get('fetch_api') === 'true'

    const overrides = await getModelOverrides(supabase)

    // Registered models (Together.ai + WaveSpeed) with override status
    const registered = [
      ...ALL_MODELS.map(m => ({
        id: m.id,
        displayName: m.displayName,
        type: m.type,
        category: m.category,
        categoryLabel: m.categoryLabel,
        credits: m.credits,
        togetherPrice: m.togetherPrice,
        enabled: overrides[m.id] !== undefined ? overrides[m.id] : m.enabled,
        defaultEnabled: m.enabled,
        registered: true,
        provider: 'together' as const,
      })),
      ...WAVESPEED_MODELS.map(m => ({
        ...m,
        enabled: overrides[m.id] !== undefined ? overrides[m.id] : true,
        defaultEnabled: true,
        registered: true,
      })),
    ]

    // Only fetch from Together API when explicitly requested
    let unregistered: any[] = []
    let togetherModelCount = 0

    if (fetchApi) {
      const togetherModels = await fetchTogetherModels()
      const imageVideoModels = togetherModels.filter(
        m => m.type === 'image' || m.type === 'video'
      )
      togetherModelCount = imageVideoModels.length

      const registeredIds = new Set(ALL_MODELS.map(m => m.id))
      unregistered = imageVideoModels
        .filter(m => !registeredIds.has(m.id))
        .map(m => ({
          id: m.id,
          displayName: m.display_name || m.id.split('/').pop() || m.id,
          type: m.type as 'image' | 'video',
          category: m.organization?.toLowerCase() || 'unknown',
          categoryLabel: m.organization || 'Unknown',
          credits: 0,
          togetherPrice: m.pricing?.input ? `$${m.pricing.input}/MP` : 'Unknown',
          enabled: false,
          defaultEnabled: false,
          registered: false,
          provider: 'together' as const,
        }))
    }

    return NextResponse.json({
      registered,
      unregistered,
      overrides,
      togetherModelCount,
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()
    const body = await request.json()
    const { modelId, enabled } = body

    if (!modelId || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'modelId and enabled required' }, { status: 400 })
    }

    // Get current overrides
    const overrides = await getModelOverrides(supabase)

    // Find the model's default state
    const model = ALL_MODELS.find(m => m.id === modelId)

    if (model && model.enabled === enabled) {
      // If setting back to default, remove the override
      delete overrides[modelId]
    } else {
      overrides[modelId] = enabled
    }

    // Upsert site_settings
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'model_overrides', value: overrides }, { onConflict: 'key' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, overrides })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
