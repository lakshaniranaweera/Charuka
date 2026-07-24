'use client'

import { useEffect } from 'react'
import type { DashboardSettingsRow } from '@/types'

/**
 * Applies admin-configured primary/accent colors as CSS custom properties on
 * the document root, so branding changes take effect live.
 */
export function BrandColors({
  settings,
}: {
  settings: DashboardSettingsRow | null
}) {
  useEffect(() => {
    if (!settings) return
    const root = document.documentElement
    if (settings.primary_color) {
      root.style.setProperty('--primary', settings.primary_color)
      root.style.setProperty('--ring', settings.primary_color)
    }
    if (settings.accent_color) {
      root.style.setProperty('--accent', settings.accent_color)
    }
  }, [settings?.primary_color, settings?.accent_color, settings])

  return null
}
