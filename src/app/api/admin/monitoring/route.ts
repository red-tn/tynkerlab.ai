import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth'

async function fetchTogetherBalance(): Promise<{ balance: number | null; error?: string }> {
  try {
    // Together.ai doesn't expose a public billing API — use the usage endpoint as a proxy
    const res = await fetch('https://api.together.xyz/v1/models', {
      headers: { Authorization: `Bearer ${process.env.TOGETHER_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      // API key is valid but no balance endpoint available
      return { balance: null, error: 'No billing API — check together.ai dashboard' }
    }
    return { balance: null, error: `API key issue (${res.status})` }
  } catch {
    return { balance: null, error: 'Timeout or network error' }
  }
}

async function fetchStripeBalance(): Promise<{ available: number; pending: number } | null> {
  try {
    const { getServerStripe } = await import('@/lib/stripe/client')
    const stripe = getServerStripe()
    const balance = await stripe.balance.retrieve()
    const usdAvailable = balance.available.find((b: any) => b.currency === 'usd')
    const usdPending = balance.pending.find((b: any) => b.currency === 'usd')
    return {
      available: (usdAvailable?.amount || 0) / 100,
      pending: (usdPending?.amount || 0) / 100,
    }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const supabase = createAdminClient()
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const [usage24hResult, usageHourResult, recentErrorsResult, togetherBalance, stripeBalance] = await Promise.all([
      supabase.from('api_usage_log').select('*')
        .gt('created_at', twentyFourHoursAgo.toISOString())
        .limit(5000),
      supabase.from('api_usage_log').select('*', { count: 'exact', head: true })
        .gt('created_at', oneHourAgo.toISOString()),
      supabase.from('api_usage_log').select('*')
        .gt('status_code', 399)
        .order('created_at', { ascending: false })
        .limit(100),
      fetchTogetherBalance(),
      fetchStripeBalance(),
    ])

    const usage24hDocs = usage24hResult.data || []

    // Calculate metrics
    const totalRequests = usage24hDocs.length
    const errorCount = usage24hDocs.filter((d: any) => d.status_code >= 400).length
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests * 100).toFixed(1) : '0'

    const latencies = usage24hDocs.map((d: any) => d.latency_ms || 0).filter((l: number) => l > 0)
    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length) : 0
    const p95Latency = latencies.length > 0 ? latencies.sort((a: number, b: number) => a - b)[Math.floor(latencies.length * 0.95)] : 0

    // Group by model
    const modelUsage: Record<string, number> = {}
    for (const d of usage24hDocs) {
      const model = (d as any).model || 'unknown'
      modelUsage[model] = (modelUsage[model] || 0) + 1
    }

    const modelStats = Object.entries(modelUsage)
      .map(([model, count]) => ({ model: model.split('/').pop() || model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Collect unique models and endpoints for filter options
    const errorDocs = recentErrorsResult.data || []
    const uniqueModels = [...new Set(errorDocs.map((d: any) => d.model).filter(Boolean))]
    const uniqueEndpoints = [...new Set(errorDocs.map((d: any) => d.endpoint).filter(Boolean))]

    return NextResponse.json({
      totalRequests,
      requestsPerHour: usageHourResult.count ?? 0,
      errorCount,
      errorRate: parseFloat(errorRate),
      avgLatency,
      p95Latency,
      modelStats,
      balances: {
        together: togetherBalance,
        stripe: stripeBalance,
      },
      recentErrors: errorDocs.map((d: any) => ({
        id: d.id,
        endpoint: d.endpoint,
        model: d.model,
        error: d.error,
        statusCode: d.status_code,
        userId: d.user_id,
        timestamp: d.created_at,
      })),
      filterOptions: {
        models: uniqueModels,
        endpoints: uniqueEndpoints,
      },
    })
  } catch (error: any) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
