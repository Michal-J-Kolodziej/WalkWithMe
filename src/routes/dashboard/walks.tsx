import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/walks')({
  component: WalksLayout,
})

function WalksLayout() {
  return <Outlet />
}
