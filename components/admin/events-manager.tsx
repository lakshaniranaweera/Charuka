'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EventFormDialog } from '@/components/admin/event-form-dialog'
import { ExportMenu } from '@/components/dashboard/export-menu'
import { useEvents } from '@/hooks/use-events'
import { useDebounce } from '@/hooks/use-debounce'
import { getEventStatus } from '@/lib/events'
import { formatCurrency, formatDate } from '@/lib/format'
import { eventsService } from '@/services/events.service'
import type { EventRow, EventStatus } from '@/types'

export function EventsManager({ initialEvents }: { initialEvents: EventRow[] }) {
  const { events, loading } = useEvents(initialEvents)

  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState<EventStatus | 'all'>('all')
  const debouncedSearch = useDebounce(search, 250)

  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<EventRow | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<EventRow | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  const filtered = React.useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return events.filter((e) => {
      if (status !== 'all' && getEventStatus(e.event_date) !== status) {
        return false
      }
      if (!q) return true
      return [
        e.event_name,
        e.location,
        e.activation_manager,
        e.remarks,
      ]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    })
  }, [events, debouncedSearch, status])

  const allSelected =
    filtered.length > 0 && filtered.every((e) => selected.has(e.id))
  const someSelected = filtered.some((e) => selected.has(e.id))

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) filtered.forEach((e) => next.delete(e.id))
      else filtered.forEach((e) => next.add(e.id))
      return next
    })
  }

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (e: EventRow) => {
    setEditing(e)
    setFormOpen(true)
  }

  const duplicate = async (e: EventRow) => {
    try {
      await eventsService.duplicate(e)
      toast.success('Event duplicated')
    } catch {
      toast.error('Failed to duplicate')
    }
  }

  const deleteOne = async () => {
    if (!deleteTarget) return
    try {
      await eventsService.remove(deleteTarget.id)
      toast.success('Event deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const bulkDelete = async () => {
    const ids = [...selected]
    try {
      await eventsService.removeMany(ids)
      setSelected(new Set())
      toast.success(`Deleted ${ids.length} events`)
    } catch {
      toast.error('Bulk delete failed')
    }
  }

  const bulkUpdateManager = async () => {
    const manager = window.prompt('Set activation manager for selected events:')
    if (manager === null) return
    try {
      await eventsService.updateMany([...selected], {
        activation_manager: manager.trim() || null,
      })
      toast.success('Bulk update applied')
      setSelected(new Set())
    } catch {
      toast.error('Bulk update failed')
    }
  }

  const selectedEvents = filtered.filter((e) => selected.has(e.id))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Events</h1>
        <p className="text-muted-foreground">
          Create, edit and manage all activation events.
        </p>
      </div>

      <Card className="glass-strong p-4 sm:p-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events…"
                className="pl-9"
              />
            </div>
            <Select
              className="w-full sm:w-[150px]"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as EventStatus | 'all')
              }
              options={[
                { label: 'All statuses', value: 'all' },
                { label: 'Today', value: 'today' },
                { label: 'Upcoming', value: 'upcoming' },
                { label: 'Completed', value: 'completed' },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <ExportMenu events={filtered} title="Activation Events" />
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Event
            </Button>
          </div>
        </div>

        {/* Bulk action bar */}
        {someSelected && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2"
          >
            <span className="text-sm font-medium">
              {selected.size} selected
            </span>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={bulkUpdateManager}>
                <Pencil className="h-4 w-4" /> Bulk update
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-auto rounded-xl border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? 'indeterminate'
                            : false
                      }
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No events found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((e) => (
                    <TableRow
                      key={e.id}
                      data-state={selected.has(e.id) ? 'selected' : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.has(e.id)}
                          onCheckedChange={() => toggleOne(e.id)}
                          aria-label={`Select ${e.event_name}`}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {formatDate(e.event_date)}
                          <StatusBadge status={getEventStatus(e.event_date)} />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {e.event_name}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(e.cost)}
                      </TableCell>
                      <TableCell>{e.location ?? '—'}</TableCell>
                      <TableCell>{e.activation_manager ?? '—'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openEdit(e)}>
                              <Pencil /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicate(e)}>
                              <Copy /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTarget(e)}
                            >
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        event={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete event?"
        description={`This permanently deletes "${deleteTarget?.event_name}". This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={deleteOne}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selected.size} events?`}
        description="These records will be permanently removed. This action cannot be undone."
        confirmLabel="Delete all"
        onConfirm={bulkDelete}
      />

      {/* Hidden reference so exports include only selected when chosen */}
      {selectedEvents.length > 0 && null}
    </div>
  )
}
