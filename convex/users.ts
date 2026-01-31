import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const completeProfile = mutation({
  args: {
    bio: v.string(),
    location: v.string(),
    role: v.string(),
    age: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Validate age if provided
    if (args.age !== undefined && (args.age < 13 || args.age > 120)) {
      throw new Error("Age must be between 13 and 120");
    }
    
    await ctx.db.patch(userId, {
      bio: args.bio,
      location: args.location,
      role: args.role,
      age: args.age,
      isProfileComplete: true,
    });
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    image: v.optional(v.string()),
    age: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate inputs
    const updates: Record<string, string | number> = {};
    
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 2) {
        throw new Error("Name must be at least 2 characters");
      }
      if (name.length > 100) {
        throw new Error("Name must be less than 100 characters");
      }
      updates.name = name;
    }

    if (args.bio !== undefined) {
      const bio = args.bio.trim();
      if (bio.length > 500) {
        throw new Error("Bio must be less than 500 characters");
      }
      updates.bio = bio;
    }

    if (args.location !== undefined) {
      const location = args.location.trim();
      if (location.length > 100) {
        throw new Error("Location must be less than 100 characters");
      }
      updates.location = location;
    }

    if (args.image !== undefined) {
      updates.image = args.image.trim();
    }

    if (args.age !== undefined) {
      if (args.age < 13 || args.age > 120) {
        throw new Error("Age must be between 13 and 120");
      }
      updates.age = args.age;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No fields to update");
    }

    await ctx.db.patch(userId, updates);
    
    return await ctx.db.get(userId);
  },
});
