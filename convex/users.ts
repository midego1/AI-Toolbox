import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifySession } from "./auth";

// Get user's credit balance
export const getCreditBalance = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user.creditsBalance;
  },
});

// Get user's credit transaction history
export const getCreditTransactions = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 50;

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return transactions;
  },
});

// Deduct credits for tool usage
export const deductCredits = mutation({
  args: {
    token: v.string(),
    amount: v.number(),
    jobId: v.id("aiJobs"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has enough credits
    if (user.creditsBalance < args.amount) {
      throw new Error("Insufficient credits");
    }

    // Deduct credits
    const newBalance = user.creditsBalance - args.amount;
    await ctx.db.patch(userId, {
      creditsBalance: newBalance,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      amount: -args.amount,
      type: "tool_usage",
      description: args.description,
      relatedJobId: args.jobId,
      createdAt: Date.now(),
    });

    return { newBalance };
  },
});

// Add credits (for purchases or subscriptions)
export const addCredits = mutation({
  args: {
    token: v.string(),
    amount: v.number(),
    type: v.string(), // "purchase" or "subscription"
    description: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Add credits
    const newBalance = user.creditsBalance + args.amount;
    await ctx.db.patch(userId, {
      creditsBalance: newBalance,
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("creditTransactions", {
      userId,
      amount: args.amount,
      type: args.type,
      description: args.description,
      stripePaymentIntentId: args.stripePaymentIntentId,
      createdAt: Date.now(),
    });

    return { newBalance };
  },
});

// Update subscription tier
export const updateSubscriptionTier = mutation({
  args: {
    token: v.string(),
    tier: v.string(),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);

    await ctx.db.patch(userId, {
      subscriptionTier: args.tier,
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user profile
export const getUserProfile = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier,
      creditsBalance: user.creditsBalance,
      stripeCustomerId: user.stripeCustomerId,
      language: user.language || "nl", // Default to Dutch
      createdAt: user.createdAt,
    };
  },
});

// Update user language preference
export const updateUserLanguage = mutation({
  args: {
    token: v.string(),
    language: v.string(), // "nl" or "en"
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    
    if (args.language !== "nl" && args.language !== "en") {
      throw new Error("Invalid language. Must be 'nl' or 'en'");
    }

    await ctx.db.patch(userId, {
      language: args.language,
      updatedAt: Date.now(),
    });

    return { success: true, language: args.language };
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    token: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);

    await ctx.db.patch(userId, {
      name: args.name,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get dashboard statistics
export const getDashboardStats = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);

    // Get total jobs
    const allJobs = await ctx.db
      .query("aiJobs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalJobs = allJobs.length;
    const completedJobs = allJobs.filter(job => job.status === "completed").length;
    const failedJobs = allJobs.filter(job => job.status === "failed").length;

    // Get total credits used (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentTransactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    const creditsUsedLast30Days = recentTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Get user
    const user = await ctx.db.get(userId);

    return {
      creditsBalance: user?.creditsBalance || 0,
      totalJobs,
      completedJobs,
      failedJobs,
      creditsUsedLast30Days,
    };
  },
});
