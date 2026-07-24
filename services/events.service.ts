import { createClient } from '@/lib/supabase/client'
import type { EventRow, EventInsert, EventUpdate } from '@/types'

/**
 * Client-side data-access service for events. All calls run through the
 * anon/authenticated Supabase client and are subject to RLS.
 */
export const eventsService = {
  async list(): Promise<EventRow[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async create(payload: EventInsert): Promise<EventRow> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, payload: EventUpdate): Promise<EventRow> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error
  },

  async removeMany(ids: string[]): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('events').delete().in('id', ids)
    if (error) throw error
  },

  async updateMany(ids: string[], payload: EventUpdate): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('events')
      .update(payload)
      .in('id', ids)
    if (error) throw error
  },

  async duplicate(source: EventRow): Promise<EventRow> {
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = source
    return this.create({ ...rest, event_name: `${rest.event_name} (Copy)` })
  },
}
