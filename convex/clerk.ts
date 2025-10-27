import { v } from "convex/values";
import { mutation, query, internalMutation, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

/**
 * Client-callable mutation to sync Clerk user to Convex
 * This is called directly from the browser for instant sync
 */
export const syncClerkUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by Clerk ID
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Check if user exists by email (link Clerk to existing account)
    const emailUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (emailUser) {
      // Link Clerk to existing account
      await ctx.db.patch(emailUser._id, {
        clerkUserId: args.clerkUserId,
        oauthProvider: "clerk",
        oauthProviderId: args.clerkUserId,
        ...(args.name && { name: args.name }),
        ...(args.avatarUrl && { avatarUrl: args.avatarUrl }),
        updatedAt: Date.now(),
      });
      return emailUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      clerkUserId: args.clerkUserId,
      oauthProvider: "clerk",
      oauthProviderId: args.clerkUserId,
      subscriptionTier: "free",
      creditsBalance: 10000, // Starting credits
      language: "nl", // Default to Dutch
      avatarUrl: args.avatarUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add initial credit transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      amount: 10000,
      type: "subscription",
      description: "Welcome bonus credits",
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Internal version for webhook (identical logic to public mutation)
 */
export const syncClerkUserInternal = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by Clerk ID
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Check if user exists by email (link Clerk to existing account)
    const emailUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (emailUser) {
      // Link Clerk to existing account
      await ctx.db.patch(emailUser._id, {
        clerkUserId: args.clerkUserId,
        oauthProvider: "clerk",
        oauthProviderId: args.clerkUserId,
        ...(args.name && { name: args.name }),
        ...(args.avatarUrl && { avatarUrl: args.avatarUrl }),
        updatedAt: Date.now(),
      });
      return emailUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      clerkUserId: args.clerkUserId,
      oauthProvider: "clerk",
      oauthProviderId: args.clerkUserId,
      subscriptionTier: "free",
      creditsBalance: 10000,
      language: "nl",
      avatarUrl: args.avatarUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add initial credit transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      amount: 10000,
      type: "subscription",
      description: "Welcome bonus credits",
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Get or create Convex user from Clerk userId
 * Called when Clerk user accesses the app
 */
export const getOrCreateUser = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to find user by Clerk ID first
    const clerkUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (clerkUser) {
      return clerkUser._id;
    }

    // Try to find by email
    const emailUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (emailUser) {
      // Link Clerk to existing account (migration)
      await ctx.db.patch(emailUser._id, {
        clerkUserId: args.clerkUserId,
        oauthProvider: "clerk",
        oauthProviderId: args.clerkUserId,
        ...(args.name && { name: args.name }),
        updatedAt: Date.now(),
      });
      
      console.log(`✅ Linked existing Convex user (${emailUser.email}) to Clerk (${args.clerkUserId})`);
      return emailUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      clerkUserId: args.clerkUserId,
      oauthProvider: "clerk",
      oauthProviderId: args.clerkUserId,
      subscriptionTier: "free",
      creditsBalance: 10000,
      language: "nl",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add initial credit transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      amount: 10000,
      type: "subscription",
      description: "Welcome bonus credits",
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Get Convex user ID from Clerk user ID
 */
export const getUserIdByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    return user?._id || null;
  },
});

/**
 * Get user profile by Convex user ID
 */
export const getUserProfileById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier,
      creditsBalance: user.creditsBalance,
      stripeCustomerId: user.stripeCustomerId,
      isAdmin: user.isAdmin || false,
      avatarUrl: user.avatarUrl,
    };
  },
});

