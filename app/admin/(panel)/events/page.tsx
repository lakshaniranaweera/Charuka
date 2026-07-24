import type { Metadata } from 'next'
import { EventsManager } from '@/components/admin/events-manager'
import { getInitialEvents } from '@/lib/supabase/queries'

export const metadata: Metadata = { title: 'Events' }
export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const events = await getInitialEvents()
  return <EventsManager initialEvents={events} />
}
