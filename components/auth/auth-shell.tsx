import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-blue-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <Card className="glass-strong relative w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Link
            href="/"
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg"
          >
            <LayoutDashboard className="h-7 w-7" />
          </Link>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && (
          <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </Card>
    </div>
  )
}
