import { v } from 'convex/values'
import { action } from './_generated/server'

// Open-Meteo WMO Weather interpretation codes (WW)
// https://open-meteo.com/en/docs
const weatherCodes: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Moderate drizzle', icon: '🌦️' },
  55: { label: 'Dense drizzle', icon: '🌦️' },
  61: { label: 'Slight rain', icon: '🌧️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Slight snow fall', icon: '❄️' },
  73: { label: 'Moderate snow fall', icon: '❄️' },
  75: { label: 'Heavy snow fall', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Slight rain showers', icon: '🌦️' },
  81: { label: 'Moderate rain showers', icon: '🌦️' },
  82: { label: 'Violent rain showers', icon: '🌧️' },
  85: { label: 'Slight snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { label: 'Thunderstorm with heavy hail', icon: '⛈️' },
}

export const getWeather = action({
  args: {
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const { lat, lng } = args

    // Fetch current weather and 7 days of hourly forecast
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,weathercode,precipitation_probability&forecast_days=7&timezone=auto`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch weather: ${response.statusText}`)
    }

    const data = await response.json()

    const current = {
      temp: data.current_weather.temperature,
      code: data.current_weather.weathercode,
      condition:
        weatherCodes[data.current_weather.weathercode]?.label || 'Unknown',
      icon: weatherCodes[data.current_weather.weathercode]?.icon || '❓',
      isHotPavement: data.current_weather.temperature > 25,
    }

    // Map hourly data
    const forecast = data.hourly.time.map((time: string, i: number) => ({
      time: new Date(time).getTime(),
      temp: data.hourly.temperature_2m[i],
      code: data.hourly.weathercode[i],
      condition: weatherCodes[data.hourly.weathercode[i]]?.label || 'Unknown',
      icon: weatherCodes[data.hourly.weathercode[i]]?.icon || '❓',
      precip: data.hourly.precipitation_probability[i],
    }))

    return {
      current,
      forecast,
      location: { lat, lng },
      updatedAt: Date.now(),
    }
  },
})
