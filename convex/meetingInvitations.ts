import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Invite a friend to a meeting
 */
export const invite = mutation({
  args: {
    meetingId: v.id("meetings"),
    toUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify meeting exists and user is owner
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting) {
      throw new Error("Meeting not found");
    }

    if (meeting.ownerId !== userId) {
      throw new Error("Only the meeting owner can send invitations");
    }

    // Can't invite yourself
    if (args.toUserId === userId) {
      throw new Error("You cannot invite yourself");
    }

    // Check if they are friends
    // Normalize order (user1Id < user2Id in friendships table)
    const [user1, user2] =
      userId < args.toUserId ? [userId, args.toUserId] : [args.toUserId, userId];

    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", user1))
      .filter((q) => q.eq(q.field("user2Id"), user2))
      .first();

    if (!friendship) {
      throw new Error("You can only invite friends to meetings");
    }

    // Check if already invited
    const existingInvitation = await ctx.db
      .query("meetingInvitations")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .filter((q) => q.eq(q.field("toUserId"), args.toUserId))
      .first();

    if (existingInvitation) {
      throw new Error("This user has already been invited");
    }

    // Check if already a participant
    const existingParticipant = await ctx.db
      .query("meetingParticipants")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .filter((q) => q.eq(q.field("userId"), args.toUserId))
      .first();

    if (existingParticipant) {
      throw new Error("This user is already a participant");
    }

    // Create invitation
    const invitationId = await ctx.db.insert("meetingInvitations", {
      meetingId: args.meetingId,
      fromUserId: userId,
      toUserId: args.toUserId,
      status: "pending",
      createdAt: Date.now(),
    });

    return invitationId;
  },
});

/**
 * Accept a meeting invitation
 */
export const accept = mutation({
  args: {
    invitationId: v.id("meetingInvitations"),
    dogIds: v.array(v.id("dogs")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.toUserId !== userId) {
      throw new Error("This invitation is not for you");
    }

    if (invitation.status !== "pending") {
      throw new Error("This invitation has already been responded to");
    }

    // Verify at least one dog is selected
    if (args.dogIds.length === 0) {
      throw new Error("You must select at least one dog to bring");
    }

    // Verify the dogs belong to the user
    for (const dogId of args.dogIds) {
      const dog = await ctx.db.get(dogId);
      if (!dog || dog.ownerId !== userId) {
        throw new Error("Invalid dog selection");
      }
    }

    // Verify meeting still exists
    const meeting = await ctx.db.get(invitation.meetingId);
    if (!meeting) {
      throw new Error("Meeting no longer exists");
    }

    const now = Date.now();

    // Update invitation status
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
      respondedAt: now,
    });

    // Add user as participant
    await ctx.db.insert("meetingParticipants", {
      meetingId: invitation.meetingId,
      userId,
      dogIds: args.dogIds,
      joinedAt: now,
    });

    return { success: true };
  },
});

/**
 * Decline a meeting invitation
 */
export const decline = mutation({
  args: {
    invitationId: v.id("meetingInvitations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.toUserId !== userId) {
      throw new Error("This invitation is not for you");
    }

    if (invitation.status !== "pending") {
      throw new Error("This invitation has already been responded to");
    }

    await ctx.db.patch(args.invitationId, {
      status: "declined",
      respondedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Cancel a sent invitation (owner only)
 */
export const cancel = mutation({
  args: {
    invitationId: v.id("meetingInvitations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.fromUserId !== userId) {
      throw new Error("You can only cancel invitations you sent");
    }

    if (invitation.status !== "pending") {
      throw new Error("Can only cancel pending invitations");
    }

    await ctx.db.delete(args.invitationId);

    return { success: true };
  },
});

/**
 * List pending meeting invitations for current user
 */
export const listReceived = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const invitations = await ctx.db
      .query("meetingInvitations")
      .withIndex("by_to_user", (q) =>
        q.eq("toUserId", userId).eq("status", "pending")
      )
      .collect();

    // Get meeting and sender details
    return Promise.all(
      invitations.map(async (invitation) => {
        const meeting = await ctx.db.get(invitation.meetingId);
        const fromUser = await ctx.db.get(invitation.fromUserId);

        // Get participant count
        const participants = meeting
          ? await ctx.db
              .query("meetingParticipants")
              .withIndex("by_meeting", (q) =>
                q.eq("meetingId", invitation.meetingId)
              )
              .collect()
          : [];

        return {
          ...invitation,
          meeting: meeting
            ? {
                _id: meeting._id,
                title: meeting.title,
                description: meeting.description,
                location: meeting.location,
                dateTime: meeting.dateTime,
              }
            : null,
          fromUser: fromUser
            ? { _id: fromUser._id, name: fromUser.name, image: fromUser.image }
            : null,
          participantCount: participants.length,
        };
      })
    );
  },
});

/**
 * List all invitations for a meeting (owner only)
 */
export const listForMeeting = query({
  args: {
    meetingId: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify user is meeting owner
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting || meeting.ownerId !== userId) {
      return [];
    }

    const invitations = await ctx.db
      .query("meetingInvitations")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .collect();

    // Get invited user details
    return Promise.all(
      invitations.map(async (invitation) => {
        const toUser = await ctx.db.get(invitation.toUserId);
        return {
          ...invitation,
          toUser: toUser
            ? { _id: toUser._id, name: toUser.name, image: toUser.image }
            : null,
        };
      })
    );
  },
});

/**
 * Count pending meeting invitations
 */
export const countPending = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const invitations = await ctx.db
      .query("meetingInvitations")
      .withIndex("by_to_user", (q) =>
        q.eq("toUserId", userId).eq("status", "pending")
      )
      .collect();

    return invitations.length;
  },
});

/**
 * Get friends who can be invited to a meeting
 * (friends who are not already invited or participating)
 */
export const getInvitableFriends = query({
  args: {
    meetingId: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify user is meeting owner
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting || meeting.ownerId !== userId) {
      return [];
    }

    // Get all friends
    const friendships1 = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .collect();

    const friendships2 = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .collect();

    const friendIds = [
      ...friendships1.map((f) => f.user2Id),
      ...friendships2.map((f) => f.user1Id),
    ];

    // Get already invited users
    const invitations = await ctx.db
      .query("meetingInvitations")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .collect();

    const invitedUserIds = new Set(invitations.map((i) => i.toUserId));

    // Get already participating users
    const participants = await ctx.db
      .query("meetingParticipants")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .collect();

    const participantUserIds = new Set(participants.map((p) => p.userId));

    // Filter to friends who are not invited and not participating
    const invitableFriendIds = friendIds.filter(
      (id) => !invitedUserIds.has(id) && !participantUserIds.has(id)
    );

    // Get friend details
    const friends = await Promise.all(
      invitableFriendIds.map(async (friendId) => {
        const friend = await ctx.db.get(friendId);
        if (!friend) return null;

        // Get friend's dogs
        const dogs = await ctx.db
          .query("dogs")
          .withIndex("by_owner", (q) => q.eq("ownerId", friendId))
          .collect();

        return {
          _id: friend._id,
          name: friend.name,
          image: friend.image,
          location: friend.location,
          dogCount: dogs.length,
        };
      })
    );

    return friends.filter((f) => f !== null);
  },
});
