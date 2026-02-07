import { useMutation, useQuery } from 'convex/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

const ROUTE_POINT_INTERVAL = 10000 // Add route point every 10 seconds

interface WalkTrackerState {
  status: 'idle' | 'tracking' | 'paused'
  duration: number // in seconds
  distance: number // in meters
}

export function useWalkTracker() {
  const [localState, setLocalState] = useState<WalkTrackerState>({
    status: 'idle',
    duration: 0,
    distance: 0,
  })

  // Convex queries and mutations
  const activeWalk = useQuery(api.walks.getActiveWalk)
  const routePoints = useQuery(
    api.walks.getRoutePoints,
    activeWalk ? { walkId: activeWalk._id } : 'skip',
  )
  const startWalkMutation = useMutation(api.walks.startWalk)
  const pauseWalkMutation = useMutation(api.walks.pauseWalk)
  const resumeWalkMutation = useMutation(api.walks.resumeWalk)
  const endWalkMutation = useMutation(api.walks.endWalk)
  const addRoutePointMutation = useMutation(api.walks.addRoutePoint)

  // Refs for intervals and tracking
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const routePointIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pauseStartRef = useRef<number | null>(null)
  const watchIdRef = useRef<number | null>(null)

  // Sync state with backend
  useEffect(() => {
    if (activeWalk === undefined) return // Still loading

    if (activeWalk === null) {
      setLocalState({ status: 'idle', duration: 0, distance: 0 })
      return
    }

    // Calculate current duration
    const now = Date.now()
    const elapsed = now - activeWalk.startedAt - activeWalk.pausedDuration
    const durationSeconds = Math.floor(elapsed / 1000)

    setLocalState({
      status: activeWalk.status === 'active' ? 'tracking' : 'paused',
      duration: Math.max(0, durationSeconds),
      distance: activeWalk.distanceMeters,
    })

    if (activeWalk.status === 'paused' && !pauseStartRef.current) {
      pauseStartRef.current = now
    }
  }, [activeWalk])

  // Duration timer
  useEffect(() => {
    if (localState.status === 'tracking') {
      durationIntervalRef.current = setInterval(() => {
        setLocalState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }))
      }, 1000)
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [localState.status])

  // GPS tracking and route point recording
  useEffect(() => {
    if (localState.status !== 'tracking' || !activeWalk) {
      // Stop watching position
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (routePointIntervalRef.current) {
        clearInterval(routePointIntervalRef.current)
        routePointIntervalRef.current = null
      }
      return
    }

    if (!('geolocation' in navigator)) {
      console.error('Geolocation not supported')
      return
    }

    let lastRecordedTime = 0

    const recordPoint = (position: GeolocationPosition) => {
      const now = Date.now()
      if (now - lastRecordedTime < ROUTE_POINT_INTERVAL) return

      lastRecordedTime = now
      addRoutePointMutation({
        walkId: activeWalk._id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }).catch(console.error)
    }

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      recordPoint,
      (error) => console.error('GPS error:', error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      },
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [localState.status, activeWalk, addRoutePointMutation])

  // Start walk
  const startWalk = useCallback(
    async (dogIds: Id<'dogs'>[]) => {
      try {
        await startWalkMutation({ dogIds })
        pauseStartRef.current = null
      } catch (error) {
        console.error('Failed to start walk:', error)
        throw error
      }
    },
    [startWalkMutation],
  )

  // Pause walk
  const pauseWalk = useCallback(async () => {
    if (!activeWalk) return

    try {
      await pauseWalkMutation({ walkId: activeWalk._id })
      pauseStartRef.current = Date.now()
    } catch (error) {
      console.error('Failed to pause walk:', error)
      throw error
    }
  }, [activeWalk, pauseWalkMutation])

  // Resume walk
  const resumeWalk = useCallback(async () => {
    if (!activeWalk || !pauseStartRef.current) return

    try {
      const pausedMs = Date.now() - pauseStartRef.current
      await resumeWalkMutation({ walkId: activeWalk._id, pausedMs })
      pauseStartRef.current = null
    } catch (error) {
      console.error('Failed to resume walk:', error)
      throw error
    }
  }, [activeWalk, resumeWalkMutation])

  // End walk
  const endWalk = useCallback(async () => {
    if (!activeWalk) return

    try {
      const result = await endWalkMutation({ walkId: activeWalk._id })
      pauseStartRef.current = null
      return result
    } catch (error) {
      console.error('Failed to end walk:', error)
      throw error
    }
  }, [activeWalk, endWalkMutation])

  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`
    }
    return `${Math.round(meters)} m`
  }

  return {
    status: localState.status,
    duration: localState.duration,
    distance: localState.distance,
    formattedDuration: formatDuration(localState.duration),
    formattedDistance: formatDistance(localState.distance),
    walkId: activeWalk?._id ?? null,
    dogs: activeWalk?.dogs ?? [],
    routePoints: routePoints ?? [],
    startWalk,
    pauseWalk,
    resumeWalk,
    endWalk,
    isLoading: activeWalk === undefined,
  }
}
