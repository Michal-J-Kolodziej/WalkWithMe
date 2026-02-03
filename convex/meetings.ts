import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Create a new meeting
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.optional(v.string()),
    }),
    dateTime: v.number(),
    dogIds: v.array(v.id('dogs')), // Dogs the owner will bring
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    // Verify the dogs belong to the user
    for (const dogId of args.dogIds) {
      const dog = await ctx.db.get(dogId)
      if (!dog || dog.ownerId !== userId) {
        throw new Error('Invalid dog selection')
      }
    }

    const now = Date.now()

    // Create the meeting
    const meetingId = await ctx.db.insert('meetings', {
      ownerId: userId,
      title: args.title,
      description: args.description,
      location: args.location,
      dateTime: args.dateTime,
      createdAt: now,
    })

    // Add owner as first participant
    await ctx.db.insert('meetingParticipants', {
      meetingId,
      userId,
      dogIds: args.dogIds,
      joinedAt: now,
    })

    return meetingId
  },
})

/**
 * Get a meeting by ID with full details
 */
export const get = query({
  args: {
    meetingId: v.id('meetings'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    const meeting = await ctx.db.get(args.meetingId)
    if (!meeting) {
      return null
    }

    // Get owner info
    const owner = await ctx.db.get(meeting.ownerId)

    // Get all participants with their dogs
    const participants = await ctx.db
      .query('meetingParticipants')
      .withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
      .collect()

    const participantsWithDetails = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId)
        const dogs = await Promise.all(
          p.dogIds.map(async (dogId) => await ctx.db.get(dogId)),
        )
        return {
          ...p,
          user: user
            ? { _id: user._id, name: user.name, image: user.image }
            : null,
          dogs: dogs.filter((d) => d !== null),
        }
      }),
    )

    // Check if current user is a participant
    const isParticipant = participants.some((p) => p.userId === userId)
    const isOwner = meeting.ownerId === userId

    return {
      ...meeting,
      owner: owner
        ? { _id: owner._id, name: owner.name, image: owner.image }
        : null,
      participants: participantsWithDetails,
      isParticipant,
      isOwner,
    }
  },
})

/**
 * List meetings for current user (as owner or participant)
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    // Get meetings where user is owner
    const ownedMeetings = await ctx.db
      .query('meetings')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .collect()

    // Get meetings where user is participant
    const participations = await ctx.db
      .query('meetingParticipants')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    const participatingMeetingIds = participations.map((p) => p.meetingId)

    // Get participating meeting details (excluding owned ones)
    const participatingMeetings = await Promise.all(
      participatingMeetingIds
        .filter((id) => !ownedMeetings.some((m) => m._id === id))
        .map(async (id) => await ctx.db.get(id)),
    )

    // Combine and sort by dateTime
    const allMeetings = [
      ...ownedMeetings,
      ...participatingMeetings.filter((m) => m !== null),
    ].sort((a, b) => a.dateTime - b.dateTime)

    // Add participant count to each meeting
    return Promise.all(
      allMeetings.map(async (meeting) => {
        const participants = await ctx.db
          .query('meetingParticipants')
          .withIndex('by_meeting', (q) => q.eq('meetingId', meeting._id))
          .collect()

        const owner = await ctx.db.get(meeting.ownerId)

        return {
          ...meeting,
          owner: owner
            ? { _id: owner._id, name: owner.name, image: owner.image }
            : null,
          participantCount: participants.length,
          isOwner: meeting.ownerId === userId,
        }
      }),
    )
  },
})

/**
 * List upcoming meetings (future events)
 */
export const listUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    const now = Date.now()

    // Get all meetings for user then filter upcoming
    const participations = await ctx.db
      .query('meetingParticipants')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    const meetingIds = new Set(participations.map((p) => p.meetingId))

    // Also get owned meetings
    const ownedMeetings = await ctx.db
      .query('meetings')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .collect()

    ownedMeetings.forEach((m) => meetingIds.add(m._id))

    // Get meeting details and filter upcoming
    const meetings = await Promise.all(
      Array.from(meetingIds).map(async (id) => await ctx.db.get(id)),
    )

    const upcomingMeetings = meetings
      .filter((m) => m !== null && m.dateTime > now)
      .sort((a, b) => a!.dateTime - b!.dateTime)

    return Promise.all(
      upcomingMeetings.map(async (meeting) => {
        const participants = await ctx.db
          .query('meetingParticipants')
          .withIndex('by_meeting', (q) => q.eq('meetingId', meeting!._id))
          .collect()

        const owner = await ctx.db.get(meeting!.ownerId)

        return {
          ...meeting,
          owner: owner
            ? { _id: owner._id, name: owner.name, image: owner.image }
            : null,
          participantCount: participants.length,
          isOwner: meeting!.ownerId === userId,
        }
      }),
    )
  },
})

/**
 * List past meetings
 */
export const listPast = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return []
    }

    const now = Date.now()

    // Get all meetings for user then filter past
    const participations = await ctx.db
      .query('meetingParticipants')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    const meetingIds = new Set(participations.map((p) => p.meetingId))

    // Also get owned meetings
    const ownedMeetings = await ctx.db
      .query('meetings')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .collect()

    ownedMeetings.forEach((m) => meetingIds.add(m._id))

    // Get meeting details and filter past
    const meetings = await Promise.all(
      Array.from(meetingIds).map(async (id) => await ctx.db.get(id)),
    )

    const pastMeetings = meetings
      .filter((m) => m !== null && m.dateTime <= now)
      .sort((a, b) => b!.dateTime - a!.dateTime) // Most recent first

    return Promise.all(
      pastMeetings.map(async (meeting) => {
        const participants = await ctx.db
          .query('meetingParticipants')
          .withIndex('by_meeting', (q) => q.eq('meetingId', meeting!._id))
          .collect()

        const owner = await ctx.db.get(meeting!.ownerId)

        return {
          ...meeting,
          owner: owner
            ? { _id: owner._id, name: owner.name, image: owner.image }
            : null,
          participantCount: participants.length,
          isOwner: meeting!.ownerId === userId,
        }
      }),
    )
  },
})

/**
 * Update a meeting (owner only)
 */
export const update = mutation({
  args: {
    meetingId: v.id('meetings'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
        address: v.optional(v.string()),
      }),
    ),
    dateTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const meeting = await ctx.db.get(args.meetingId)
    if (!meeting) {
      throw new Error('Meeting not found')
    }

    if (meeting.ownerId !== userId) {
      throw new Error('Only the meeting owner can update it')
    }

    const updates: Partial<{
      title: string
      description: string
      location: { lat: number; lng: number; address?: string }
      dateTime: number
    }> = {}

    if (args.title !== undefined) updates.title = args.title
    if (args.description !== undefined) updates.description = args.description
    if (args.location !== undefined) updates.location = args.location
    if (args.dateTime !== undefined) updates.dateTime = args.dateTime

    await ctx.db.patch(args.meetingId, updates)

    return args.meetingId
  },
})

/**
 * Delete a meeting (owner only)
 */
export const remove = mutation({
  args: {
    meetingId: v.id('meetings'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const meeting = await ctx.db.get(args.meetingId)
    if (!meeting) {
      throw new Error('Meeting not found')
    }

    if (meeting.ownerId !== userId) {
      throw new Error('Only the meeting owner can delete it')
    }

    // Delete all invitations for this meeting
    const invitations = await ctx.db
      .query('meetingInvitations')
      .withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
      .collect()

    for (const invitation of invitations) {
      await ctx.db.delete(invitation._id)
    }

    // Delete all participants
    const participants = await ctx.db
      .query('meetingParticipants')
      .withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
      .collect()

    for (const participant of participants) {
      await ctx.db.delete(participant._id)
    }

    // Delete the meeting
    await ctx.db.delete(args.meetingId)

    return { success: true }
  },
})

/**
 * Leave a meeting (participant only, not owner)
 */
export const leave = mutation({
  args: {
    meetingId: v.id('meetings'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const meeting = await ctx.db.get(args.meetingId)
    if (!meeting) {
      throw new Error('Meeting not found')
    }

    if (meeting.ownerId === userId) {
      throw new Error('Owner cannot leave. Delete the meeting instead.')
    }

    // Find and remove the participant entry
    const participants = await ctx.db
      .query('meetingParticipants')
      .withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
      .collect()

    const myParticipation = participants.find((p) => p.userId === userId)
    if (!myParticipation) {
      throw new Error('You are not a participant of this meeting')
    }

    await ctx.db.delete(myParticipation._id)

    return { success: true }
  },
})

/**
 * Update participant's dogs for a meeting
 */
export const updateMyDogs = mutation({
  args: {
    meetingId: v.id('meetings'),
    dogIds: v.array(v.id('dogs')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }

    // Verify the dogs belong to the user
    for (const dogId of args.dogIds) {
      const dog = await ctx.db.get(dogId)
      if (!dog || dog.ownerId !== userId) {
        throw new Error('Invalid dog selection')
      }
    }

    // Find the participant entry
    const participants = await ctx.db
      .query('meetingParticipants')
      .withIndex('by_meeting', (q) => q.eq('meetingId', args.meetingId))
      .collect()

    const myParticipation = participants.find((p) => p.userId === userId)
    if (!myParticipation) {
      throw new Error('You are not a participant of this meeting')
    }

    await ctx.db.patch(myParticipation._id, {
      dogIds: args.dogIds,
    })

    return { success: true }
  },
})
