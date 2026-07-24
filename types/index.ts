import type { EventRow } from './database'

export type { EventRow, EventInsert, EventUpdate } from './database'
export type {
  DashboardSettingsRow,
  DashboardSettingsUpdate,
  ThemeMode,
  Database,
  Json,
} from './database'

export type EventStatus = 'today' | 'upcoming' | 'completed' | 'pending'

export interface EventWithStatus extends EventRow {
  status: EventStatus
}

export interface DashboardStats {
  total: number
  today: number
  upcoming: number
  completed: number
  pending: number
  totalCost: number
  averageCost: number
}
