'use client'

import { Maximize2, Minimize2, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { ExportMenu } from '@/components/dashboard/export-menu'
import type { EventRow, EventStatus } from '@/types'

export interface ToolbarState {
  search: string
  status: EventStatus | 'all'
  from: string
  to: string
}

interface TableToolbarProps {
  state: ToolbarState
  onChange: (next: ToolbarState) => void
  events: EventRow[]
  title: string
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

export function TableToolbar({
  state,
  onChange,
  events,
  title,
  isFullscreen,
  onToggleFullscreen,
}: TableToolbarProps) {
  const set = (patch: Partial<ToolbarState>) => onChange({ ...state, ...patch })
  const hasFilters =
    state.search || state.status !== 'all' || state.from || state.to

  return (
    <div className="no-print flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={state.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search events…"
          className="pl-9"
          aria-label="Search events"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          aria-label="Filter by status"
          className="w-[140px]"
          value={state.status}
          onChange={(e) =>
            set({ status: e.target.value as ToolbarState['status'] })
          }
          options={[
            { label: 'All statuses', value: 'all' },
            { label: 'Today', value: 'today' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Completed', value: 'completed' },
            { label: 'Pending', value: 'pending' },
          ]}
        />
        <Input
          type="date"
          aria-label="From date"
          className="w-[150px]"
          value={state.from}
          onChange={(e) => set({ from: e.target.value })}
        />
        <Input
          type="date"
          aria-label="To date"
          className="w-[150px]"
          value={state.to}
          onChange={(e) => set({ to: e.target.value })}
        />
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({ search: '', status: 'all', from: '', to: '' })
            }
          >
            <X className="h-4 w-4" /> Clear
          </Button>
        )}

        <ExportMenu events={events} title={title} />

        <Button
          variant="outline"
          size="icon"
          className="glass-strong"
          onClick={onToggleFullscreen}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
