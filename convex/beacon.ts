import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Toggle the beacon status
export const toggleBeacon = mutation({
  args: {
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Unauthorized')
    }

    const user = await ctx.db.get(userId)
    if (!user) throw new Error('User not found')

    if (args.isActive) {
      // Turning ON
      await ctx.db.patch(userId, {
        beacon: {
          isActive: true,
          startedAt: Date.now(),
          lastHeartbeat: Date.now(),
          privacy: user.beacon?.privacy || 'friends', // Keep existing or default
        },
        isLocationEnabled: true, // Implicitly enable location
      })
    } else {
      // Turning OFF
      await ctx.db.patch(userId, {
        beacon: {
          isActive: false,
          startedAt: user.beacon?.startedAt || Date.now(),
          lastHeartbeat: user.beacon?.lastHeartbeat,
          privacy: user.beacon?.privacy || 'friends',
        },
        isLocationEnabled: false, // Also disable location tracking
      })
    }
  },
})

// Send a heartbeat to keep the beacon active
export const sendHeartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return

    const user = await ctx.db.get(userId)
    if (!user || !user.beacon?.isActive) return

    await ctx.db.patch(userId, {
      beacon: {
        ...user.beacon,
        lastHeartbeat: Date.now(),
      },
    })
  },
})

// Update beacon privacy settings
export const setBeaconPrivacy = mutation({
  args: {
    privacy: v.string(), // 'friends' | 'public' | 'none'
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const user = await ctx.db.get(userId)
    if (!user) throw new Error('User not found')

    await ctx.db.patch(userId, {
      beacon: {
        isActive: user.beacon?.isActive || false,
        startedAt: user.beacon?.startedAt || 0,
        lastHeartbeat: user.beacon?.lastHeartbeat,
        privacy: args.privacy,
      },
    })
  },
})

// List active beacons from friends
export const listActiveBeacons = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    // Get all friendships
    const friendships1 = await ctx.db
      .query('friendships')
      .withIndex('by_user1', (q) => q.eq('user1Id', userId))
      .collect()
    const friendships2 = await ctx.db
      .query('friendships')
      .withIndex('by_user2', (q) => q.eq('user2Id', userId))
      .collect()

    const friendIds = [
      ...friendships1.map((f) => f.user2Id),
      ...friendships2.map((f) => f.user1Id),
    ]

    if (friendIds.length === 0) return []

    // Fetch all friends
    const friends = await Promise.all(friendIds.map((id) => ctx.db.get(id)))

    const now = Date.now()
    const TEN_MINUTES = 10 * 60 * 1000

    return friends
      .filter((f) => f !== null)
      .filter((f) => {
        const b = f.beacon
        if (!b || !b.isActive) return false

        // Check staleness
        const lastHeartbeat = b.lastHeartbeat || b.startedAt
        if (now - lastHeartbeat > TEN_MINUTES) return false

        // Check privacy
        if (b.privacy === 'none') return false
        
        return true
      })
      .map((f) => ({
        _id: f._id,
        name: f.name,
        image: f.image,
        location: f.location,
        geo_location: f.geo_location,
        beacon: f.beacon,
      }))
  },
})
