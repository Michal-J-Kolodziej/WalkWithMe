import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import {
  Calendar,
  Clock,
  Dog,
  Footprints,
  MapPin,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import { Button } from '../ui/Button'
import { ActiveWalkersList } from './beacon/ActiveWalkersList'
import { EmptyState, GlassCard, StatCard } from './DashboardWidgets'
import { DogCard } from './DogCard'
import { AddDogForm } from './DogForm'
import { WeatherWidget } from './WeatherWidget'

function formatDuration(ms: number): string {
  if (!ms || isNaN(ms)) return '0m'
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

interface OwnerDashboardProps {
  user: {
    name?: string
    bio?: string
    location?: string
  } | null
}

export function OwnerDashboard({ user }: OwnerDashboardProps) {
  const { t } = useTranslation()
  const dogs = useQuery(api.dogs.listByOwner)
  const friendCount = useQuery(api.friendships.count)
  const pendingRequests = useQuery(api.friendRequests.countPending)
  const walkStats = useQuery(api.walks.getWalkStats)
  const recentWalks = useQuery(api.walks.listWalks, { limit: 3 })
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)

  const hasDogs = dogs && dogs.length > 0
  const dogCount = dogs?.length ?? 0

  const welcomeMessage = user?.name
    ? t('dashboard.welcomeBack', { name: user.name.split(' ')[0] })
    : t('dashboard.welcomeDefault')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {welcomeMessage}
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.bio || t('dashboard.subtitle')}
          </p>
        </div>
        <Link to="/dashboard/discover">
          <Button className="gap-2 cursor-pointer">
            <Search className="w-4 h-4" />
            {t('dashboard.findWalkingPartners')}
          </Button>
        </Link>
      </div>

      {/* Active Walkers - Beacon */}
      <ActiveWalkersList />

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Dog}
          label={t('dashboard.statsMyDogs')}
          value={dogCount}
          iconColor="text-primary"
        />
        <Link to="/dashboard/friends">
          <StatCard
            icon={Users}
            label={t('dashboard.statsFriends')}
            value={friendCount ?? 0}
            iconColor="text-blue-500"
            trend={
              pendingRequests && pendingRequests > 0
                ? { value: pendingRequests, positive: true }
                : undefined
            }
          />
        </Link>
        <Link to="/dashboard/walks">
          <StatCard
            icon={Clock}
            label={t('dashboard.statsTotalWalkTime')}
            value={
              walkStats
                ? formatDuration(walkStats.totalDuration)
                : `0 ${t('dashboard.hours')}`
            }
            iconColor="text-amber-500"
          />
        </Link>
        <StatCard
          icon={Calendar}
          label={t('dashboard.statsUpcoming')}
          value={0}
          iconColor="text-purple-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Dogs Section - Spans 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('dashboard.myDogs')}</h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
              onClick={() => setIsAddFormOpen(true)}
            >
              <Plus className="w-4 h-4" />
              {t('dashboard.addDog')}
            </Button>
          </div>

          {dogs === undefined ? (
            // Loading skeleton
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <GlassCard key={i} className="animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-24" />
                      <div className="h-4 bg-muted rounded w-32" />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : hasDogs ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {dogs.map((dog) => (
                <DogCard key={dog._id} dog={dog} />
              ))}
            </div>
          ) : (
            <GlassCard hover={false}>
              <EmptyState
                icon={Dog}
                title={t('dashboard.noDogs')}
                description={t('dashboard.noDogsDesc')}
                action={
                  <Button
                    className="gap-2 cursor-pointer"
                    onClick={() => setIsAddFormOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    {t('dashboard.addFirstDog')}
                  </Button>
                }
              />
            </GlassCard>
          )}
        </div>

        {/* Activity Feed - 1 column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {t('dashboard.recentActivity')}
            </h2>
            <Link to="/dashboard/walks">
              <Button variant="ghost" size="sm" className="text-primary">
                {t('walks.viewDetails')}
              </Button>
            </Link>
          </div>

          {recentWalks && recentWalks.length > 0 ? (
            <div className="space-y-3">
              {recentWalks.map((walk) => (
                <Link key={walk._id} to="/dashboard/walks">
                  <GlassCard className="hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <Footprints className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {new Date(walk.startedAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(walk.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {formatDistance(walk.distanceMeters)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          ) : (
            <GlassCard hover={false}>
              <EmptyState
                icon={Footprints}
                title={t('dashboard.noWalks')}
                description={t('dashboard.noWalksDesc')}
                action={
                  <Link to="/dashboard/walks">
                    <Button variant="outline" className="gap-2 cursor-pointer">
                      <Footprints className="w-4 h-4" />
                      {t('walks.startWalk')}
                    </Button>
                  </Link>
                }
              />
            </GlassCard>
          )}

          {/* Upcoming Events */}
          <h2 className="text-xl font-semibold">
            {t('dashboard.upcomingEvents')}
          </h2>

          <GlassCard hover={false}>
            <EmptyState
              icon={Calendar}
              title={t('dashboard.noUpcoming')}
              description={t('dashboard.noUpcomingDesc')}
            />
          </GlassCard>

          {/* Quick Action Card */}
          <Link to="/dashboard/dogs">
            <GlassCard className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Dog className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {t('dashboard.manageYourDogs')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.manageYourDogsDesc')}
                  </p>
                </div>
              </div>
            </GlassCard>
          </Link>
        </div>
      </div>

      {/* Add Dog Modal */}
      <AddDogForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
      />
    </div>
  )
}
