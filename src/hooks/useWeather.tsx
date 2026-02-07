import { useEffect, useState } from 'react'
import { fetchWeather } from '../lib/weather'
import type { WeatherData } from '../lib/weather'

const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
const CACHE_KEY_PREFIX = 'weather_cache_'

interface CacheEntry {
  data: WeatherData
  timestamp: number
}

export function useWeather(lat?: number | null, lng?: number | null) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (
      lat === null ||
      lat === undefined ||
      lng === null ||
      lng === undefined
    ) {
      return
    }

    const fetchWeatherData = async () => {
      setLoading(true)
      setError(null)

      // Check cache (simple implementation)
      // Round coordinates to ~1km (2 decimal places) to improve cache hits
      const cacheKey = `${CACHE_KEY_PREFIX}${lat.toFixed(2)}_${lng.toFixed(2)}`

      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached)
          if (Date.now() - entry.timestamp < CACHE_DURATION) {
            setData(entry.data)
            setLoading(false)
            return
          }
        }

        // Fetch new data
        const result = await fetchWeather(lat, lng)

        // Update state
        setData(result)

        // Update cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          }),
        )
      } catch (err) {
        console.error('Weather hook error:', err)
        setError('Failed to load weather data')
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [lat, lng])

  return { data, loading, error }
}
