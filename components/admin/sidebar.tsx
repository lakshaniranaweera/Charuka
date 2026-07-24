'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CalendarRange,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  ShieldCheck,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSettingsContext } from '@/components/providers/settings-provider'
import { signOutAction } from '@/app/admin/login/actions'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Events', icon: CalendarRange },
  { href: '/admin/settings', label: 'Settings', icon: Palette },
]

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname()
  const { settings } = useSettingsContext()
  const [open, setOpen] = React.useState(false)

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {active && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
              />
            )}
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const content = (
    <div className="flex h-full flex-col p-4">
      <Link href="/admin" className="mb-6 flex items-center gap-3 px-2">
        {settings.logo_url ? (
          <Image
            src={settings.logo_url}
            alt="Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl border border-border/60 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold leading-tight">{settings.title}</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </Link>

      {nav}

      <div className="mt-auto space-y-3 border-t border-border/60 pt-4">
        <div className="px-2">
          <p className="truncate text-xs text-muted-foreground">Signed in as</p>
          <p className="truncate text-sm font-medium">{email}</p>
        </div>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-card/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <span className="font-semibold">Admin Panel</span>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card/60 backdrop-blur-xl lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 h-full w-64 border-r border-border/60 bg-card"
          >
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {content}
          </motion.div>
        </div>
      )}
    </>
  )
}
