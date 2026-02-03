import { Umbrella } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useWeather } from '../../hooks/useWeather'
import { cn } from '../../lib/utils'
import {
  getForecastForTime,
  getWeatherDescription,
  getWeatherIcon,
} from '../../lib/weather'
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
  const { data: weather, loading } = useWeather(lat, lng)

  if (loading) {
    return compact ? (
      <Skeleton className="h-6 w-16" />
    ) : (
      <Skeleton className="h-20 w-full" />
    )
  }

  if (!weather) return null

  const forecast = getForecastForTime(weather, dateTime)

  // If we can't get forecast (e.g. too far in future), don't show anything or show fallback
  // Open-Meteo provides 16 days forecast, but our free API usage might be limited or hook configuration
  // Currently fetchWeather configures 2 days forecast.
  // Ideally we should update fetchWeather if we need longer forecast,
  // but for now let's just handle missing forecast gracefully.
  if (!forecast) {
    return null
  }

  const { temperature, weathercode, precipitation_probability } = forecast
  const WeatherIcon = getWeatherIcon(weathercode)
  const description = getWeatherDescription(weathercode)

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-gray-400',
          className,
        )}
        title={`${t(description)}, ${precipitation_probability}% precip`}
      >
        <WeatherIcon className="w-4 h-4" />
        <span>{Math.round(temperature)}°C</span>
        {precipitation_probability > 30 && (
          <span className="flex items-center text-blue-400 text-xs ml-1">
            <Umbrella className="w-3 h-3 mr-0.5" />
            {precipitation_probability}%
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10',
        className,
      )}
    >
      <div className="p-2 bg-white/10 rounded-full">
        <WeatherIcon className="w-8 h-8 text-blue-400" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">
            {Math.round(temperature)}°C
          </span>
          <span className="text-gray-400 text-sm">• {t(description)}</span>
        </div>

        {precipitation_probability > 0 && (
          <div className="text-sm text-blue-300 flex items-center mt-1">
            <Umbrella className="w-3 h-3 mr-1.5" />
            {t('weather.precipChance', { chance: precipitation_probability })}
          </div>
        )}
      </div>
    </div>
  )
}
