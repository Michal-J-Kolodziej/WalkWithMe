import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

export function useSpots() {
  const spots = useQuery(api.spots.listSpots)
  const createSpot = useMutation(api.spots.createSpot)
  const addReview = useMutation(api.spots.addReview)

  return {
    spots,
    createSpot,
    addReview,
    isLoading: spots === undefined,
  }
}

export function useSpotDetails(spotId: Id<'spots'> | null) {
  const details = useQuery(
    api.spots.getSpotDetails,
    spotId ? { spotId } : 'skip',
  )

  return {
    details,
    isLoading: spotId !== null && details === undefined,
  }
}
