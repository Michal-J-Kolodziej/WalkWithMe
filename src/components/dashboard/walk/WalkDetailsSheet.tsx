import { useMutation, useQuery } from 'convex/react'
import { Calendar, Clock, Dog, Loader2, MapPin, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { Button } from '../../ui/Button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '../../ui/sheet'
import { WalkRouteMap } from './WalkRouteMap'

interface WalkDetailsSheetProps {
  walkId: Id<'walks'>
  isOpen: boolean
  onClose: () => void
}

export function WalkDetailsSheet({ walkId, isOpen, onClose }: WalkDetailsSheetProps) {
  const { t } = useTranslation()
  const walkDetails = useQuery(api.walks.getWalkDetails, { walkId })
  const deleteMutation = useMutation(api.walks.remove)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatDuration = (startedAt: number, endedAt?: number, pausedDuration = 0) => {
    if (!endedAt) return '--'
    const durationMs = endedAt - startedAt - pausedDuration
    const seconds = Math.floor(durationMs / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`
    }
    return `${Math.round(meters)} m`
  }

  const handleDelete = async () => {
    if (!confirm(t('walks.deleteConfirm'))) return
    
    setIsDeleting(true)
    try {
      await deleteMutation({ walkId })
      onClose()
    } catch (error) {
      console.error('Failed to delete walk:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('walks.viewDetails')}
          </SheetTitle>
        </SheetHeader>

        {walkDetails === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : walkDetails === null ? (
          <div className="text-center py-12 text-muted-foreground">
            Walk not found
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Route Map */}
            {walkDetails.routePoints.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-border h-64">
                <WalkRouteMap routePoints={walkDetails.routePoints} />
              </div>
            )}

            {/* Date & Time */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{formatDate(walkDetails.startedAt)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(walkDetails.startedAt)}
                    {walkDetails.endedAt && ` - ${formatTime(walkDetails.endedAt)}`}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('walks.duration')}</p>
                  <p className="font-medium">
                    {formatDuration(
                      walkDetails.startedAt,
                      walkDetails.endedAt,
                      walkDetails.pausedDuration,
                    )}
                  </p>
                </div>
              </div>

              {/* Distance */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('walks.distance')}</p>
                  <p className="font-medium">{formatDistance(walkDetails.distanceMeters)}</p>
                </div>
              </div>
            </div>

            {/* Dogs */}
            {walkDetails.dogs && walkDetails.dogs.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Dog className="w-4 h-4" />
                  {t('walks.dogsOnWalk', 'Dogs on this walk')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {walkDetails.dogs.map((dog) => (
                    <div
                      key={dog._id}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50"
                    >
                      <img
                        src={dog.imageUrl}
                        alt={dog.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{dog.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route Points Count */}
            <div className="text-sm text-muted-foreground">
              {walkDetails.routePoints.length} GPS points recorded
            </div>

            {/* Delete Button */}
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {t('common.delete')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
