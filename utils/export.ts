import type { EventRow } from '@/types'
import { formatCurrency, formatDate } from '@/lib/format'

interface ExportColumn {
  header: string
  value: (e: EventRow) => string
}

export const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Event Date', value: (e) => formatDate(e.event_date) },
  { header: 'Event', value: (e) => e.event_name },
  { header: 'Cost', value: (e) => formatCurrency(e.cost) },
  { header: 'Previsit Date', value: (e) => formatDate(e.previsit_date) },
  { header: 'Production Date', value: (e) => formatDate(e.production_date) },
  { header: 'Setup Date', value: (e) => formatDate(e.setup_date) },
  { header: 'Location', value: (e) => e.location ?? '' },
  { header: 'Activation Manager', value: (e) => e.activation_manager ?? '' },
  { header: 'Remarks', value: (e) => e.remarks ?? '' },
]

function timestamp() {
  return new Date().toISOString().slice(0, 10)
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** CSV export (RFC 4180 quoting). */
export function exportCsv(events: EventRow[]) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const rows = [
    EXPORT_COLUMNS.map((c) => escape(c.header)).join(','),
    ...events.map((e) =>
      EXPORT_COLUMNS.map((c) => escape(c.value(e))).join(',')
    ),
  ]
  const blob = new Blob(['﻿' + rows.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  download(blob, `activation-events-${timestamp()}.csv`)
}

/** Excel export via SheetJS (lazy-loaded). */
export async function exportExcel(events: EventRow[]) {
  const XLSX = await import('xlsx')
  const data = events.map((e) => {
    const row: Record<string, string> = {}
    for (const col of EXPORT_COLUMNS) row[col.header] = col.value(e)
    return row
  })
  const worksheet = XLSX.utils.json_to_sheet(data)
  worksheet['!cols'] = EXPORT_COLUMNS.map(() => ({ wch: 20 }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Events')
  XLSX.writeFile(workbook, `activation-events-${timestamp()}.xlsx`)
}

/** PDF export via jsPDF + autotable (lazy-loaded). */
export async function exportPdf(events: EventRow[], title = 'Activation Planner') {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text(title, 14, 16)
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [EXPORT_COLUMNS.map((c) => c.header)],
    body: events.map((e) => EXPORT_COLUMNS.map((c) => c.value(e))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  })

  doc.save(`activation-events-${timestamp()}.pdf`)
}
