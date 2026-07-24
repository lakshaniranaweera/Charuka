import { PublicDashboard } from '@/components/dashboard/public-dashboard'
import { getInitialEvents } from '@/lib/supabase/queries'

// Realtime keeps the client fresh; render dynamically so first paint is current.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const events = await getInitialEvents()
  return <PublicDashboard initialEvents={events} />
}
