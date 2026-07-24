'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { settingsService } from '@/services/settings.service'
import type { DashboardSettingsRow } from '@/types'

const DEFAULT_SETTINGS: DashboardSettingsRow = {
  id: 1,
  title: 'Activation Planner',
  background_url: null,
  logo_url: null,
  theme: 'system',
  primary_color: '221 83% 53%',
  accent_color: '262 83% 58%',
  updated_at: new Date().toISOString(),
}

interface SettingsContextValue {
  settings: DashboardSettingsRow
  setSettings: React.Dispatch<React.SetStateAction<DashboardSettingsRow>>
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null)

/**
 * App-wide branding provider. Loads dashboard settings, keeps them live via
 * Supabase Realtime, and applies the configured colors as CSS variables on the
 * document root so title / logo / colors update everywhere without a refresh.
 */
export function SettingsProvider({
  initialSettings,
  children,
}: {
  initialSettings: DashboardSettingsRow | null
  children: React.ReactNode
}) {
  const [settings, setSettings] = React.useState<DashboardSettingsRow>(
    initialSettings ?? DEFAULT_SETTINGS
  )

  // Fetch on mount if the server didn't provide settings.
  React.useEffect(() => {
    if (!initialSettings) {
      settingsService.get().then(setSettings).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Live updates from the admin panel.
  React.useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('settings-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'dashboard_settings' },
        (payload) => setSettings(payload.new as DashboardSettingsRow)
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  // Apply configured colors as CSS custom properties (affects the whole app).
  React.useEffect(() => {
    const root = document.documentElement
    if (settings.primary_color) {
      root.style.setProperty('--primary', settings.primary_color)
      root.style.setProperty('--ring', settings.primary_color)
    }
    if (settings.accent_color) {
      root.style.setProperty('--accent', settings.accent_color)
    }
  }, [settings.primary_color, settings.accent_color])

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

/** Access the live, app-wide dashboard settings. */
export function useSettingsContext(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettingsContext must be used within <SettingsProvider>')
  }
  return ctx
}
