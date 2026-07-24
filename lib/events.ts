import { isToday, isBefore, startOfToday, parseISO } from 'date-fns'
import type { EventRow, EventStatus, EventWithStatus, DashboardStats } from '@/types'

/** Derives an event's status relative to today. No date → "pending". */
export function getEventStatus(eventDate: string | null): EventStatus {
  if (!eventDate) return 'pending'
  const date = parseISO(eventDate)
  if (isToday(date)) return 'today'
  if (isBefore(date, startOfToday())) return 'completed'
  return 'upcoming'
}

export function withStatus(events: EventRow[]): EventWithStatus[] {
  return events.map((e) => ({ ...e, status: getEventStatus(e.event_date) }))
}

export function computeStats(events: EventRow[]): DashboardStats {
  const withStatuses = withStatus(events)
  const totalCost = events.reduce((sum, e) => sum + Number(e.cost || 0), 0)
  const total = events.length
  return {
    total,
    today: withStatuses.filter((e) => e.status === 'today').length,
    upcoming: withStatuses.filter((e) => e.status === 'upcoming').length,
    completed: withStatuses.filter((e) => e.status === 'completed').length,
    pending: withStatuses.filter((e) => e.status === 'pending').length,
    totalCost,
    averageCost: total > 0 ? totalCost / total : 0,
  }
}
