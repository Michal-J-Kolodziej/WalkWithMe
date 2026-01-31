import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Send a friend request to another user
 */
export const send = mutation({
  args: {
    toUserId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Cannot send request to self
    if (userId === args.toUserId) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if target user exists
    const targetUser = await ctx.db.get(args.toUserId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Check if already friends
    const [user1Id, user2Id] = userId < args.toUserId 
      ? [userId, args.toUserId] 
      : [args.toUserId, userId];
    
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", user1Id))
      .filter((q) => q.eq(q.field("user2Id"), user2Id))
      .first();

    if (existingFriendship) {
      throw new Error("Already friends with this user");
    }

    // Check for existing pending request (either direction)
    const existingRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_users", (q) => q.eq("fromUserId", userId).eq("toUserId", args.toUserId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("Friend request already sent");
    }

    // Check if they already sent us a request
    const incomingRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_users", (q) => q.eq("fromUserId", args.toUserId).eq("toUserId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (incomingRequest) {
      throw new Error("This user already sent you a friend request. Check your inbox!");
    }

    // Create the friend request
    const requestId = await ctx.db.insert("friendRequests", {
      fromUserId: userId,
      toUserId: args.toUserId,
      message: args.message,
      status: "pending",
      createdAt: Date.now(),
    });

    return requestId;
  },
});

/**
 * Accept a friend request
 */
export const accept = mutation({
  args: {
    requestId: v.id("friendRequests"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Friend request not found");
    }

    // Only the recipient can accept
    if (request.toUserId !== userId) {
      throw new Error("Not authorized to accept this request");
    }

    if (request.status !== "pending") {
      throw new Error("This request has already been responded to");
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    // Create friendship (ordered user IDs)
    const [user1Id, user2Id] = request.fromUserId < request.toUserId
      ? [request.fromUserId, request.toUserId]
      : [request.toUserId, request.fromUserId];

    await ctx.db.insert("friendships", {
      user1Id,
      user2Id,
      createdAt: Date.now(),
      requestId: args.requestId,
    });
  },
});

/**
 * Reject a friend request
 */
export const reject = mutation({
  args: {
    requestId: v.id("friendRequests"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Friend request not found");
    }

    // Only the recipient can reject
    if (request.toUserId !== userId) {
      throw new Error("Not authorized to reject this request");
    }

    if (request.status !== "pending") {
      throw new Error("This request has already been responded to");
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      rejectionReason: args.reason,
      respondedAt: Date.now(),
    });
  },
});

/**
 * Cancel a sent friend request
 */
export const cancel = mutation({
  args: {
    requestId: v.id("friendRequests"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Friend request not found");
    }

    // Only the sender can cancel
    if (request.fromUserId !== userId) {
      throw new Error("Not authorized to cancel this request");
    }

    if (request.status !== "pending") {
      throw new Error("Can only cancel pending requests");
    }

    // Delete the request
    await ctx.db.delete(args.requestId);
  },
});

/**
 * List all pending friend requests received by current user
 */
export const listReceived = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId).eq("status", "pending"))
      .order("desc")
      .collect();

    // Fetch sender details for each request
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const fromUser = await ctx.db.get(request.fromUserId);
        return {
          ...request,
          fromUser: fromUser ? {
            _id: fromUser._id,
            name: fromUser.name,
            image: fromUser.image,
            bio: fromUser.bio,
            location: fromUser.location,
          } : null,
        };
      })
    );

    return requestsWithUsers;
  },
});

/**
 * List all pending friend requests sent by current user
 */
export const listSent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_from_user", (q) => q.eq("fromUserId", userId).eq("status", "pending"))
      .order("desc")
      .collect();

    // Fetch recipient details for each request
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const toUser = await ctx.db.get(request.toUserId);
        return {
          ...request,
          toUser: toUser ? {
            _id: toUser._id,
            name: toUser.name,
            image: toUser.image,
            bio: toUser.bio,
            location: toUser.location,
          } : null,
        };
      })
    );

    return requestsWithUsers;
  },
});

/**
 * Get the request status between current user and another user
 */
export const getRequestStatus = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }

    // Check if already friends
    const [user1Id, user2Id] = currentUserId < args.userId
      ? [currentUserId, args.userId]
      : [args.userId, currentUserId];

    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", user1Id))
      .filter((q) => q.eq(q.field("user2Id"), user2Id))
      .first();

    if (friendship) {
      return { status: "friends" as const, friendshipId: friendship._id };
    }

    // Check for pending request from current user
    const sentRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_users", (q) => q.eq("fromUserId", currentUserId).eq("toUserId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (sentRequest) {
      return { status: "pending_sent" as const, requestId: sentRequest._id };
    }

    // Check for pending request from the other user
    const receivedRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_users", (q) => q.eq("fromUserId", args.userId).eq("toUserId", currentUserId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (receivedRequest) {
      return { status: "pending_received" as const, requestId: receivedRequest._id };
    }

    return { status: "none" as const };
  },
});

/**
 * Count pending received friend requests
 */
export const countPending = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_to_user", (q) => q.eq("toUserId", userId).eq("status", "pending"))
      .collect();

    return requests.length;
  },
});
