import { useQuery } from 'convex/react'
import { Calendar, Clock, Dog, Footprints, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../../convex/_generated/api'
import { EmptyState, GlassCard } from '../DashboardWidgets'
import { WalkDetailsSheet } from './WalkDetailsSheet'
import type { Id } from '../../../../convex/_generated/dataModel'

export function WalkHistoryList() {
  const { t } = useTranslation()
  const walks = useQuery(api.walks.listWalks)
  const [selectedWalkId, setSelectedWalkId] = useState<Id<'walks'> | null>(null)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDuration = (
    startedAt: number,
    endedAt?: number,
    pausedDuration = 0,
  ) => {
    if (!endedAt) return '--'
    const durationMs = endedAt - startedAt - pausedDuration
    const minutes = Math.floor(durationMs / 60000)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`
    }
    return `${Math.round(meters)} m`
  }

  if (walks === undefined) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="animate-pulse">
            <div className="space-y-3">
              <div className="h-5 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-4 bg-muted rounded w-20" />
            </div>
          </GlassCard>
        ))}
      </div>
    )
  }

  if (walks.length === 0) {
    return (
      <GlassCard hover={false} className="py-12">
        <EmptyState
          icon={Footprints}
          title={t('walks.noWalks')}
          description={t('walks.noWalksDesc')}
        />
      </GlassCard>
    )
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {walks.map((walk) => (
          <GlassCard
            key={walk._id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setSelectedWalkId(walk._id)}
          >
            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    {formatDate(walk.startedAt)}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatDuration(
                      walk.startedAt,
                      walk.endedAt,
                      walk.pausedDuration,
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{formatDistance(walk.distanceMeters)}</span>
                </div>
              </div>

              {/* Dogs */}
              {walk.dogs && walk.dogs.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Dog className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    {walk.dogs.slice(0, 3).map((dog) => (
                      <img
                        key={dog._id}
                        src={dog.imageUrl}
                        alt={dog.name}
                        className="w-6 h-6 rounded-full object-cover border border-border"
                        title={dog.name}
                      />
                    ))}
                    {walk.dogs.length > 3 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{walk.dogs.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Details Sheet */}
      {selectedWalkId && (
        <WalkDetailsSheet
          walkId={selectedWalkId}
          isOpen={!!selectedWalkId}
          onClose={() => setSelectedWalkId(null)}
        />
      )}
    </>
  )
}
