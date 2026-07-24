'use client'

import { motion } from 'framer-motion'
import { CalendarClock, CalendarDays, CheckCircle2, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { DashboardStats } from '@/types'

export function StatCards({ stats }: { stats: DashboardStats }) {
  const items = [
    {
      label: "Today's Events",
      value: stats.today.toString(),
      icon: CalendarDays,
      tint: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Upcoming',
      value: stats.upcoming.toString(),
      icon: CalendarClock,
      tint: 'from-sky-500/20 to-blue-500/10 text-sky-600 dark:text-sky-400',
    },
    {
      label: 'Completed',
      value: stats.completed.toString(),
      icon: CheckCircle2,
      tint: 'from-emerald-500/20 to-green-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total Cost',
      value: formatCurrency(stats.totalCost),
      icon: DollarSign,
      tint: 'from-violet-500/20 to-purple-500/10 text-violet-600 dark:text-violet-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
        >
          <Card className="glass-strong overflow-hidden p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {item.label}
                </p>
                <p className="text-xl font-bold tracking-tight sm:text-2xl">
                  {item.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br sm:h-12 sm:w-12 ${item.tint}`}
              >
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
