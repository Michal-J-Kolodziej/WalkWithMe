import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Dog, Edit, Loader2, Mail, MapPin, PawPrint, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import { GlassCard } from '../../components/dashboard/DashboardWidgets'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'
import { Button } from '../../components/ui/Button'
import { formatLocationFreshness } from '../../lib/geo'

export const Route = createFileRoute('/dashboard/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { t } = useTranslation()
  const user = useQuery(api.users.current)
  const dogs = useQuery(api.dogs.listByOwner)

  // Loading state
  if (user === undefined || dogs === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (user === null) {
    return null
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              {t('profile.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('settings.profileSettingsDesc')}
            </p>
          </div>
          <Link to="/dashboard/settings">
            <Button variant="outline" className="gap-2 cursor-pointer">
              <Edit className="w-4 h-4" />
              {t('settings.profileSettings')}
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <GlassCard hover={false} className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-12 h-12 text-primary" />
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{user.name || 'User'}</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                  <PawPrint className="w-4 h-4" />
                  {t('profile.dogOwner')}
                </span>
              </div>

              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email || t('settings.notSet')}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {user.location}
                      {user.geo_location && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Updated{' '}
                          {formatLocationFreshness(user.geo_location.updatedAt)}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Dogs Summary Card */}
        <GlassCard hover={false}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Dog className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('profile.myDogs')}
                </p>
                <p className="text-2xl font-bold">{dogs.length}</p>
              </div>
            </div>
            <Link to="/dashboard/dogs">
              <Button variant="outline" className="gap-2 cursor-pointer">
                <PawPrint className="w-4 h-4" />
                {t('profile.manageDogs')}
              </Button>
            </Link>
          </div>

          {/* Dog Previews */}
          {dogs.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex flex-wrap gap-3">
                {dogs.slice(0, 5).map((dog) => (
                  <div
                    key={dog._id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50"
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10">
                      <img
                        src={dog.imageUrl}
                        alt={dog.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{dog.name}</span>
                  </div>
                ))}
                {dogs.length > 5 && (
                  <div className="flex items-center px-3 py-2 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                    +{dogs.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  )
}
