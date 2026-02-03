import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Profile fields
    isProfileComplete: v.optional(v.boolean()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()), // This seems to be a text location (e.g. "Paris"). The new one is geo coordinates.
    // Geo location for tracking
    geo_location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        updatedAt: v.number(),
      }),
    ),
    isLocationEnabled: v.optional(v.boolean()),
    role: v.optional(v.string()),
    age: v.optional(v.number()),
  }).index('email', ['email']),
  dogs: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    breed: v.string(),
    age: v.number(),
    bio: v.string(),
    imageUrl: v.string(),
    imageUrls: v.optional(v.array(v.string())), // Additional photos
    createdAt: v.number(),
  }).index('by_owner', ['ownerId']),
  // Friend requests - tracks pending, accepted, and rejected requests
  friendRequests: defineTable({
    fromUserId: v.id('users'),
    toUserId: v.id('users'),
    message: v.optional(v.string()),
    status: v.string(), // "pending" | "accepted" | "rejected"
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index('by_to_user', ['toUserId', 'status'])
    .index('by_from_user', ['fromUserId', 'status'])
    .index('by_users', ['fromUserId', 'toUserId']),
  // Friendships - established friend connections
  // user1Id is always < user2Id to prevent duplicate friendships
  friendships: defineTable({
    user1Id: v.id('users'),
    user2Id: v.id('users'),
    createdAt: v.number(),
    requestId: v.id('friendRequests'),
  })
    .index('by_user1', ['user1Id'])
    .index('by_user2', ['user2Id']),
  // Meetings - dog walk meetup events
  meetings: defineTable({
    ownerId: v.id('users'), // Meeting creator
    title: v.string(), // Meeting title
    description: v.optional(v.string()), // Description/notes
    location: v.object({
      // Map location
      lat: v.number(),
      lng: v.number(),
      address: v.optional(v.string()),
    }),
    dateTime: v.number(), // Unix timestamp of meeting
    createdAt: v.number(),
  })
    .index('by_owner', ['ownerId'])
    .index('by_datetime', ['dateTime']),
  // Meeting invitations - tracks invites to friends
  meetingInvitations: defineTable({
    meetingId: v.id('meetings'),
    fromUserId: v.id('users'), // Who sent the invite
    toUserId: v.id('users'), // Who is invited
    status: v.string(), // "pending" | "accepted" | "declined"
    respondedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('by_meeting', ['meetingId'])
    .index('by_to_user', ['toUserId', 'status'])
    .index('by_from_user', ['fromUserId']),
  // Meeting participants - confirmed attendees with their dogs
  meetingParticipants: defineTable({
    meetingId: v.id('meetings'),
    userId: v.id('users'),
    dogIds: v.array(v.id('dogs')), // Selected dogs for this meeting
    joinedAt: v.number(),
  })
    .index('by_meeting', ['meetingId'])
    .index('by_user', ['userId']),
  // Conversations - one per friend pair (user1Id < user2Id like friendships)
  conversations: defineTable({
    user1Id: v.id('users'),
    user2Id: v.id('users'),
    lastMessageAt: v.optional(v.number()), // For sorting conversations
    createdAt: v.number(),
  })
    .index('by_user1', ['user1Id'])
    .index('by_user2', ['user2Id'])
    .index('by_users', ['user1Id', 'user2Id']),
  // Messages - individual chat messages
  messages: defineTable({
    conversationId: v.id('conversations'),
    senderId: v.id('users'),
    text: v.string(),
    createdAt: v.number(),
    readAt: v.optional(v.number()), // For unread indicators
  })
    .index('by_conversation', ['conversationId', 'createdAt'])
    .index('by_sender', ['senderId']),
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
})
