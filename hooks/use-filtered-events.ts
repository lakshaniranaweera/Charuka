'use client'

import { useMemo } from 'react'
import { getEventStatus } from '@/lib/events'
import type { EventRow } from '@/types'
import type { ToolbarState } from '@/components/dashboard/table-toolbar'

/** Applies status + date-range filters (text search handled by the table). */
export function useFilteredEvents(
  events: EventRow[],
  state: ToolbarState
): EventRow[] {
  return useMemo(() => {
    return events.filter((e) => {
      if (state.status !== 'all' && getEventStatus(e.event_date) !== state.status) {
        return false
      }
      // Undated (pending) events are excluded when a date range is applied.
      if (state.from && (!e.event_date || e.event_date < state.from)) return false
      if (state.to && (!e.event_date || e.event_date > state.to)) return false
      return true
    })
  }, [events, state.status, state.from, state.to])
}
