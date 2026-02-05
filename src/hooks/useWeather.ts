import { useAction } from 'convex/react'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'

export interface WeatherData {
  current: {
    temp: number
    code: number
    condition: string
    icon: string
    isHotPavement: boolean
  }
  forecast: Array<{
    time: number
    temp: number
    code: number
    condition: string
    icon: string
    precip: number
  }>
  location: {
    lat: number
    lng: number
  }
  updatedAt: number
}

export function useWeather(lat: number | null, lng: number | null) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getWeatherAction = useAction(api.weather.getWeather)

  const fetchWeather = useCallback(async () => {
    if (lat === null || lng === null) return

    setLoading(true)
    setError(null)

    try {
      const result = await getWeatherAction({ lat, lng })
      setData(result)
    } catch (err) {
      console.error('Failed to fetch weather:', err)
      setError('Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }, [lat, lng, getWeatherAction])

  useEffect(() => {
    if (lat !== null && lng !== null) {
      fetchWeather()
    }
  }, [lat, lng, fetchWeather])

  return { data, loading, error, refetch: fetchWeather }
}
