import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'
import { ALL_MODELS, estimateApiCostUsd, AVG_CREDIT_PRICE_USD } from '@/lib/together/models'

const API_LOG_DISPLAY_NAMES: Record<string, string> = {
  'hexgrad/Kokoro-82M': 'Kokoro',
  'canopylabs/orpheus-3b-0.1-ft': 'Orpheus',
  'cartesia/sonic-2': 'Cartesia Sonic 2',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo': 'Llama 3.3 70B',
}

function getServiceCategory(type: string | null, requestType: string | null): string {
  if (requestType === 'text-to-speech') return 'TTS'
  if (requestType === 'enhance-prompt' || requestType === 'prompt-maker') return 'LLM'
  if (type === 'video') return 'Video Gen'
  return 'Image Gen'
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch generations and api_usage_log in parallel
    const [genResult, logResult] = await Promise.all([
      supabase
        .from('generations')
        .select('model, width, height, duration_seconds, credits_used, created_at, type')
        .gt('credits_used', 0)
        .gt('created_at', thirtyDaysAgo.toISOString())
        .limit(10000),
      supabase
        .from('api_usage_log')
        .select('model, request_type, cost_estimate, created_at, request_metadata')
        .not('cost_estimate', 'is', null)
        .gt('cost_estimate', 0)
        .gt('created_at', thirtyDaysAgo.toISOString())
        .limit(10000),
    ])

    const gens = genResult.data || []
    const apiLogs = logResult.data || []

    let totalApiCost = 0
    let totalCreditsUsed = 0
    const providerMap: Record<string, { count: number; cost: number; credits: number }> = {}
    const modelMap: Record<string, { model: string; displayName: string; provider: string; count: number; cost: number; credits: number }> = {}
    const dailyMap: Record<string, { cost: number; credits: number; generations: number }> = {}
    const serviceMap: Record<string, { count: number; cost: number; credits: number }> = {}

    // Process generations (image/video)
    for (const g of gens) {
      const modelId = (g as any).model || ''
      const width = (g as any).width || null
      const height = (g as any).height || null
      const duration = (g as any).duration_seconds || null
      const creditsUsed = (g as any).credits_used || 0
      const createdAt = (g as any).created_at || ''
      const type = (g as any).type || 'text-to-image'

      const cost = estimateApiCostUsd(modelId, width, height, duration)
      totalApiCost += cost
      totalCreditsUsed += creditsUsed

      const modelDef = ALL_MODELS.find(m => m.id === modelId)
      const provider = modelDef?.provider || 'together'
      const displayName = modelDef?.displayName || modelId.split('/').pop() || modelId

      // Provider aggregation
      if (!providerMap[provider]) providerMap[provider] = { count: 0, cost: 0, credits: 0 }
      providerMap[provider].count++
      providerMap[provider].cost += cost
      providerMap[provider].credits += creditsUsed

      // Model aggregation
      if (!modelMap[modelId]) modelMap[modelId] = { model: modelId, displayName, provider, count: 0, cost: 0, credits: 0 }
      modelMap[modelId].count++
      modelMap[modelId].cost += cost
      modelMap[modelId].credits += creditsUsed

      // Daily aggregation
      const day = createdAt.slice(0, 10)
      if (day) {
        if (!dailyMap[day]) dailyMap[day] = { cost: 0, credits: 0, generations: 0 }
        dailyMap[day].cost += cost
        dailyMap[day].credits += creditsUsed
        dailyMap[day].generations++
      }

      // Service aggregation
      const service = getServiceCategory(type === 'video' ? 'video' : null, null)
      if (!serviceMap[service]) serviceMap[service] = { count: 0, cost: 0, credits: 0 }
      serviceMap[service].count++
      serviceMap[service].cost += cost
      serviceMap[service].credits += creditsUsed
    }

    // Process api_usage_log (TTS, LLM)
    for (const log of apiLogs) {
      const modelId = (log as any).model || ''
      const requestType = (log as any).request_type || ''
      const cost = (log as any).cost_estimate || 0
      const createdAt = (log as any).created_at || ''
      const metadata = (log as any).request_metadata || {}
      const creditsUsed = metadata?.creditsUsed || 0

      totalApiCost += cost
      totalCreditsUsed += creditsUsed

      const provider = 'together'
      const displayName = API_LOG_DISPLAY_NAMES[modelId] || modelId.split('/').pop() || modelId

      // Provider aggregation
      if (!providerMap[provider]) providerMap[provider] = { count: 0, cost: 0, credits: 0 }
      providerMap[provider].count++
      providerMap[provider].cost += cost
      providerMap[provider].credits += creditsUsed

      // Model aggregation
      if (!modelMap[modelId]) modelMap[modelId] = { model: modelId, displayName, provider, count: 0, cost: 0, credits: 0 }
      modelMap[modelId].count++
      modelMap[modelId].cost += cost
      modelMap[modelId].credits += creditsUsed

      // Daily aggregation
      const day = createdAt.slice(0, 10)
      if (day) {
        if (!dailyMap[day]) dailyMap[day] = { cost: 0, credits: 0, generations: 0 }
        dailyMap[day].cost += cost
        dailyMap[day].credits += creditsUsed
        dailyMap[day].generations++
      }

      // Service aggregation
      const service = getServiceCategory(null, requestType)
      if (!serviceMap[service]) serviceMap[service] = { count: 0, cost: 0, credits: 0 }
      serviceMap[service].count++
      serviceMap[service].cost += cost
      serviceMap[service].credits += creditsUsed
    }

    const estimatedRevenue = totalCreditsUsed * AVG_CREDIT_PRICE_USD
    const margin = estimatedRevenue > 0
      ? ((estimatedRevenue - totalApiCost) / estimatedRevenue) * 100
      : 0

    const byProvider = Object.entries(providerMap).map(([provider, data]) => ({
      provider,
      ...data,
    }))

    const byModel = Object.values(modelMap)
      .map(m => ({ ...m, costPerGen: m.count > 0 ? m.cost / m.count : 0 }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 20)

    const dailyCosts = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date: date.slice(5), ...data }))

    const byService = Object.entries(serviceMap)
      .map(([service, data]) => ({ service, ...data }))
      .sort((a, b) => b.cost - a.cost)

    return NextResponse.json({
      summary: {
        totalApiCost: Math.round(totalApiCost * 100) / 100,
        totalCreditsUsed,
        totalGenerations: gens.length + apiLogs.length,
        estimatedRevenue: Math.round(estimatedRevenue * 100) / 100,
        margin: Math.round(margin * 10) / 10,
      },
      byProvider,
      byModel,
      byService,
      dailyCosts,
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Admin costs error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
