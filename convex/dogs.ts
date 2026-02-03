import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Get all dogs for the currently authenticated user
 */
export const listByOwner = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }
    return await ctx.db
      .query('dogs')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .order('desc')
      .collect()
  },
})

/**
 * Get a single dog by ID
 */
export const get = query({
  args: { id: v.id('dogs') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }
    const dog = await ctx.db.get(args.id)
    // Only return if the user owns this dog
    if (!dog || dog.ownerId !== userId) {
      return null
    }
    return dog
  },
})

/**
 * Create a new dog profile
 */
export const create = mutation({
  args: {
    name: v.string(),
    breed: v.string(),
    age: v.number(),
    bio: v.string(),
    imageUrl: v.string(),
    imageUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const dogId = await ctx.db.insert('dogs', {
      ownerId: userId,
      name: args.name,
      breed: args.breed,
      age: args.age,
      bio: args.bio,
      imageUrl: args.imageUrl,
      imageUrls: args.imageUrls || [],
      createdAt: Date.now(),
    })

    return dogId
  },
})

/**
 * Update an existing dog profile
 */
export const update = mutation({
  args: {
    id: v.id('dogs'),
    name: v.optional(v.string()),
    breed: v.optional(v.string()),
    age: v.optional(v.number()),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const dog = await ctx.db.get(args.id)
    if (!dog || dog.ownerId !== userId) {
      throw new Error('Dog not found or not authorized')
    }

    const updates: Partial<{
      name: string
      breed: string
      age: number
      bio: string
      imageUrl: string
      imageUrls: Array<string>
    }> = {}

    if (args.name !== undefined) updates.name = args.name
    if (args.breed !== undefined) updates.breed = args.breed
    if (args.age !== undefined) updates.age = args.age
    if (args.bio !== undefined) updates.bio = args.bio
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl
    if (args.imageUrls !== undefined) updates.imageUrls = args.imageUrls

    await ctx.db.patch(args.id, updates)
  },
})

/**
 * Delete a dog profile
 */
export const remove = mutation({
  args: { id: v.id('dogs') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const dog = await ctx.db.get(args.id)
    if (!dog || dog.ownerId !== userId) {
      throw new Error('Dog not found or not authorized')
    }

    await ctx.db.delete(args.id)
  },
})
