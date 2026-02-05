import { useAuthActions } from '@convex-dev/auth/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ArrowRight, Lock, Mail, PawPrint } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../convex/_generated/api'
import { Button } from './ui/Button'
import { Input } from './ui/input'
import { Label } from './ui/label'

export function LoginForm() {
  const { t } = useTranslation()
  const { signIn } = useAuthActions()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Check auth state
  const user = useQuery(api.users.current)
  
  // Track if we successfully signed in and are waiting for auth session
  const [isWaitingForAuth, setIsWaitingForAuth] = useState(false)

  // Navigate only when we have a confirmed user session after login
  useEffect(() => {
    if (isWaitingForAuth && user) {
      navigate({ to: '/dashboard' })
    }
  }, [isWaitingForAuth, user, navigate])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    try {
      await signIn('password', formData)
      // Successful login, now wait for auth session to propagate
      setIsWaitingForAuth(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              'auth.loginError',
              'Invalid email or password. Please try again.',
            ),
      )
      setIsLoading(false)
    } 
    // Note: We don't set isLoading(false) on success because we want to keep 
    // the loading state while waiting for the user session + navigation
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-transform duration-200 group-hover:scale-105">
              <PawPrint className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              WalkWithMe
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-muted-foreground">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input name="flow" type="hidden" value="signIn" />

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                {t('auth.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                  className="pl-10 h-12 rounded-xl bg-background border-border focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-foreground font-medium"
                >
                  {t('auth.password')}
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10 h-12 rounded-xl bg-background border-border focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('auth.signingIn', 'Signing in...')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {t('auth.signIn')}
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('auth.noAccount')}
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-primary font-medium hover:text-primary/80 transition-colors cursor-pointer"
            >
              {t('auth.signUp')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
