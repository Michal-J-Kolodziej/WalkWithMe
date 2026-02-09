import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@workos-inc/authkit-react'
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
  const { user: workosUser } = useAuth()
  const getOrCreateUser = useMutation(api.users.getOrCreate)
  const hasCreatedUser = useRef(false)
  
  useEffect(() => {
    // Wait for auth to be loaded and confirmed
    if (!isLoading && isAuthenticated && !hasCreatedUser.current) {
      hasCreatedUser.current = true
      
      // Pass client-side user details as fallback since token might be missing email
      const userData = workosUser ? {
        email: workosUser.email || undefined,
        name: workosUser.firstName ? `${workosUser.firstName} ${workosUser.lastName || ''}`.trim() : undefined,
        image: workosUser.profilePictureUrl || undefined
      } : {};

      // Create user in database if it doesn't exist
      getOrCreateUser(userData)
        .then((user) => {
          if (user?.isProfileComplete) {
            navigate({ to: '/dashboard' })
          } else {
            navigate({ to: '/complete-profile' })
          }
        })
        .catch((error) => {
          console.error('Error creating user:', error)
          // Don't just redirect blindy on error, maybe show it?
          // But for now, let's log it.
          // navigate({ to: '/dashboard' }) 
        })
    } else if (!isLoading && !isAuthenticated) {
        navigate({ to: '/login' })
    }
  }, [isLoading, isAuthenticated, getOrCreateUser, navigate, workosUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
