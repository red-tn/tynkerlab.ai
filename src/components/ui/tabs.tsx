'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab?: string
  onChange?: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id)
  const active = activeTab ?? internalActive

  const handleChange = (tabId: string) => {
    setInternalActive(tabId)
    onChange?.(tabId)
  }

  return (
    <div className={cn('flex border-b border-nyx-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleChange(tab.id)}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
            active === tab.id
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          {tab.icon}
          {tab.label}
          {active === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}

interface TabPanelProps {
  children: ReactNode
  className?: string
}

export function TabPanel({ children, className }: TabPanelProps) {
  return <div className={cn('py-4', className)}>{children}</div>
}
