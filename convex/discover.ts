import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * List users for discovery (excludes current user and existing friends)
 */
export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit ?? 20;

    // Get all users with complete profiles
    const allUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isProfileComplete"), true))
      .order("desc")
      .collect();

    // Get current user's friendships
    const friendshipsAsUser1 = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .collect();

    const friendshipsAsUser2 = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .collect();

    // Create set of friend IDs
    const friendIds = new Set<string>();
    for (const f of friendshipsAsUser1) {
      friendIds.add(f.user2Id);
    }
    for (const f of friendshipsAsUser2) {
      friendIds.add(f.user1Id);
    }

    // Get pending friend requests (sent and received) to show status
    const sentRequests = await ctx.db
      .query("friendRequests")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", userId).eq("status", "pending"))
      .collect();

    const receivedRequests = await ctx.db
      .query("friendRequests")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId).eq("status", "pending"))
      .collect();

    // Create maps for quick lookup
    const sentRequestMap = new Map<string, string>();
    for (const r of sentRequests) {
      sentRequestMap.set(r.toUserId, r._id);
    }

    const receivedRequestMap = new Map<string, string>();
    for (const r of receivedRequests) {
      receivedRequestMap.set(r.fromUserId, r._id);
    }

    // Filter and enrich users
    const discoverableUsers = [];

    for (const user of allUsers) {
      // Skip current user
      if (user._id === userId) continue;

      // Skip friends
      if (friendIds.has(user._id)) continue;

      // Determine relationship status
      let status: "none" | "pending_sent" | "pending_received" = "none";
      let requestId: string | undefined;

      if (sentRequestMap.has(user._id)) {
        status = "pending_sent";
        requestId = sentRequestMap.get(user._id);
      } else if (receivedRequestMap.has(user._id)) {
        status = "pending_received";
        requestId = receivedRequestMap.get(user._id);
      }

      // Get user's dogs
      const dogs = await ctx.db
        .query("dogs")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect();

      discoverableUsers.push({
        _id: user._id,
        name: user.name,
        image: user.image,
        bio: user.bio,
        location: user.location,
        geo_location: user.isLocationEnabled ? user.geo_location : undefined,
        status,
        requestId,
        dogs: dogs.map((d) => ({
          _id: d._id,
          name: d.name,
          breed: d.breed,
          imageUrl: d.imageUrl,
        })),
      });

      if (discoverableUsers.length >= limit) break;
    }

    return discoverableUsers;
  },
});

/**
 * Search users by name or location
 */
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit ?? 20;
    const searchLower = args.searchTerm.toLowerCase().trim();

    if (!searchLower) {
      return [];
    }

    // Get all users with complete profiles
    const allUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isProfileComplete"), true))
      .collect();

    // Get current user's friendships
    const friendshipsAsUser1 = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .collect();

    const friendshipsAsUser2 = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .collect();

    const friendIds = new Set<string>();
    for (const f of friendshipsAsUser1) {
      friendIds.add(f.user2Id);
    }
    for (const f of friendshipsAsUser2) {
      friendIds.add(f.user1Id);
    }

    // Get pending friend requests
    const sentRequests = await ctx.db
      .query("friendRequests")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", userId).eq("status", "pending"))
      .collect();

    const receivedRequests = await ctx.db
      .query("friendRequests")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId).eq("status", "pending"))
      .collect();

    const sentRequestMap = new Map<string, string>();
    for (const r of sentRequests) {
      sentRequestMap.set(r.toUserId, r._id);
    }

    const receivedRequestMap = new Map<string, string>();
    for (const r of receivedRequests) {
      receivedRequestMap.set(r.fromUserId, r._id);
    }

    // Filter, search, and enrich users
    const matchingUsers = [];

    for (const user of allUsers) {
      if (user._id === userId) continue;
      if (friendIds.has(user._id)) continue;

      // Check if name or location matches search
      const nameMatch = user.name?.toLowerCase().includes(searchLower);
      const locationMatch = user.location?.toLowerCase().includes(searchLower);

      if (!nameMatch && !locationMatch) continue;

      let status: "none" | "pending_sent" | "pending_received" = "none";
      let requestId: string | undefined;

      if (sentRequestMap.has(user._id)) {
        status = "pending_sent";
        requestId = sentRequestMap.get(user._id);
      } else if (receivedRequestMap.has(user._id)) {
        status = "pending_received";
        requestId = receivedRequestMap.get(user._id);
      }

      const dogs = await ctx.db
        .query("dogs")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect();

      matchingUsers.push({
        _id: user._id,
        name: user.name,
        image: user.image,
        bio: user.bio,
        location: user.location,
        geo_location: user.isLocationEnabled ? user.geo_location : undefined,
        status,
        requestId,
        dogs: dogs.map((d) => ({
          _id: d._id,
          name: d.name,
          breed: d.breed,
          imageUrl: d.imageUrl,
        })),
      });

      if (matchingUsers.length >= limit) break;
    }

    return matchingUsers;
  },
});

/**
 * Get detailed user profile with all dogs
 */
export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }

    const user = await ctx.db.get(args.userId);
    if (!user || !user.isProfileComplete) {
      return null;
    }

    // Get all dogs
    const dogs = await ctx.db
      .query("dogs")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();

    // Check friendship status
    const [user1Id, user2Id] = currentUserId < args.userId
      ? [currentUserId, args.userId]
      : [args.userId, currentUserId];

    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", user1Id))
      .filter((q) => q.eq(q.field("user2Id"), user2Id))
      .first();

    // Check for pending requests
    const sentRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_users", (q) => q.eq("fromUserId", currentUserId).eq("toUserId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    const receivedRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_users", (q) => q.eq("fromUserId", args.userId).eq("toUserId", currentUserId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    let status: "friends" | "pending_sent" | "pending_received" | "none" = "none";
    let requestId: string | undefined;

    if (friendship) {
      status = "friends";
    } else if (sentRequest) {
      status = "pending_sent";
      requestId = sentRequest._id;
    } else if (receivedRequest) {
      status = "pending_received";
      requestId = receivedRequest._id;
    }

    return {
      _id: user._id,
      name: user.name,
      image: user.image,
      bio: user.bio,
      location: user.location,
      geo_location: user.isLocationEnabled ? user.geo_location : undefined,
      email: user.email,
      status,
      requestId,
      dogs: dogs.map((d) => ({
        _id: d._id,
        name: d.name,
        breed: d.breed,
        age: d.age,
        bio: d.bio,
        imageUrl: d.imageUrl,
      })),
    };
  },
});
