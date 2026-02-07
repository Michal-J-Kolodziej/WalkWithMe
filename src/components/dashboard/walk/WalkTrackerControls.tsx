import { useQuery } from 'convex/react'
import { Check, Dog, Loader2, Pause, Play, Square } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../../convex/_generated/api'
import { useWalkTracker } from '../../../hooks/useWalkTracker'
import { Button } from '../../ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import type { Id } from '../../../../convex/_generated/dataModel'

interface WalkTrackerControlsProps {
  compact?: boolean
}

export function WalkTrackerControls({
  compact = false,
}: WalkTrackerControlsProps) {
  const { t } = useTranslation()
  const { status, startWalk, pauseWalk, resumeWalk, endWalk, isLoading } =
    useWalkTracker()

  const dogs = useQuery(api.dogs.listByOwner)
  const [showDogSelector, setShowDogSelector] = useState(false)
  const [selectedDogs, setSelectedDogs] = useState<Array<Id<'dogs'>>>([])
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)

  const handleStartClick = () => {
    if (dogs && dogs.length > 0) {
      setSelectedDogs([])
      setShowDogSelector(true)
    } else {
      // Start without dogs
      handleConfirmStart()
    }
  }

  const handleConfirmStart = async () => {
    setIsStarting(true)
    try {
      await startWalk(selectedDogs)
      setShowDogSelector(false)
    } catch (error) {
      console.error('Failed to start walk:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleToggleDog = (dogId: Id<'dogs'>) => {
    setSelectedDogs((prev) =>
      prev.includes(dogId)
        ? prev.filter((id) => id !== dogId)
        : [...prev, dogId],
    )
  }

  const handleEndClick = () => {
    setShowEndConfirm(true)
  }

  const handleConfirmEnd = async () => {
    setIsEnding(true)
    try {
      await endWalk()
      setShowEndConfirm(false)
    } catch (error) {
      console.error('Failed to end walk:', error)
    } finally {
      setIsEnding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  // Idle state - show start button
  if (status === 'idle') {
    return (
      <>
        <Button
          onClick={handleStartClick}
          size={compact ? 'default' : 'lg'}
          className={`
            gap-2 bg-gradient-to-r from-green-500 to-emerald-500 
            hover:from-green-600 hover:to-emerald-600
            text-white font-semibold shadow-lg
            ${compact ? '' : 'px-8 py-6 text-lg'}
          `}
        >
          <Play className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
          {t('walks.startWalk')}
        </Button>

        {/* Dog selector modal */}
        <Dialog open={showDogSelector} onOpenChange={setShowDogSelector}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Dog className="w-5 h-5 text-primary" />
                {t('walks.selectDogs')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2 py-4">
              {dogs && dogs.length > 0 ? (
                dogs.map((dog) => (
                  <button
                    key={dog._id}
                    onClick={() => handleToggleDog(dog._id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl
                      border transition-all cursor-pointer
                      ${
                        selectedDogs.includes(dog._id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    <img
                      src={dog.imageUrl}
                      alt={dog.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{dog.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dog.breed}
                      </p>
                    </div>
                    {selectedDogs.includes(dog._id) && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {t('dogs.noDogs')}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDogSelector(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleConfirmStart}
                disabled={isStarting}
                className="gap-2"
              >
                {isStarting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {t('walks.startWalk')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Active/Paused state - show controls
  return (
    <>
      <div className={`flex items-center gap-2 ${compact ? '' : 'gap-3'}`}>
        {/* Pause/Resume button */}
        {status === 'tracking' ? (
          <Button
            onClick={pauseWalk}
            size={compact ? 'default' : 'lg'}
            variant="outline"
            className="gap-2"
          >
            <Pause className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
            {!compact && t('walks.pause')}
          </Button>
        ) : (
          <Button
            onClick={resumeWalk}
            size={compact ? 'default' : 'lg'}
            className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Play className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
            {!compact && t('walks.resume')}
          </Button>
        )}

        {/* End button */}
        <Button
          onClick={handleEndClick}
          size={compact ? 'default' : 'lg'}
          variant="destructive"
          className="gap-2"
        >
          <Square className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
          {!compact && t('walks.endWalk')}
        </Button>
      </div>

      {/* End confirmation modal */}
      <Dialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('walks.confirmEnd')}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndConfirm(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmEnd}
              disabled={isEnding}
              className="gap-2"
            >
              {isEnding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {t('walks.endWalk')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
