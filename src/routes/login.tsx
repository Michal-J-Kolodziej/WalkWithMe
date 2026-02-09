import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@workos-inc/authkit-react'
import { useConvexAuth } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { isLoading, isAuthenticated } = useConvexAuth()
  const { signIn } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Already authenticated, redirect to dashboard
        navigate({ to: '/dashboard' })
      } else {
        // Trigger WorkOS AuthKit login
        // We use a timeout to allow the UI to render first
        const timer = setTimeout(() => {
          signIn().catch((err) => {
            console.error('Auto-signIn failed (likely browser blocked):', err)
          })
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [isLoading, isAuthenticated, signIn, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {isAuthenticated ? 'Redirecting to dashboard...' : 'Redirecting to sign in...'}
        </p>
        
        {/* Always show button when not loading as a fallback */}
        {!isLoading && !isAuthenticated && (
          <div className="flex flex-col items-center gap-2 animate-in fade-in duration-500 delay-1000">
            <p className="text-sm text-muted-foreground text-center">
              Browser blocking the redirect?
            </p>
            <button 
              onClick={() => signIn()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Sign In Manually
            </button>
          </div>
        )}

        {/* Fallback for stuck dashboard redirect */}
        {!isLoading && isAuthenticated && (
           <button 
             onClick={() => navigate({ to: '/dashboard' })}
             className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
           >
             Go to Dashboard
           </button>
        )}
      </div>
    </div>
  )
}
