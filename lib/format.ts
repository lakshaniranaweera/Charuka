import { format, parseISO } from 'date-fns'

const currency = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 2,
})

export function formatCurrency(value: number | string | null | undefined) {
  const n = Number(value ?? 0)
  return currency.format(Number.isFinite(n) ? n : 0)
}

export function formatDate(
  value: string | null | undefined,
  pattern = 'MMM d, yyyy'
) {
  if (!value) return '—'
  try {
    return format(parseISO(value), pattern)
  } catch {
    return '—'
  }
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  try {
    return format(parseISO(value), 'MMM d, yyyy · h:mm a')
  } catch {
    return '—'
  }
}
