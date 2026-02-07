import { MapPin, Timer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useWalkTracker } from '../../../hooks/useWalkTracker'

export function ActiveWalkOverlay() {
  const { t } = useTranslation()
  const { status, formattedDuration, formattedDistance, dogs } =
    useWalkTracker()

  if (status === 'idle') return null

  return (
    <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[5]">
      <div className="bg-black/70 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-white/10">
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'tracking'
                ? 'bg-green-500 animate-pulse'
                : 'bg-yellow-500'
            }`}
          />
          <span className="text-white/80 text-sm font-medium">
            {status === 'tracking'
              ? t('walks.tracking', 'Tracking')
              : t('walks.paused', 'Paused')}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {/* Duration */}
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-white/60" />
            <span className="text-2xl font-bold text-white tabular-nums">
              {formattedDuration}
            </span>
          </div>

          <div className="w-px h-8 bg-white/20" />

          {/* Distance */}
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-white/60" />
            <span className="text-2xl font-bold text-white">
              {formattedDistance}
            </span>
          </div>
        </div>

        {/* Dogs */}
        {dogs.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-white/10">
            {dogs.slice(0, 3).map((dog) => (
              <img
                key={dog._id}
                src={dog.imageUrl}
                alt={dog.name}
                className="w-8 h-8 rounded-full border-2 border-white/20 object-cover"
                title={dog.name}
              />
            ))}
            {dogs.length > 3 && (
              <span className="text-white/60 text-sm">+{dogs.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
