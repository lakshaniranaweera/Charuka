import type { Metadata } from 'next'
import { AdminOverview } from '@/components/admin/overview'
import { getInitialEvents } from '@/lib/supabase/queries'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function AdminHomePage() {
  const events = await getInitialEvents()
  return <AdminOverview initialEvents={events} />
}
