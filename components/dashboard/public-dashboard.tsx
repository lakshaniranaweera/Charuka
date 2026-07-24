'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutDashboard, RefreshCw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSettingsContext } from '@/components/providers/settings-provider'
import { StatCards } from '@/components/dashboard/stat-cards'
import { EventsTable } from '@/components/dashboard/events-table'
import {
  TableToolbar,
  type ToolbarState,
} from '@/components/dashboard/table-toolbar'
import { useEvents } from '@/hooks/use-events'
import { useFullscreen } from '@/hooks/use-fullscreen'
import { useFilteredEvents } from '@/hooks/use-filtered-events'
import { computeStats } from '@/lib/events'
import type { EventRow } from '@/types'

// REFLECT brand background. Place the image file at public/reflect-background.png
const DEFAULT_BG = '/reflect-background.png'

export function PublicDashboard({
  initialEvents,
}: {
  initialEvents: EventRow[]
}) {
  const { events, loading, refresh } = useEvents(initialEvents)
  const { settings } = useSettingsContext()
  const { isFullscreen, toggle } = useFullscreen()
  const rootRef = React.useRef<HTMLDivElement>(null)

  const [toolbar, setToolbar] = React.useState<ToolbarState>({
    search: '',
    status: 'all',
    from: '',
    to: '',
  })

  const filtered = useFilteredEvents(events, toolbar)
  const stats = React.useMemo(() => computeStats(events), [events])

  const title = settings.title
  const background = settings.background_url || DEFAULT_BG

  return (
    <div
      ref={rootRef}
      className="print-full relative min-h-screen w-full overflow-x-hidden"
    >
      {/* Background — dark base color shows instantly and covers any load gap */}
      <div className="fixed inset-0 -z-10 bg-[#1c1b1e]">
        <Image
          src={background}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Subtle overlay: keeps table/cards readable while preserving the
            REFLECT branding in the corner of the image. */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-primary/20" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt="Logo"
                width={48}
                height={48}
                className="rounded-xl border border-white/20"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
                <LayoutDashboard className="h-6 w-6" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow sm:text-3xl">
                {title}
              </h1>
              <p className="text-sm text-white/70">
                Live activation event overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="glass-strong"
              onClick={() => refresh()}
              aria-label="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <Button asChild variant="outline" size="sm" className="glass-strong">
              <Link href="/admin">
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            </Button>
          </div>
        </header>

        <div className="mb-6">
          <StatCards stats={stats} />
        </div>

        <Card className="glass-strong p-4 sm:p-6">
          <div className="mb-4">
            <TableToolbar
              state={toolbar}
              onChange={setToolbar}
              events={filtered}
              title={title}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => toggle(rootRef.current)}
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <EventsTable data={filtered} globalFilter={toolbar.search} />
            </motion.div>
          )}
        </Card>

        <footer className="no-print mt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} {title} · Powered by Supabase Realtime
        </footer>
      </div>
    </div>
  )
}
