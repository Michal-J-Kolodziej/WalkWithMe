import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useConvexAuth, useMutation } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/callback')({
  component: CallbackPage,
})

function CallbackPage() {
  const navigate = useNavigate()
  const { isLoading, isAuthenticated } = useConvexAuth()
  const getOrCreateUser = useMutation(api.users.getOrCreate)
  const hasCreatedUser = useRef(false)

  useEffect(() => {
    // Wait for auth to be loaded and confirmed
    if (!isLoading && isAuthenticated && !hasCreatedUser.current) {
      hasCreatedUser.current = true
      // Create user in database if it doesn't exist
      getOrCreateUser()
        .then((user) => {
          if (user?.isProfileComplete) {
            navigate({ to: '/dashboard' })
          } else {
            navigate({ to: '/complete-profile' })
          }
        })
        .catch((error) => {
          console.error('Error creating user:', error)
          navigate({ to: '/dashboard' })
        })
    }
  }, [isLoading, isAuthenticated, getOrCreateUser, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
