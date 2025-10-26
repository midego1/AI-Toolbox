/**
 * Admin Tools - Use these for testing and development
 * WARNING: Remove or secure these before production!
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Add credits to a user (for testing)
 * Usage: Call this from Convex dashboard with a user's email
 */
export const addCredits = mutation({
  args: {
    email: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error(`User not found: ${args.email}`);
    }

    // Update credits
    const newBalance = user.creditsBalance + args.amount;
    await ctx.db.patch(user._id, {
      creditsBalance: newBalance,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId: user._id,
      amount: args.amount,
      type: "admin",
      description: `Admin credit adjustment: +${args.amount}`,
      createdAt: Date.now(),
    });

    return {
      email: user.email,
      oldBalance: user.creditsBalance,
      newBalance,
      added: args.amount,
    };
  },
});

/**
 * Set user credits to a specific amount
 */
export const setCredits = mutation({
  args: {
    email: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error(`User not found: ${args.email}`);
    }

    const oldBalance = user.creditsBalance;
    const difference = args.amount - oldBalance;

    // Update credits
    await ctx.db.patch(user._id, {
      creditsBalance: args.amount,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId: user._id,
      amount: difference,
      type: "admin",
      description: `Admin credit reset: ${oldBalance} → ${args.amount}`,
      createdAt: Date.now(),
    });

    return {
      email: user.email,
      oldBalance,
      newBalance: args.amount,
      difference,
    };
  },
});

