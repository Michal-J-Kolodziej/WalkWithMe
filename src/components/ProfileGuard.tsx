import { useLocation, useNavigate } from '@tanstack/react-router'
import { useConvexAuth, useQuery } from 'convex/react'
import { useEffect } from 'react'
import { api } from '../../convex/_generated/api'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/complete-profile']

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth()
  const user = useQuery(api.users.current)
  const router = useNavigate()
  const location = useLocation()

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  )

  useEffect(() => {
    // If auth state is loading, do nothing
    if (isAuthLoading) return

    // If user data is loading, do nothing
    if (user === undefined) return

    // If user is authenticated (WorkOS) but not found in Convex DB -> Zombie state
    // Redirect to callback to ensure user is created in DB
    if (isAuthenticated && user === null) {
      console.log('ProfileGuard: Authenticated but user not found in DB, redirecting to callback')
      router({ to: '/callback' })
      return
    }

    // If not authenticated (and user is null) -> Login
    if (!isAuthenticated && user === null) {
      // Redirect to login from any protected route
      if (isProtectedRoute) {
        // console.log('ProfileGuard: Not authenticated on protected route, redirecting to login')
        router({ to: '/login' })
      }
      return
    }

    // If logged in
    if (user && !user.isProfileComplete) {
      if (location.pathname !== '/complete-profile') {
        router({ to: '/complete-profile', replace: true })
      }
    } else if (user) {
      // If profile is complete, but trying to access complete-profile page, redirect to dashboard
      if (location.pathname === '/complete-profile') {
        router({ to: '/dashboard' })
      }
    }
  }, [user, isAuthLoading, isAuthenticated, location.pathname, router, isProtectedRoute])

  // While loading user state on protected routes, show loading instead of content flash
  if (user === undefined && isProtectedRoute) {
    return null
  }

  return <>{children}</>
}
