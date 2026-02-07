import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthUserId } from './authHelpers'

// -- Mutations --

export const createSpot = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    description: v.optional(v.string()),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const spotId = await ctx.db.insert('spots', {
      ...args,
      createdBy: userId,
      isVerified: false, // Default to unverified
    })

    return spotId
  },
})

export const addReview = mutation({
  args: {
    spotId: v.id('spots'),
    rating: v.number(),
    text: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    if (args.rating < 1 || args.rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    await ctx.db.insert('reviews', {
      ...args,
      userId,
      createdAt: Date.now(),
    })
  },
})

// -- Queries --

export const listSpots = query({
  args: {},
  handler: async (ctx) => {
    // Return all spots for now.
    // In a real app with many spots, we'd use geospatial indexing or bounding box filtering.
    // Convex doesn't have native geo-spatial queries yet, so we fetch all (assuming small scale)
    // or we would filter in-memory if the dataset was medium-sized.
    return await ctx.db.query('spots').collect()
  },
})

export const getSpotDetails = query({
  args: { spotId: v.id('spots') },
  handler: async (ctx, args) => {
    const spot = await ctx.db.get(args.spotId)
    if (!spot) return null

    // Get reviews
    const reviews = await ctx.db
      .query('reviews')
      .withIndex('by_spot', (q) => q.eq('spotId', args.spotId))
      .order('desc')
      .take(20)

    // Enrich reviews with user info
    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId)
        return {
          ...review,
          user: user
            ? { name: user.name, image: user.image }
            : { name: 'Unknown', image: undefined },
        }
      }),
    )

    return {
      ...spot,
      reviews: reviewsWithUser,
    }
  },
})
