'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { settingsService } from '@/services/settings.service'
import type { DashboardSettingsRow } from '@/types'

/** Loads dashboard branding settings and keeps them live via Realtime. */
export function useSettings(initial: DashboardSettingsRow | null = null) {
  const [settings, setSettings] = useState<DashboardSettingsRow | null>(initial)
  const [loading, setLoading] = useState(initial === null)

  useEffect(() => {
    if (!initial) {
      settingsService
        .get()
        .then(setSettings)
        .catch(() => setSettings(null))
        .finally(() => setLoading(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
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

  return { settings, loading, setSettings }
}
