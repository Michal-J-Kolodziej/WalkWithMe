import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Helper to calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Start a new walk
 */
export const startWalk = mutation({
  args: {
    dogIds: v.array(v.id('dogs')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    // Check if user already has an active walk
    const existingActive = await ctx.db
      .query('walks')
      .withIndex('by_user_status', (q) =>
        q.eq('userId', userId).eq('status', 'active'),
      )
      .first()

    if (existingActive) {
      throw new Error('You already have an active walk')
    }

    // Check for paused walk
    const existingPaused = await ctx.db
      .query('walks')
      .withIndex('by_user_status', (q) =>
        q.eq('userId', userId).eq('status', 'paused'),
      )
      .first()

    if (existingPaused) {
      throw new Error('You have a paused walk. Resume or end it first.')
    }

    const walkId = await ctx.db.insert('walks', {
      userId,
      dogIds: args.dogIds,
      status: 'active',
      startedAt: Date.now(),
      pausedDuration: 0,
      distanceMeters: 0,
    })

    return walkId
  },
})

/**
 * Pause an active walk
 */
export const pauseWalk = mutation({
  args: {
    walkId: v.id('walks'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const walk = await ctx.db.get(args.walkId)
    if (!walk) throw new Error('Walk not found')
    if (walk.userId !== userId) throw new Error('Unauthorized')
    if (walk.status !== 'active') throw new Error('Walk is not active')

    await ctx.db.patch(args.walkId, {
      status: 'paused',
    })
  },
})

/**
 * Resume a paused walk
 */
export const resumeWalk = mutation({
  args: {
    walkId: v.id('walks'),
    pausedMs: v.number(), // Time spent paused
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const walk = await ctx.db.get(args.walkId)
    if (!walk) throw new Error('Walk not found')
    if (walk.userId !== userId) throw new Error('Unauthorized')
    if (walk.status !== 'paused') throw new Error('Walk is not paused')

    await ctx.db.patch(args.walkId, {
      status: 'active',
      pausedDuration: walk.pausedDuration + args.pausedMs,
    })
  },
})

/**
 * End a walk and calculate final stats
 */
export const endWalk = mutation({
  args: {
    walkId: v.id('walks'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const walk = await ctx.db.get(args.walkId)
    if (!walk) throw new Error('Walk not found')
    if (walk.userId !== userId) throw new Error('Unauthorized')
    if (walk.status === 'completed') throw new Error('Walk already completed')

    // Get all route points to calculate total distance
    const routePoints = await ctx.db
      .query('walkRoutePoints')
      .withIndex('by_walk', (q) => q.eq('walkId', args.walkId))
      .collect()

    // Calculate total distance from route points
    let totalDistance = 0
    for (let i = 1; i < routePoints.length; i++) {
      const prev = routePoints[i - 1]
      const curr = routePoints[i]
      totalDistance += calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
      )
    }

    await ctx.db.patch(args.walkId, {
      status: 'completed',
      endedAt: Date.now(),
      distanceMeters: Math.round(totalDistance),
    })

    return { distanceMeters: Math.round(totalDistance) }
  },
})

/**
 * Add a route point to an active walk
 */
export const addRoutePoint = mutation({
  args: {
    walkId: v.id('walks'),
    latitude: v.number(),
    longitude: v.number(),
    accuracy: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const walk = await ctx.db.get(args.walkId)
    if (!walk) throw new Error('Walk not found')
    if (walk.userId !== userId) throw new Error('Unauthorized')
    if (walk.status !== 'active') return // Silently ignore if not active

    await ctx.db.insert('walkRoutePoints', {
      walkId: args.walkId,
      latitude: args.latitude,
      longitude: args.longitude,
      timestamp: Date.now(),
      accuracy: args.accuracy,
    })

    // Update running distance
    const lastPoints = await ctx.db
      .query('walkRoutePoints')
      .withIndex('by_walk', (q) => q.eq('walkId', args.walkId))
      .order('desc')
      .take(2)

    if (lastPoints.length === 2) {
      const [newest, previous] = lastPoints
      const segmentDistance = calculateDistance(
        previous.latitude,
        previous.longitude,
        newest.latitude,
        newest.longitude,
      )
      await ctx.db.patch(args.walkId, {
        distanceMeters: walk.distanceMeters + Math.round(segmentDistance),
      })
    }
  },
})

/**
 * Get user's active or paused walk
 */
export const getActiveWalk = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    // First try to find active walk
    const activeWalk = await ctx.db
      .query('walks')
      .withIndex('by_user_status', (q) =>
        q.eq('userId', userId).eq('status', 'active'),
      )
      .first()

    if (activeWalk) {
      const dogs = await Promise.all(
        activeWalk.dogIds.map((id) => ctx.db.get(id)),
      )
      return { ...activeWalk, dogs: dogs.filter(Boolean) }
    }

    // Then try paused
    const pausedWalk = await ctx.db
      .query('walks')
      .withIndex('by_user_status', (q) =>
        q.eq('userId', userId).eq('status', 'paused'),
      )
      .first()

    if (pausedWalk) {
      const dogs = await Promise.all(
        pausedWalk.dogIds.map((id) => ctx.db.get(id)),
      )
      return { ...pausedWalk, dogs: dogs.filter(Boolean) }
    }

    return null
  },
})

/**
 * List completed walks for current user
 */
export const listWalks = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const walks = await ctx.db
      .query('walks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()

    // Filter to completed and apply limit
    let completedWalks = walks.filter((w) => w.status === 'completed')
    
    if (args.limit) {
      completedWalks = completedWalks.slice(0, args.limit)
    }

    return Promise.all(
      completedWalks.map(async (walk) => {
        const dogs = await Promise.all(walk.dogIds.map((id) => ctx.db.get(id)))
        const duration = (walk.endedAt || Date.now()) - walk.startedAt - walk.pausedDuration
        return { ...walk, dogs: dogs.filter(Boolean), duration }
      }),
    )
  },
})

/**
 * Get full walk details with route points
 */
export const getWalkDetails = query({
  args: {
    walkId: v.id('walks'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const walk = await ctx.db.get(args.walkId)
    if (!walk || walk.userId !== userId) return null

    const routePoints = await ctx.db
      .query('walkRoutePoints')
      .withIndex('by_walk', (q) => q.eq('walkId', args.walkId))
      .collect()

    const dogs = await Promise.all(walk.dogIds.map((id) => ctx.db.get(id)))

    return {
      ...walk,
      dogs: dogs.filter(Boolean),
      routePoints,
    }
  },
})

/**
 * Get walk statistics for current user
 */
export const getWalkStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return {
        totalWalks: 0,
        totalDistanceMeters: 0,
        totalDurationMs: 0,
        weeklyDistanceMeters: 0,
        weeklyWalks: 0,
      }
    }

    const walks = await ctx.db
      .query('walks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    const completedWalks = walks.filter((w) => w.status === 'completed')

    const now = Date.now()
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

    let totalDistanceMeters = 0
    let totalDurationMs = 0
    let weeklyDistanceMeters = 0
    let weeklyWalks = 0

    for (const walk of completedWalks) {
      const duration =
        (walk.endedAt || now) - walk.startedAt - walk.pausedDuration
      totalDistanceMeters += walk.distanceMeters
      totalDurationMs += duration

      if (walk.startedAt >= oneWeekAgo) {
        weeklyDistanceMeters += walk.distanceMeters
        weeklyWalks++
      }
    }

    return {
      totalWalks: completedWalks.length,
      totalDistanceMeters,
      totalDurationMs,
      weeklyDistanceMeters,
      weeklyWalks,
    }
  },
})

/**
 * Get all route points for heatmap generation
 */
export const getAllRoutePoints = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    // Get all user's walks
    const walks = await ctx.db
      .query('walks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    const walkIds = walks
      .filter((w) => w.status === 'completed')
      .map((w) => w._id)

    // Get all route points for those walks
    const allPoints: Array<{ latitude: number; longitude: number }> = []

    for (const walkId of walkIds) {
      const points = await ctx.db
        .query('walkRoutePoints')
        .withIndex('by_walk', (q) => q.eq('walkId', walkId))
        .collect()
      allPoints.push(...points.map((p) => ({ latitude: p.latitude, longitude: p.longitude })))
    }

    return allPoints
  },
})

/**
 * Get recent completed walks (for dashboard)
 */
export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const limit = args.limit || 3

    const walks = await ctx.db
      .query('walks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()

    const completedWalks = walks
      .filter((w) => w.status === 'completed')
      .slice(0, limit)

    return Promise.all(
      completedWalks.map(async (walk) => {
        const dogs = await Promise.all(walk.dogIds.map((id) => ctx.db.get(id)))
        return { ...walk, dogs: dogs.filter(Boolean) }
      }),
    )
  },
})

/**
 * Delete a walk
 */
export const remove = mutation({
  args: {
    walkId: v.id('walks'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const walk = await ctx.db.get(args.walkId)
    if (!walk) throw new Error('Walk not found')
    if (walk.userId !== userId) throw new Error('Unauthorized')

    // Delete all route points first
    const routePoints = await ctx.db
      .query('walkRoutePoints')
      .withIndex('by_walk', (q) => q.eq('walkId', args.walkId))
      .collect()

    for (const point of routePoints) {
      await ctx.db.delete(point._id)
    }

    // Delete the walk
    await ctx.db.delete(args.walkId)
  },
})

/**
 * Get route points for an active walk (for live display)
 */
export const getRoutePoints = query({
  args: {
    walkId: v.id('walks'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const walk = await ctx.db.get(args.walkId)
    if (!walk || walk.userId !== userId) return []

    const points = await ctx.db
      .query('walkRoutePoints')
      .withIndex('by_walk', (q) => q.eq('walkId', args.walkId))
      .collect()

    return points.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
      timestamp: p.timestamp,
    }))
  },
})
