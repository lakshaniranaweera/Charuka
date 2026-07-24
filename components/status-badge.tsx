import { Badge } from '@/components/ui/badge'
import type { EventStatus } from '@/types'

const MAP: Record<
  EventStatus,
  { label: string; variant: 'success' | 'warning' | 'info' | 'secondary' }
> = {
  today: { label: 'Today', variant: 'warning' },
  upcoming: { label: 'Upcoming', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  pending: { label: 'Pending', variant: 'secondary' },
}

export function StatusBadge({ status }: { status: EventStatus }) {
  const { label, variant } = MAP[status]
  return <Badge variant={variant}>{label}</Badge>
}
