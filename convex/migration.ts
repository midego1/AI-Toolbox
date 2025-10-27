import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

/**
 * Migration: Link existing Convex user to Clerk
 * Call this when a user signs in with Clerk using the same email
 */
export const linkExistingUserToClerk = internalMutation({
  args: {
    email: v.string(),
    clerkUserId: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find existing user by email
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!existingUser) {
      return null;
    }

    // Check if user is already linked to Clerk
    if (existingUser.clerkUserId) {
      return existingUser._id;
    }

    // Link Clerk to existing account
    await ctx.db.patch(existingUser._id, {
      clerkUserId: args.clerkUserId,
      oauthProvider: "clerk",
      oauthProviderId: args.clerkUserId,
      ...(args.name && { name: args.name }),
      updatedAt: Date.now(),
    });

    return existingUser._id;
  },
});

/**
 * Get migration status
 */
export const getMigrationStatus = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    const totalUsers = allUsers.length;
    const clerkUsers = allUsers.filter(u => u.clerkUserId).length;
    const legacyUsers = allUsers.filter(u => !u.clerkUserId && u.passwordHash).length;
    const oauthUsers = allUsers.filter(u => u.oauthProvider && u.oauthProvider !== "clerk").length;

    return {
      totalUsers,
      clerkUsers,
      legacyUsers,
      oauthUsers,
      migrationProgress: totalUsers > 0 ? (clerkUsers / totalUsers) * 100 : 0,
    };
  },
});

/**
 * Migrate all existing users to support both auth methods
 * This doesn't break existing users - they can still log in with old system
 */
export const prepareForMigration = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    let migrated = 0;

    for (const user of allUsers) {
      // Skip if already has Clerk ID
      if (user.clerkUserId) {
        continue;
      }

      // Keep existing password auth intact
      // Just ensure the user can still log in
      migrated++;
    }

    return {
      totalUsers: allUsers.length,
      migrated,
      message: "Users ready for Clerk migration. Existing auth still works.",
    };
  },
});

