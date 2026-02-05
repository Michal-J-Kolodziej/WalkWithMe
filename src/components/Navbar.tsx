import { useAuthActions } from '@convex-dev/auth/react'
import { Link } from '@tanstack/react-router'
import { useConvexAuth, useQuery } from 'convex/react'
import { Loader2, Menu, PawPrint, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../convex/_generated/api'
import { Button } from './ui/Button'

export function Navbar() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, isLoading } = useConvexAuth()
  const user = useQuery(api.users.current)
  const { signOut } = useAuthActions()

  // Note: We use useConvexAuth for the primary auth state check
  // as it updates immediately upon token changes, whereas useQuery
  // might have a slight delay or initially return undefined.


  // Render auth buttons based on state
  const renderAuthButtons = (isMobile: boolean = false) => {
    if (isLoading) {
      return (
        <div
          className={
            isMobile ? 'flex justify-center py-2' : 'flex items-center'
          }
        >
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (isAuthenticated) {
      return (
        <>
          <Link to="/dashboard">
            <Button
              variant="ghost"
              className={
                isMobile
                  ? 'w-full justify-start'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              {t('nav.dashboard')}
            </Button>
          </Link>
          <Button
            variant="ghost"
            className={
              isMobile
                ? 'w-full justify-start'
                : 'text-muted-foreground hover:text-foreground'
            }
            onClick={() => signOut()}
          >
            {t('nav.signOut')}
          </Button>
        </>
      )
    }

    // Not authenticated
    return (
      <>
        <Link to="/login">
          <Button
            variant="ghost"
            className={
              isMobile
                ? 'w-full justify-start'
                : 'text-muted-foreground hover:text-foreground'
            }
          >
            {t('auth.signIn')}
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="default" className={isMobile ? 'w-full' : ''}>
            {t('landing.getStarted')}
          </Button>
        </Link>
      </>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <PawPrint className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                WalkWithMe
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {t('landing.featuresTitle').split('?')[0]}
              </a>

              {renderAuthButtons(false)}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <a
              href="#features"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {t('landing.featuresTitle').split('?')[0]}
            </a>
            <div className="mt-4 flex flex-col space-y-2 px-3">
              {renderAuthButtons(true)}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
