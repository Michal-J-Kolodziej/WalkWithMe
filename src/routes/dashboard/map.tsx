import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { SpotsMap } from '../../components/dashboard/map/SpotsMap'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'

export const Route = createFileRoute('/dashboard/map')({
  component: MapPage,
})

function MapPage() {
  const user = useQuery(api.users.current)

  // Wait for user to be loaded or handled by layout
  // Note: WalkTrackerControls and ActiveWalkOverlay are already included in SpotsMap

  return (
    <DashboardLayout user={user ?? null} immersive>
      <div className="relative h-full w-full overflow-hidden bg-background">
        <SpotsMap />
      </div>
    </DashboardLayout>
  )
}
