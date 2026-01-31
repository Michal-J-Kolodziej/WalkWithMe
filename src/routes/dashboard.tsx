import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  // This is a layout route - it renders an Outlet for child routes
  // Child routes: /dashboard/, /dashboard/dogs, /dashboard/profile
  return <Outlet />
}
