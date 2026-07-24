'use client'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { motion } from 'framer-motion'
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { formatCurrency, formatDate } from '@/lib/format'
import { getEventStatus } from '@/lib/events'
import { cn } from '@/lib/utils'
import type { EventRow } from '@/types'

const ROW_TINT: Record<string, string> = {
  today: 'bg-amber-500/5 hover:bg-amber-500/10',
  upcoming: '',
  completed: 'opacity-90',
}

interface EventsTableProps {
  data: EventRow[]
  globalFilter: string
  /** Optional extra column (e.g. selection / actions) rendered for admin. */
  extraColumns?: ColumnDef<EventRow>[]
  pageSize?: number
}

function SortHeader({
  label,
  onClick,
}: {
  label: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      <ArrowUpDown className="h-3 w-3 opacity-60" />
    </button>
  )
}

export function EventsTable({
  data,
  globalFilter,
  extraColumns = [],
  pageSize = 10,
}: EventsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'event_date', desc: true },
  ])

  const columns = React.useMemo<ColumnDef<EventRow>[]>(
    () => [
      ...extraColumns,
      {
        accessorKey: 'event_date',
        header: ({ column }) => (
          <SortHeader
            label="Event Date"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 whitespace-nowrap font-medium">
            {formatDate(row.original.event_date)}
            <StatusBadge status={getEventStatus(row.original.event_date)} />
          </div>
        ),
      },
      {
        accessorKey: 'event_name',
        header: ({ column }) => (
          <SortHeader
            label="Event"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.event_name}
          </span>
        ),
      },
      {
        accessorKey: 'cost',
        header: ({ column }) => (
          <SortHeader
            label="Cost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatCurrency(row.original.cost)}
          </span>
        ),
      },
      {
        accessorKey: 'previsit_date',
        header: 'Previsit',
        cell: ({ row }) => formatDate(row.original.previsit_date),
      },
      {
        accessorKey: 'production_date',
        header: 'Production',
        cell: ({ row }) => formatDate(row.original.production_date),
      },
      {
        accessorKey: 'setup_date',
        header: 'Setup',
        cell: ({ row }) => formatDate(row.original.setup_date),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => row.original.location ?? '—',
      },
      {
        accessorKey: 'activation_manager',
        header: 'Manager',
        cell: ({ row }) => row.original.activation_manager ?? '—',
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[220px] text-muted-foreground">
            {row.original.remarks ?? '—'}
          </span>
        ),
      },
    ],
    [extraColumns]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    initialState: { pagination: { pageSize } },
  })

  return (
    <div className="flex flex-col">
      {/* Desktop / tablet table */}
      <div className="hidden max-h-[62vh] overflow-auto rounded-xl border border-border/50 md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    ROW_TINT[getEventStatus(row.original.event_date)]
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const e = row.original
            const status = getEventStatus(e.event_date)
            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong rounded-xl border border-border/50 p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{e.event_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(e.event_date)}
                    </p>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <p className="mb-2 text-lg font-bold text-gradient">
                  {formatCurrency(e.cost)}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {e.location ?? '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />{' '}
                    {e.activation_manager ?? '—'}
                  </span>
                </div>
                {e.remarks && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {e.remarks}
                  </p>
                )}
              </motion.div>
            )
          })
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No events found.
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="no-print mt-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount() || 1} · {table.getFilteredRowModel().rows.length}{' '}
          results
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
