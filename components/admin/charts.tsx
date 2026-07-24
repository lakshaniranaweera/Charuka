'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { computeStats } from '@/lib/events'
import { formatCurrency } from '@/lib/format'
import type { EventRow } from '@/types'

const STATUS_COLORS = ['#f59e0b', '#0ea5e9', '#10b981']

export function DashboardCharts({ events }: { events: EventRow[] }) {
  const stats = useMemo(() => computeStats(events), [events])

  const byMonth = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of events) {
      const key = format(parseISO(e.event_date), 'MMM yyyy')
      map.set(key, (map.get(key) ?? 0) + Number(e.cost || 0))
    }
    return Array.from(map, ([month, cost]) => ({ month, cost })).slice(-6)
  }, [events])

  const statusData = [
    { name: 'Today', value: stats.today },
    { name: 'Upcoming', value: stats.upcoming },
    { name: 'Completed', value: stats.completed },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="glass-strong lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Cost by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byMonth}>
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="currentColor"
                opacity={0.6}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="currentColor"
                opacity={0.6}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(120,120,120,0.08)' }}
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(120,120,120,0.2)',
                  background: 'hsl(var(--popover))',
                }}
              />
              <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="text-base">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(120,120,120,0.2)',
                  background: 'hsl(var(--popover))',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            {statusData.map((s, i) => (
              <span key={s.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: STATUS_COLORS[i] }}
                />
                {s.name}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
