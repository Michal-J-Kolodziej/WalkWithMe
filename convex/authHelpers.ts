import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'

/**
 * Get the current authenticated user's ID from WorkOS AuthKit identity.
 * This replaces the getAuthUserId from @convex-dev/auth.
 *
 * Returns the user ID if the user exists in the database and is authenticated,
 * otherwise returns null.
 */
export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    return null
  }

  // 1. Try to find by tokenIdentifier (stable ID)
  const userByToken = await ctx.db
    .query('users')
    .withIndex('by_token', (q) =>
      q.eq('tokenIdentifier', identity.tokenIdentifier),
    )
    .first()

  if (userByToken) {
    return userByToken._id
  }

  // 2. Fallback: Find by email (legacy or if tokenIdentifier not set yet)
  if (identity.email) {
    const userByEmail = await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', identity.email as string))
      .first()

    if (userByEmail) {
      return userByEmail._id
    }
  }

  return null
}

/**
 * Get or create a user from the WorkOS AuthKit identity.
 * Creates a new user record on first OAuth login.
 * This should only be used in mutations.
 */
export async function getOrCreateUser(
  ctx: MutationCtx,
  args?: { email?: string; name?: string; image?: string },
) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('No identity found')
  }

  // Check if user exists by tokenIdentifier (Stable ID)
  const existingUserByToken = await ctx.db
    .query('users')
    .withIndex('by_token', (q) =>
      q.eq('tokenIdentifier', identity.tokenIdentifier),
    )
    .first()

  if (existingUserByToken) {
    return existingUserByToken
  }

  // Fallback: Check if user exists by email (to link accounts)
  // Use email from identity (if present) OR from client args (if trusted/necessary fallback)
  const email = identity.email || args?.email

  let existingUser = null
  if (email) {
    existingUser = await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', email))
      .first()
  }

  if (existingUser) {
    // Link the existing user to the new identity
    await ctx.db.patch(existingUser._id, {
      tokenIdentifier: identity.tokenIdentifier,
      // Update name/image if missing?
    })
    return existingUser
  }

  // Create new user
  // Name priority: 1. Identity name 2. Args name 3. Email prefix 4. 'User'
  const name =
    identity.name ||
    args?.name ||
    email?.split('@')[0] ||
    'User'

  const image =
    identity.pictureUrl ||
    (identity.picture as string | undefined) ||
    args?.image

  const userId = await ctx.db.insert('users', {
    tokenIdentifier: identity.tokenIdentifier,
    email: email, // Can be undefined or null if not provided
    name: name,
    image: image,
    // Initialize profile/location settings default?
    isLocationEnabled: false,
  })

  return await ctx.db.get(userId)
}
