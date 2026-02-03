import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
} from 'lucide-react'

/**
 * Open-Meteo WMO Weather interpretation codes
 * https://open-meteo.com/en/docs
 */
export const getWeatherIcon = (code: number) => {
  // Clear / Sunny
  if (code === 0 || code === 1) return Sun

  // Cloudy
  if (code === 2 || code === 3) return Cloud

  // Fog
  if (code === 45 || code === 48) return CloudFog

  // Drizzle / Rain
  if (
    (code >= 51 && code <= 57) ||
    (code >= 61 && code <= 67) ||
    (code >= 80 && code <= 82)
  )
    return CloudRain

  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return CloudSnow

  // Thunderstorm
  if (code >= 95 && code <= 99) return CloudLightning

  return Cloud
}

export const getWeatherDescription = (code: number) => {
  // Map codes to translation keys
  if (code === 0) return 'weather.clearSky'
  if (code === 1 || code === 2 || code === 3) return 'weather.partlyCloudy'
  if (code === 45 || code === 48) return 'weather.fog'
  if (code >= 51 && code <= 57) return 'weather.drizzle'
  if (code >= 61 && code <= 67) return 'weather.rain'
  if (code >= 71 && code <= 77) return 'weather.snow'
  if (code >= 80 && code <= 82) return 'weather.showers'
  if (code >= 85 && code <= 86) return 'weather.snowShowers'
  if (code >= 95 && code <= 99) return 'weather.thunderstorm'

  return 'weather.unknown'
}

export interface WeatherData {
  current_weather?: {
    temperature: number
    windspeed: number
    winddirection: number
    weathercode: number
    time: string
  }
  hourly?: {
    time: Array<string>
    temperature_2m: Array<number>
    precipitation_probability: Array<number>
    weathercode: Array<number>
  }
}

export async function fetchWeather(
  lat: number,
  lng: number,
): Promise<WeatherData> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      current_weather: 'true',
      hourly: 'temperature_2m,precipitation_probability,weathercode',
      timezone: 'auto',
      forecast_days: '2',
    })

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch weather:', error)
    throw error
  }
}

/**
 * Get forecast for a specific time from hourly data
 */
export function getForecastForTime(data: WeatherData, timestamp: number) {
  if (!data.hourly) return null

  // Convert timestamp to ISO string prefix (YYYY-MM-DDTHH) to match API
  // Open-Meteo returns hourly data
  const date = new Date(timestamp)
  // Round to nearest hour
  date.setMinutes(date.getMinutes() + 30)
  date.setMinutes(0, 0, 0)

  const isoTime = date.toISOString().slice(0, 13) // Match YYYY-MM-DDTHH

  // Find index in hourly times
  // Note: API returns time in local time if timezone=auto, but iso string is UTC
  // We need to compare carefully. Open-Meteo returns ISO8601 strings.
  // Actually simplest is to find closest time.

  // Let's use the API time strings directly
  let closestIndex = 0
  let minDiff = Infinity

  data.hourly.time.forEach((t, i) => {
    const time = new Date(t).getTime()
    const diff = Math.abs(time - timestamp)
    if (diff < minDiff) {
      minDiff = diff
      closestIndex = i
    }
  })

  // If difference is more than 2 hours, data might be stale or out of range
  if (minDiff > 2 * 60 * 60 * 1000) return null

  return {
    temperature: data.hourly.temperature_2m[closestIndex],
    precipitation_probability:
      data.hourly.precipitation_probability[closestIndex],
    weathercode: data.hourly.weathercode[closestIndex],
    time: data.hourly.time[closestIndex],
  }
}
