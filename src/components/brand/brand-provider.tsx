'use client'

import { useEffect } from 'react'
import { useBrand } from '@/hooks/use-brand'

/**
 * Initializes the brand icon set from server settings on app mount.
 * Place this once in the root layout. Renders nothing.
 */
export function BrandProvider() {
  const init = useBrand((s) => s.init)
  useEffect(() => { init() }, [init])
  return null
}
