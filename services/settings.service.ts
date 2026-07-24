import { createClient } from '@/lib/supabase/client'
import type { DashboardSettingsRow, DashboardSettingsUpdate } from '@/types'

export const settingsService = {
  async get(): Promise<DashboardSettingsRow> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dashboard_settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (error) throw error
    return data
  },

  async update(payload: DashboardSettingsUpdate): Promise<DashboardSettingsRow> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('dashboard_settings')
      .update(payload)
      .eq('id', 1)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  /** Uploads a branding asset and returns its public URL. */
  async uploadAsset(
    kind: 'background' | 'logo',
    file: File
  ): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${kind}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('branding')
      .upload(path, file, { upsert: true, cacheControl: '3600' })
    if (error) throw error
    const { data } = supabase.storage.from('branding').getPublicUrl(path)
    return data.publicUrl
  },
}
