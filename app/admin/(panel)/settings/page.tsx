import type { Metadata } from 'next'
import { SettingsPanel } from '@/components/admin/settings-panel'
import { getInitialSettings } from '@/lib/supabase/queries'
import type { DashboardSettingsRow } from '@/types'

export const metadata: Metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

const FALLBACK: DashboardSettingsRow = {
  id: 1,
  title: 'Activation Planner',
  background_url: null,
  logo_url: null,
  theme: 'system',
  primary_color: '221 83% 53%',
  accent_color: '262 83% 58%',
  updated_at: new Date().toISOString(),
}

export default async function AdminSettingsPage() {
  const settings = (await getInitialSettings()) ?? FALLBACK
  return <SettingsPanel initialSettings={settings} />
}
