import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-50 to-blue-50 p-6 text-center dark:from-slate-950 dark:to-slate-900">
      <p className="text-7xl font-bold text-gradient">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  )
}
