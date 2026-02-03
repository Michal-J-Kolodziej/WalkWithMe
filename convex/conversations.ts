import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List all conversations for the current user with last message preview
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    // Get conversations where user is user1
    const conversationsAsUser1 = await ctx.db
      .query('conversations')
      .withIndex('by_user1', (q) => q.eq('user1Id', userId))
      .collect()

    // Get conversations where user is user2
    const conversationsAsUser2 = await ctx.db
      .query('conversations')
      .withIndex('by_user2', (q) => q.eq('user2Id', userId))
      .collect()

    const allConversations = [...conversationsAsUser1, ...conversationsAsUser2]

    // Fetch details for each conversation
    const conversationsWithDetails = await Promise.all(
      allConversations.map(async (conv) => {
        // Get the other user
        const friendId = conv.user1Id === userId ? conv.user2Id : conv.user1Id
        const friend = await ctx.db.get(friendId)

        // Get the last message
        const lastMessage = await ctx.db
          .query('messages')
          .withIndex('by_conversation', (q) => q.eq('conversationId', conv._id))
          .order('desc')
          .first()

        // Count unread messages (messages from friend that we haven't read)
        const unreadMessages = await ctx.db
          .query('messages')
          .withIndex('by_conversation', (q) => q.eq('conversationId', conv._id))
          .filter((q) =>
            q.and(
              q.eq(q.field('senderId'), friendId),
              q.eq(q.field('readAt'), undefined),
            ),
          )
          .collect()

        return {
          _id: conv._id,
          createdAt: conv.createdAt,
          lastMessageAt: conv.lastMessageAt,
          friend: friend
            ? {
                _id: friend._id,
                name: friend.name,
                image: friend.image,
              }
            : null,
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount: unreadMessages.length,
        }
      }),
    )

    // Sort by lastMessageAt (most recent first), then by createdAt
    return conversationsWithDetails
      .filter((c) => c.friend !== null)
      .sort((a, b) => {
        const aTime = a.lastMessageAt || a.createdAt
        const bTime = b.lastMessageAt || b.createdAt
        return bTime - aTime
      })
  },
})

/**
 * Get a specific conversation by ID
 */
export const get = query({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const conv = await ctx.db.get(args.conversationId)
    if (!conv) {
      return null
    }

    // Verify user is part of this conversation
    if (conv.user1Id !== userId && conv.user2Id !== userId) {
      return null
    }

    // Get the other user
    const friendId = conv.user1Id === userId ? conv.user2Id : conv.user1Id
    const friend = await ctx.db.get(friendId)

    return {
      _id: conv._id,
      createdAt: conv.createdAt,
      lastMessageAt: conv.lastMessageAt,
      friend: friend
        ? {
            _id: friend._id,
            name: friend.name,
            image: friend.image,
            bio: friend.bio,
            location: friend.location,
          }
        : null,
    }
  },
})

/**
 * Get or create a conversation with a friend
 */
export const getOrCreate = mutation({
  args: {
    friendId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    // Cannot chat with self
    if (userId === args.friendId) {
      throw new Error('Cannot start a conversation with yourself')
    }

    // Verify the other user exists
    const friend = await ctx.db.get(args.friendId)
    if (!friend) {
      throw new Error('User not found')
    }

    // Check if they are friends
    const [user1Id, user2Id] =
      userId < args.friendId ? [userId, args.friendId] : [args.friendId, userId]

    const friendship = await ctx.db
      .query('friendships')
      .withIndex('by_user1', (q) => q.eq('user1Id', user1Id))
      .filter((q) => q.eq(q.field('user2Id'), user2Id))
      .first()

    if (!friendship) {
      throw new Error('You can only chat with friends')
    }

    // Check for existing conversation
    const existingConv = await ctx.db
      .query('conversations')
      .withIndex('by_users', (q) =>
        q.eq('user1Id', user1Id).eq('user2Id', user2Id),
      )
      .first()

    if (existingConv) {
      return existingConv._id
    }

    // Create new conversation
    const conversationId = await ctx.db.insert('conversations', {
      user1Id,
      user2Id,
      createdAt: Date.now(),
    })

    return conversationId
  },
})

/**
 * Count total unread conversations
 */
export const countUnread = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return 0
    }

    // Get all conversations for user
    const conversationsAsUser1 = await ctx.db
      .query('conversations')
      .withIndex('by_user1', (q) => q.eq('user1Id', userId))
      .collect()

    const conversationsAsUser2 = await ctx.db
      .query('conversations')
      .withIndex('by_user2', (q) => q.eq('user2Id', userId))
      .collect()

    const allConversations = [...conversationsAsUser1, ...conversationsAsUser2]

    // Count conversations with unread messages
    let unreadConversations = 0
    for (const conv of allConversations) {
      const friendId = conv.user1Id === userId ? conv.user2Id : conv.user1Id

      // Check if there's any unread message from friend
      const unreadMessage = await ctx.db
        .query('messages')
        .withIndex('by_conversation', (q) => q.eq('conversationId', conv._id))
        .filter((q) =>
          q.and(
            q.eq(q.field('senderId'), friendId),
            q.eq(q.field('readAt'), undefined),
          ),
        )
        .first()

      if (unreadMessage) {
        unreadConversations++
      }
    }

    return unreadConversations
  },
})

/**
 * Get conversation ID for a specific friend (without creating)
 */
export const getByFriend = query({
  args: {
    friendId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const [user1Id, user2Id] =
      userId < args.friendId ? [userId, args.friendId] : [args.friendId, userId]

    const conv = await ctx.db
      .query('conversations')
      .withIndex('by_users', (q) =>
        q.eq('user1Id', user1Id).eq('user2Id', user2Id),
      )
      .first()

    return conv?._id ?? null
  },
})
