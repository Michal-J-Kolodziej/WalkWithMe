import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import {
  ArrowRight,
  Calendar,
  Loader2,
  MapPin,
  Sparkles,
  UserCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../convex/_generated/api'
import { Button } from './ui/Button'
import { Input } from './ui/input'
import { Label } from './ui/label'

export function CompleteProfileForm() {
  const { t } = useTranslation()
  const user = useQuery(api.users.current)
  const completeProfile = useMutation(api.users.completeProfile)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    const formData = new FormData(event.currentTarget)

    try {
      const ageValue = formData.get('age') as string
      await completeProfile({
        bio: formData.get('bio') as string,
        location: formData.get('location') as string,
        role: formData.get('role') as string,
        age: ageValue ? parseInt(ageValue, 10) : undefined,
      })
      navigate({ to: '/' })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('completeProfile.error', 'Failed to complete profile')
      setError(message)
      console.error('Failed to complete profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while auth is being established
  // authToken is null when not authenticated OR still loading
  // user is undefined while loading, null if not authenticated
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            {t('completeProfile.settingUp', 'Setting up your account...')}
          </p>
        </div>
      </div>
    )
  }

  // If user is null (not authenticated), show error with option to sign in
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive mb-4">
            <UserCircle size={48} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('completeProfile.sessionExpired', 'Session Expired')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'completeProfile.sessionExpiredDesc',
              'Your authentication session could not be verified. Please sign in again to complete your profile.',
            )}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button variant="outline">{t('common.goHome', 'Go Home')}</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated, show the form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-8 md:p-12 transition-all duration-300 hover:shadow-primary/5">
          <div className="text-center mb-10 space-y-4">
            <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4 animate-bounce">
              <Sparkles size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('completeProfile.title')}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-light">
              {t('completeProfile.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Role - Auto-set to Dog Owner */}
              <input type="hidden" name="role" value="owner" />
              <div className="space-y-3">
                <Label className="text-lg font-medium ml-1">
                  {t('profile.role')}
                </Label>
                <div className="p-4 rounded-2xl border-2 border-primary bg-primary/5 text-center">
                  <span className="block text-xl">🐕</span>
                  <span className="font-semibold">{t('profile.dogOwner')}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <Label
                    htmlFor="location"
                    className="text-base font-medium ml-1 transition-colors group-focus-within:text-primary"
                  >
                    {t('completeProfile.location')}
                  </Label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                      size={20}
                    />
                    <Input
                      id="location"
                      name="location"
                      placeholder={t('completeProfile.locationPlaceholder')}
                      required
                      className="pl-12 h-14 rounded-2xl bg-background/50 border-input transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label
                    htmlFor="bio"
                    className="text-base font-medium ml-1 transition-colors group-focus-within:text-primary"
                  >
                    {t('completeProfile.bio')}
                  </Label>
                  <div className="relative">
                    <UserCircle
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                      size={20}
                    />
                    <Input
                      id="bio"
                      name="bio"
                      placeholder={t('completeProfile.bioPlaceholder')}
                      required
                      className="pl-12 h-14 rounded-2xl bg-background/50 border-input transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Age Field */}
              <div className="space-y-2 group">
                <Label
                  htmlFor="age"
                  className="text-base font-medium ml-1 transition-colors group-focus-within:text-primary"
                >
                  {t('settings.age')} ({t('common.optional')})
                </Label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                    size={20}
                  />
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="13"
                    max="120"
                    placeholder={t('settings.agePlaceholder')}
                    className="pl-12 h-14 rounded-2xl bg-background/50 border-input transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 text-lg rounded-2xl group relative overflow-hidden"
              size="lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('completeProfile.settingUp', 'Setting up...')}
                  </>
                ) : (
                  <>
                    {t('completeProfile.continue')}{' '}
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
