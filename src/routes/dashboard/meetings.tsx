import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/meetings')({
  component: MeetingsLayout,
})

function MeetingsLayout() {
  return <Outlet />
}
