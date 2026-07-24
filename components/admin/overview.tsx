'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CalendarRange } from 'lucide-react'
import { StatCards } from '@/components/dashboard/stat-cards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/status-badge'
import { useEvents } from '@/hooks/use-events'
import { computeStats, getEventStatus, withStatus } from '@/lib/events'
import { formatCurrency, formatDate } from '@/lib/format'
import type { EventRow } from '@/types'

// Charts are heavy — load them only on the client, lazily.
const DashboardCharts = dynamic(
  () => import('@/components/admin/charts').then((m) => m.DashboardCharts),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-2xl" />,
  }
)

export function AdminOverview({ initialEvents }: { initialEvents: EventRow[] }) {
  const { events, loading } = useEvents(initialEvents)
  const stats = useMemo(() => computeStats(events), [events])

  const upcoming = useMemo(
    () =>
      withStatus(events)
        .filter((e) => getEventStatus(e.event_date) !== 'completed')
        // Undated (pending) events sort to the end.
        .sort((a, b) => (a.event_date ?? '9999').localeCompare(b.event_date ?? '9999'))
        .slice(0, 5),
    [events]
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of all activation events and performance.
        </p>
      </motion.div>

      <StatCards stats={stats} />

      {loading ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : (
        <DashboardCharts events={events} />
      )}

      <Card className="glass-strong">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Next Up</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/events">
              Manage all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcoming.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No upcoming events.
            </p>
          )}
          {upcoming.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarRange className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{e.event_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(e.event_date)} · {e.location ?? '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-medium tabular-nums sm:inline">
                  {formatCurrency(e.cost)}
                </span>
                <StatusBadge status={e.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
