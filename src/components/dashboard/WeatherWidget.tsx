import { useTranslation } from 'react-i18next'
import { useLocationTracker } from '../../hooks/useLocationTracker'
import { useWeather } from '../../hooks/useWeather'
import { getWeatherDescription, getWeatherIcon } from '../../lib/weather'
import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export function WeatherWidget() {
  const { t } = useTranslation()
  // Use our location tracker to get current user position
  const { latitude, longitude, loading: locationLoading } = useLocationTracker()

  // Provide defaults or null to useWeather
  const { data: weather, loading: weatherLoading } = useWeather(
    latitude,
    longitude,
  )

  const loading = locationLoading || weatherLoading

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-12" />
        </CardContent>
      </Card>
    )
  }

  if (!weather || !weather.current_weather) {
    // Don't render empty state if we just don't have location yet or failed silently
    return null
  }

  const { temperature, weathercode } = weather.current_weather
  const WeatherIcon = getWeatherIcon(weathercode)
  const description = getWeatherDescription(weathercode)

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 bg-blue-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

      <CardContent className="p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
            <WeatherIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {Math.round(temperature)}°C
            </div>
            <div className="text-sm text-gray-400">{t(description)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
