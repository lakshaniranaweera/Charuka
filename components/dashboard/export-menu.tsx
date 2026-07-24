'use client'

import { Download, FileSpreadsheet, FileText, FileType, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportCsv, exportExcel, exportPdf } from '@/utils/export'
import type { EventRow } from '@/types'

export function ExportMenu({
  events,
  title,
}: {
  events: EventRow[]
  title: string
}) {
  const guard = async (fn: () => void | Promise<void>) => {
    if (events.length === 0) {
      toast.error('Nothing to export')
      return
    }
    try {
      await fn()
      toast.success('Export ready')
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="glass-strong">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Export {events.length} rows</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => guard(() => exportExcel(events))}>
          <FileSpreadsheet className="text-emerald-500" /> Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => guard(() => exportCsv(events))}>
          <FileType className="text-sky-500" /> CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => guard(() => exportPdf(events, title))}>
          <FileText className="text-rose-500" /> PDF (.pdf)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.print()}>
          <Printer /> Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
