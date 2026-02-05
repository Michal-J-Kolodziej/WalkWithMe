import { Umbrella } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useWeather } from '../../hooks/useWeather'
import { cn } from '../../lib/utils'
import { Skeleton } from '../ui/skeleton'

interface MeetingWeatherProps {
  lat: number
  lng: number
  dateTime: number
  compact?: boolean
  className?: string
}

export function MeetingWeather({
  lat,
  lng,
  dateTime,
  compact = false,
  className,
}: MeetingWeatherProps) {
  const { t } = useTranslation()
  const { data, loading } = useWeather(lat, lng)

  if (loading) {
    return compact ? (
      <Skeleton className="h-6 w-16 bg-white/10" />
    ) : (
      <Skeleton className="h-20 w-full bg-white/10" />
    )
  }

  if (!data) return null

  // Find the closest forecast for the meeting time
  const forecast = data.forecast.reduce((prev, curr) => {
    return Math.abs(curr.time - dateTime) < Math.abs(prev.time - dateTime) ? curr : prev
  })

  // If the meeting is more than 2 hours away from our closest forecast point,
  // we might not have reliable data (Open-Meteo 7-day forecast should cover it though)
  const diffInHours = Math.abs(forecast.time - dateTime) / (1000 * 60 * 60)
  if (diffInHours > 2) {
      return null
  }

  const { temp, icon, condition, precip } = forecast

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-white/50',
          className,
        )}
        title={`${condition}, ${precip}% precip`}
      >
        <span className="text-base leading-none">{icon}</span>
        <span className="font-medium">{Math.round(temp)}°C</span>
        {precip > 30 && (
          <span className="flex items-center text-blue-400 text-[10px] ml-1">
            <Umbrella className="w-3 h-3 mr-0.5" />
            {precip}%
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm',
        className,
      )}
    >
      <div className="p-2.5 bg-white/10 rounded-full text-2xl">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">
            {Math.round(temp)}°C
          </span>
          <span className="text-white/60 text-sm">• {condition}</span>
        </div>

        {precip > 0 && (
          <div className="text-xs text-blue-300 flex items-center mt-1">
            <Umbrella className="w-3 h-3 mr-1.5" />
            {t('weather.precipChance', { chance: precip })}
          </div>
        )}
      </div>

      {temp > 25 && (
          <div className="px-2 py-1 bg-orange-500/20 rounded-lg border border-orange-500/30">
              <span className="text-[10px] font-bold text-orange-400 uppercase">Hot! 🐾</span>
          </div>
      )}
    </div>
  )
}
