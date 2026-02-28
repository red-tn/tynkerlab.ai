import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Proxy to Together.ai usage API
    const res = await fetch('https://api.together.ai/v1/dashboard/usage', {
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch Together.ai usage' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
