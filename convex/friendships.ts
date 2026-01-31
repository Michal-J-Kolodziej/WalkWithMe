import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List all friends for the current user
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get friendships where user is user1
    const friendshipsAsUser1 = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .collect();

    // Get friendships where user is user2
    const friendshipsAsUser2 = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .collect();

    // Combine and get friend user IDs
    const allFriendships = [...friendshipsAsUser1, ...friendshipsAsUser2];
    
    // Fetch friend details
    const friendsWithDetails = await Promise.all(
      allFriendships.map(async (friendship) => {
        const friendId = friendship.user1Id === userId 
          ? friendship.user2Id 
          : friendship.user1Id;
        
        const friend = await ctx.db.get(friendId);
        
        // Get friend's dogs count
        const dogs = await ctx.db
          .query("dogs")
          .withIndex("by_owner", (q) => q.eq("ownerId", friendId))
          .collect();

        return {
          friendshipId: friendship._id,
          friendSince: friendship.createdAt,
          friend: friend ? {
            _id: friend._id,
            name: friend.name,
            image: friend.image,
            bio: friend.bio,
            location: friend.location,
            email: friend.email,
          } : null,
          dogsCount: dogs.length,
        };
      })
    );

    // Filter out null friends (deleted users) and sort by friendship date
    return friendsWithDetails
      .filter((f) => f.friend !== null)
      .sort((a, b) => b.friendSince - a.friendSince);
  },
});

/**
 * Check if two users are friends
 */
export const isFriend = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return false;
    }

    const [user1Id, user2Id] = currentUserId < args.userId
      ? [currentUserId, args.userId]
      : [args.userId, currentUserId];

    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", user1Id))
      .filter((q) => q.eq(q.field("user2Id"), user2Id))
      .first();

    return friendship !== null;
  },
});

/**
 * Remove a friend (unfriend)
 */
export const remove = mutation({
  args: {
    friendshipId: v.id("friendships"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new Error("Friendship not found");
    }

    // Verify user is part of this friendship
    if (friendship.user1Id !== userId && friendship.user2Id !== userId) {
      throw new Error("Not authorized to remove this friendship");
    }

    // Delete the friendship
    await ctx.db.delete(args.friendshipId);
  },
});

/**
 * Get friend count for current user
 */
export const count = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    // Count friendships where user is user1
    const friendshipsAsUser1 = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .collect();

    // Count friendships where user is user2
    const friendshipsAsUser2 = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .collect();

    return friendshipsAsUser1.length + friendshipsAsUser2.length;
  },
});
