'use client'

import { useEffect } from 'react'
import { useBrand } from '@/hooks/use-brand'
import { ICON_SETS, applyPaletteCssVars } from '@/lib/brand'

/**
 * Initializes the brand icon set from server settings on app mount.
 * Applies the color palette as CSS custom properties whenever the set changes.
 * Place this once in the root layout. Renders nothing.
 */
export function BrandProvider() {
  const init = useBrand((s) => s.init)
  const activeSetId = useBrand((s) => s.activeSetId)

  useEffect(() => { init() }, [init])

  useEffect(() => {
    const set = ICON_SETS[activeSetId]
    if (set?.colors) applyPaletteCssVars(set.colors)
  }, [activeSetId])

  return null
}
