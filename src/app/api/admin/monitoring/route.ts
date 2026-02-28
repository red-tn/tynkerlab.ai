import { NextResponse } from 'next/server'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/server'
import { Query } from 'node-appwrite'

export async function GET() {
  try {
    const { databases } = createAdminClient()
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const [usage24h, usageHour, recentErrors] = await Promise.all([
      databases.listDocuments(DATABASE_ID, COLLECTIONS.API_USAGE_LOG, [
        Query.greaterThan('$createdAt', twentyFourHoursAgo.toISOString()),
        Query.limit(5000),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.API_USAGE_LOG, [
        Query.greaterThan('$createdAt', oneHourAgo.toISOString()),
        Query.limit(1000),
      ]),
      databases.listDocuments(DATABASE_ID, COLLECTIONS.API_USAGE_LOG, [
        Query.greaterThan('statusCode', 399),
        Query.orderDesc('$createdAt'),
        Query.limit(20),
      ]),
    ])

    // Calculate metrics
    const totalRequests = usage24h.total
    const errorCount = usage24h.documents.filter((d: any) => d.statusCode >= 400).length
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests * 100).toFixed(1) : '0'

    const latencies = usage24h.documents.map((d: any) => d.latencyMs || 0).filter((l: number) => l > 0)
    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length) : 0
    const p95Latency = latencies.length > 0 ? latencies.sort((a: number, b: number) => a - b)[Math.floor(latencies.length * 0.95)] : 0

    // Group by model
    const modelUsage: Record<string, number> = {}
    for (const d of usage24h.documents) {
      const model = (d as any).model || 'unknown'
      modelUsage[model] = (modelUsage[model] || 0) + 1
    }

    const modelStats = Object.entries(modelUsage)
      .map(([model, count]) => ({ model: model.split('/').pop() || model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      totalRequests,
      requestsPerHour: usageHour.total,
      errorCount,
      errorRate: parseFloat(errorRate),
      avgLatency,
      p95Latency,
      modelStats,
      recentErrors: recentErrors.documents.map((d: any) => ({
        id: d.$id,
        endpoint: d.endpoint,
        model: d.model,
        error: d.error,
        statusCode: d.statusCode,
        timestamp: d.$createdAt,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
