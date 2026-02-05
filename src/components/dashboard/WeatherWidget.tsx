import { AlertCircle, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocationTracker } from '../../hooks/useLocationTracker'
import { useWeather } from '../../hooks/useWeather'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export function WeatherWidget() {
  const { t } = useTranslation()
  const { latitude, longitude, loading: locationLoading, error: locationError } = useLocationTracker()
  const { data, loading: weatherLoading, error: weatherError } = useWeather(latitude, longitude)

  const loading = locationLoading || weatherLoading

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sun className="h-4 w-4 text-white/40" />
            <div className="h-4 w-24 bg-white/20 rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-white/20 rounded mb-2"></div>
          <div className="h-4 w-32 bg-white/10 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (locationError || (!latitude && !locationLoading)) {
    return (
       <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            {t('nav.dashboard')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/60">
            {t('settings.locationServicesDesc')}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (weatherError || !data) {
    return null // Fail silently or show minimal error
  }

  const { current, forecast } = data

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/20 transition-colors" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{current.icon}</span>
            <span>{t(`weather.${getTranslationKey(current.code)}`)}</span>
          </div>
          <span className="text-[10px] text-white/40">
            {new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-3xl font-bold">{Math.round(current.temp)}°C</span>
          <span className="text-sm text-white/60 pb-1">
            {current.condition}
          </span>
        </div>

        {current.isHotPavement && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-2 flex gap-2 items-start mb-4">
            <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                {t('weather.hotPavement')}
              </p>
              <p className="text-[10px] text-orange-200/80 leading-tight">
                {t('weather.hotPavementDesc')}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
          {forecast.slice(0, 6).map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[36px]">
              <span className="text-[9px] text-white/30">
                {new Date(h.time).getHours()}:00
              </span>
              <span className="text-base">{h.icon}</span>
              <span className="text-[10px] font-medium text-white/80">{Math.round(h.temp)}°</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getTranslationKey(code: number): string {
  if (code === 0) return 'clearSky'
  if (code <= 3) return 'partlyCloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code <= 55) return 'drizzle'
  if (code <= 65) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'showers'
  if (code <= 86) return 'snowShowers'
  if (code >= 95) return 'thunderstorm'
  return 'unknown'
}
