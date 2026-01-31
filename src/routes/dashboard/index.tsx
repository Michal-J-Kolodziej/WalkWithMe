import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { OwnerDashboard } from '../../components/dashboard/OwnerDashboard'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndexPage,
})

function DashboardIndexPage() {
  const user = useQuery(api.users.current)
  
  // Loading state
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect handled by ProfileGuard
  if (user === null) {
    return null
  }

  return (
    <DashboardLayout user={user}>
      <OwnerDashboard user={user} />
    </DashboardLayout>
  )
}
