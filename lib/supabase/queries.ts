import { createClient } from '@/lib/supabase/server'
import type { DashboardSettingsRow, EventRow } from '@/types'

/** Server-side initial fetch of events (respects RLS, anon-readable). */
export async function getInitialEvents(): Promise<EventRow[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export async function getInitialSettings(): Promise<DashboardSettingsRow | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('dashboard_settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}
