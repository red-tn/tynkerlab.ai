'use client'

import { ResponsiveContainer } from 'recharts'
import type { ReactNode } from 'react'

interface ChartWrapperProps {
  title: string
  children: ReactNode
  height?: number
}

export function ChartWrapper({ title, children, height = 300 }: ChartWrapperProps) {
  return (
    <div className="rounded-xl border border-nyx-border bg-nyx-surface p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {children as any}
      </ResponsiveContainer>
    </div>
  )
}
