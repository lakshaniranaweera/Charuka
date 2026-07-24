import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar email={user.email ?? 'admin'} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-end gap-2 px-4 pt-4 lg:px-8">
          <ThemeToggle />
        </div>
        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
