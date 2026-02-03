import { useLocation, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { useEffect } from 'react'
import { api } from '../../convex/_generated/api'

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.current)
  const router = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // If user data is loading, do nothing
    if (user === undefined) return

    // If not logged in
    if (user === null) {
      if (location.pathname === '/complete-profile') {
        router({ to: '/login' })
      }
      return
    }

    // If logged in
    if (!user.isProfileComplete) {
      if (location.pathname !== '/complete-profile') {
        router({ to: '/complete-profile', replace: true })
      }
    } else {
      // If profile is complete, but trying to access complete-profile page, redirect to home
      // This is optional but good UX
      if (location.pathname === '/complete-profile') {
        router({ to: '/' })
      }
    }
  }, [user, location.pathname, router])

  // While loading user state, we might want to show a spinner or nothing
  // To avoid flash of content, we can return null if user is undefined
  if (user === undefined) return null

  return <>{children}</>
}
