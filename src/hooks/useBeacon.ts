import { useMutation, useQuery } from 'convex/react'
import { useCallback, useEffect, useRef } from 'react'
import { api } from '../../convex/_generated/api'

const HEARTBEAT_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useBeacon() {
  const user = useQuery(api.users.current)
  const activeWalkers = useQuery(api.beacon.listActiveBeacons) || []
  const toggleMutation = useMutation(api.beacon.toggleBeacon)
  const sendHeartbeat = useMutation(api.beacon.sendHeartbeat)

  const isActive = user?.beacon?.isActive ?? false

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)

  // Heartbeat loop
  useEffect(() => {
    if (isActive) {
      // Send immediate heartbeat on mount/activation just in case
      sendHeartbeat()

      heartbeatRef.current = setInterval(() => {
        sendHeartbeat()
      }, HEARTBEAT_INTERVAL)
    } else {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
        heartbeatRef.current = null
      }
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [isActive, sendHeartbeat])

  const toggleBeacon = useCallback(
    async (shouldBeActive: boolean) => {
      // If turning on, check permissions first
      if (shouldBeActive) {
        if ('geolocation' in navigator) {
          try {
            await navigator.permissions
              .query({ name: 'geolocation' })
              .then((result) => {
                if (result.state === 'denied') {
                  throw new Error('Location permission denied')
                }
              })
          } catch (e) {
            // Permission query might not be supported or failed, proceed to try toggle
            // The browser will prompt if needed when useLocationTracker tries to watch
          }
        }
      }
      await toggleMutation({ isActive: shouldBeActive })
    },
    [toggleMutation],
  )

  return {
    isActive,
    toggleBeacon,
    activeWalkers,
    currentUser: user,
  }
}
