import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthUserId } from './authHelpers'

/**
 * Generate a pre-signed URL for uploading a file to Convex storage.
 * Returns a URL that can be used with a POST request to upload the file.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }
    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * Get the public URL for a file stored in Convex storage.
 * Returns null if the storage ID is invalid.
 */
export const getUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId)
  },
})

/**
 * Delete a file from Convex storage.
 * Only authenticated users can delete files.
 */
export const deleteFile = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }
    await ctx.storage.delete(args.storageId)
  },
})
