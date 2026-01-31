import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List messages for a conversation (real-time, ordered by time)
 */
export const list = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify user is part of this conversation
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) {
      return [];
    }

    if (conv.user1Id !== userId && conv.user2Id !== userId) {
      return [];
    }

    const limit = args.limit ?? 100;

    // Get messages ordered by creation time
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .take(limit);

    // Fetch sender details for each message
    const messagesWithDetails = await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return {
          _id: msg._id,
          text: msg.text,
          createdAt: msg.createdAt,
          readAt: msg.readAt,
          isOwn: msg.senderId === userId,
          sender: sender
            ? {
                _id: sender._id,
                name: sender.name,
                image: sender.image,
              }
            : null,
        };
      })
    );

    return messagesWithDetails;
  },
});

/**
 * Send a message to a conversation
 */
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate text
    const text = args.text.trim();
    if (!text) {
      throw new Error("Message cannot be empty");
    }

    // Verify user is part of this conversation
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) {
      throw new Error("Conversation not found");
    }

    if (conv.user1Id !== userId && conv.user2Id !== userId) {
      throw new Error("Not authorized to send messages in this conversation");
    }

    const now = Date.now();

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      text,
      createdAt: now,
    });

    // Update conversation's lastMessageAt
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
    });

    return messageId;
  },
});

/**
 * Mark all messages in a conversation as read
 */
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is part of this conversation
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) {
      throw new Error("Conversation not found");
    }

    if (conv.user1Id !== userId && conv.user2Id !== userId) {
      throw new Error("Not authorized");
    }

    // Get unread messages from the other user
    const friendId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
    
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) =>
        q.and(
          q.eq(q.field("senderId"), friendId),
          q.eq(q.field("readAt"), undefined)
        )
      )
      .collect();

    const now = Date.now();

    // Mark all as read
    for (const msg of unreadMessages) {
      await ctx.db.patch(msg._id, { readAt: now });
    }

    return { markedCount: unreadMessages.length };
  },
});
