import { useMutation, useQuery } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../convex/_generated/api'

interface LocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

const UPDATE_INTERVAL = 60000 // Update backend at most every 60 seconds
const DISTANCE_THRESHOLD = 50 // Update if moved > 50 meters (optional optimization for future)

export function useLocationTracker() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  const updateLocationMutation = useMutation(api.users.updateLocation)
  const user = useQuery(api.users.current)

  const lastUpdateRef = useRef<number>(0)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    // If user is not loaded or location tracking is disabled, stop watching
    if (user === undefined) return // Loading

    if (!user || !user.isLocationEnabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setState((prev) => ({ ...prev, loading: false, error: null }))
      return
    }

    if (!('geolocation' in navigator)) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation not supported',
        loading: false,
      }))
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords

      setState({
        latitude,
        longitude,
        error: null,
        loading: false,
      })

      const now = Date.now()
      // Simple throttling: Only update backend if enough time has passed
      if (now - lastUpdateRef.current > UPDATE_INTERVAL) {
        updateLocationMutation({ latitude, longitude })
          .then(() => {
            lastUpdateRef.current = now
          })
          .catch((err) => {
            console.error('Failed to update location:', err)
          })
      }
    }

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown location error'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location unavailable'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out'
          break
      }
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
    }

    // Start watching
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      },
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [user?.isLocationEnabled, updateLocationMutation]) // Re-run if enabled status changes

  return state
}
