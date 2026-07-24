'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { eventsService } from '@/services/events.service'
import type { EventRow } from '@/types'

interface UseEventsResult {
  events: EventRow[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Loads events and keeps them live via Supabase Realtime. Any INSERT / UPDATE /
 * DELETE broadcast from Postgres is applied to local state instantly.
 */
export function useEvents(initial: EventRow[] = []): UseEventsResult {
  const [events, setEvents] = useState<EventRow[]>(initial)
  const [loading, setLoading] = useState(initial.length === 0)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const data = await eventsService.list()
      setEvents(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initial.length === 0) void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          setEvents((prev) => {
            if (payload.eventType === 'INSERT') {
              const row = payload.new as EventRow
              if (prev.some((e) => e.id === row.id)) return prev
              return [row, ...prev]
            }
            if (payload.eventType === 'UPDATE') {
              const row = payload.new as EventRow
              return prev.map((e) => (e.id === row.id ? row : e))
            }
            if (payload.eventType === 'DELETE') {
              const old = payload.old as { id: string }
              return prev.filter((e) => e.id !== old.id)
            }
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  return { events, loading, error, refresh }
}
