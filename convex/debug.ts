import { mutation } from './_generated/server'

export const debugIdentity = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    return {
      identity,
      isAuthenticated: identity !== null,
    }
  },
})
