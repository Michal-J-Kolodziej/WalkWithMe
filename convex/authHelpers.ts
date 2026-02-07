import { Id } from './_generated/dataModel'
import { MutationCtx, QueryCtx } from './_generated/server'

/**
 * Get the current authenticated user's ID from WorkOS AuthKit identity.
 * This replaces the getAuthUserId from @convex-dev/auth.
 * 
 * Returns the user ID if the user exists in the database and is authenticated,
 * otherwise returns null.
 */
export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<Id<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity || !identity.email) {
    return null
  }

  const user = await ctx.db
    .query('users')
    .withIndex('email', (q) => q.eq('email', identity.email as string))
    .first()

  return user?._id ?? null
}

/**
 * Get or create a user from the WorkOS AuthKit identity.
 * Creates a new user record on first OAuth login.
 * This should only be used in mutations.
 */
export async function getOrCreateUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity || !identity.email) {
    return null
  }

  // Find existing user by email
  let user = await ctx.db
    .query('users')
    .withIndex('email', (q) => q.eq('email', identity.email as string))
    .first()

  if (!user) {
    // Create user on first login
    const userId = await ctx.db.insert('users', {
      email: identity.email as string,
      name: (identity.name as string) || identity.email?.split('@')[0] || 'User',
      image: (identity.pictureUrl as string | undefined) || (identity.picture as string | undefined),
    })
    user = await ctx.db.get(userId)
  }

  return user
}
