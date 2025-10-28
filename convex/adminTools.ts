/**
 * Admin Tools - Comprehensive admin functionality
 * Only accessible to users with isAdmin = true
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { verifySession } from "./auth";

// Helper function to verify admin access
async function verifyAdmin(ctx: any, token: string) {
  const userId = await verifySession(ctx, token);
  const user = await ctx.db.get(userId);
  
  if (!user || !user.isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
  
  return userId;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Get all users with pagination
 */
export const getAllUsers = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    
    const users = await ctx.db
      .query("users")
      .order("desc")
      .take(limit + offset);
    
    // Skip offset and take limit
    const paginatedUsers = users.slice(offset, offset + limit);
    
    return paginatedUsers.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier,
      creditsBalance: user.creditsBalance,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  },
});

/**
 * Search users by email or name
 */
export const searchUsers = query({
  args: {
    token: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const allUsers = await ctx.db.query("users").collect();
    const searchLower = args.searchTerm.toLowerCase();
    
    const filtered = allUsers.filter(user => 
      user.email.toLowerCase().includes(searchLower) ||
      (user.name && user.name.toLowerCase().includes(searchLower))
    );
    
    return filtered.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier,
      creditsBalance: user.creditsBalance,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
    }));
  },
});

/**
 * Get detailed user information
 */
export const getUserDetails = query({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get user's jobs
    const jobs = await ctx.db
      .query("aiJobs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Get user's transactions
    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
    
    // Get user's subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
        creditsBalance: user.creditsBalance,
        isAdmin: user.isAdmin || false,
        stripeCustomerId: user.stripeCustomerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      stats: {
        totalJobs: jobs.length,
        completedJobs: jobs.filter(j => j.status === "completed").length,
        failedJobs: jobs.filter(j => j.status === "failed").length,
        totalCreditsUsed: transactions
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      },
      recentTransactions: transactions,
      subscription,
    };
  },
});

/**
 * Update user admin status
 */
export const updateUserAdminStatus = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    await ctx.db.patch(args.userId, {
      isAdmin: args.isAdmin,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Update user subscription tier
 */
export const updateUserTier = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    tier: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    await ctx.db.patch(args.userId, {
      subscriptionTier: args.tier,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Add credits to a user
 */
export const addCreditsToUser = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    amount: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const newBalance = user.creditsBalance + args.amount;
    await ctx.db.patch(args.userId, {
      creditsBalance: newBalance,
      updatedAt: Date.now(),
    });
    
    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      amount: args.amount,
      type: "admin",
      description: args.description || `Admin credit adjustment: ${args.amount > 0 ? '+' : ''}${args.amount}`,
      createdAt: Date.now(),
    });
    
    return {
      oldBalance: user.creditsBalance,
      newBalance,
      added: args.amount,
    };
  },
});

/**
 * Set user credits to a specific amount
 */
export const setUserCredits = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const oldBalance = user.creditsBalance;
    const difference = args.amount - oldBalance;
    
    await ctx.db.patch(args.userId, {
      creditsBalance: args.amount,
      updatedAt: Date.now(),
    });
    
    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      amount: difference,
      type: "admin",
      description: `Admin credit reset: ${oldBalance} → ${args.amount}`,
      createdAt: Date.now(),
    });
    
    return {
      oldBalance,
      newBalance: args.amount,
      difference,
    };
  },
});

// ============================================================================
// SYSTEM STATISTICS
// ============================================================================

/**
 * Get system-wide statistics
 */
export const getSystemStats = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;
    const adminUsers = allUsers.filter(u => u.isAdmin).length;
    const freeUsers = allUsers.filter(u => u.subscriptionTier === "free").length;
    const proUsers = allUsers.filter(u => u.subscriptionTier === "pro").length;
    const enterpriseUsers = allUsers.filter(u => u.subscriptionTier === "enterprise").length;
    
    // Get all jobs
    const allJobs = await ctx.db.query("aiJobs").collect();
    const totalJobs = allJobs.length;
    const completedJobs = allJobs.filter(j => j.status === "completed").length;
    const failedJobs = allJobs.filter(j => j.status === "failed").length;
    const pendingJobs = allJobs.filter(j => j.status === "pending").length;
    const processingJobs = allJobs.filter(j => j.status === "processing").length;
    
    // Get all transactions
    const allTransactions = await ctx.db.query("creditTransactions").collect();
    const totalCreditsIssued = allTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCreditsUsed = allTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Get subscriptions
    const allSubscriptions = await ctx.db.query("subscriptions").collect();
    const activeSubscriptions = allSubscriptions.filter(s => s.status === "active").length;
    
    // Jobs by type
    const jobsByType: Record<string, number> = {};
    allJobs.forEach(job => {
      jobsByType[job.toolType] = (jobsByType[job.toolType] || 0) + 1;
    });
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentJobs = allJobs.filter(j => j.createdAt >= sevenDaysAgo);
    const recentUsers = allUsers.filter(u => u.createdAt >= sevenDaysAgo);
    
    return {
      users: {
        total: totalUsers,
        admins: adminUsers,
        free: freeUsers,
        pro: proUsers,
        enterprise: enterpriseUsers,
        newLast7Days: recentUsers.length,
      },
      jobs: {
        total: totalJobs,
        completed: completedJobs,
        failed: failedJobs,
        pending: pendingJobs,
        processing: processingJobs,
        last7Days: recentJobs.length,
        byType: jobsByType,
      },
      credits: {
        totalIssued: totalCreditsIssued,
        totalUsed: totalCreditsUsed,
        currentBalance: allUsers.reduce((sum, u) => sum + u.creditsBalance, 0),
      },
      subscriptions: {
        total: allSubscriptions.length,
        active: activeSubscriptions,
      },
    };
  },
});

/**
 * Get recent activity feed
 */
export const getRecentActivity = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const limit = args.limit || 50;
    
    // Get recent jobs
    const recentJobs = await ctx.db
      .query("aiJobs")
      .order("desc")
      .take(limit);
    
    // Get user info for each job
    const activities = await Promise.all(
      recentJobs.map(async (job) => {
        const user = await ctx.db.get(job.userId);
        return {
          type: "job",
          id: job._id,
          userId: job.userId,
          userEmail: user?.email,
          toolType: job.toolType,
          status: job.status,
          creditsUsed: job.creditsUsed,
          createdAt: job.createdAt,
        };
      })
    );
    
    return activities;
  },
});

// ============================================================================
// JOB MONITORING
// ============================================================================

/**
 * Get all jobs with filters
 */
export const getAllJobs = query({
  args: {
    token: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const limit = args.limit || 100;
    
    let jobs;
    if (args.status) {
      jobs = await ctx.db
        .query("aiJobs")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
    } else {
      jobs = await ctx.db
        .query("aiJobs")
        .order("desc")
        .take(limit);
    }
    
    // Get user emails
    const jobsWithUsers = await Promise.all(
      jobs.map(async (job) => {
        const user = await ctx.db.get(job.userId);
        return {
          ...job,
          userEmail: user?.email,
        };
      })
    );
    
    return jobsWithUsers;
  },
});

/**
 * Get job details
 */
export const getJobDetails = query({
  args: {
    token: v.string(),
    jobId: v.id("aiJobs"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    
    const user = await ctx.db.get(job.userId);
    
    return {
      ...job,
      userEmail: user?.email,
      userName: user?.name,
    };
  },
});

/**
 * Retry a failed job
 */
export const retryJob = mutation({
  args: {
    token: v.string(),
    jobId: v.id("aiJobs"),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    
    await ctx.db.patch(args.jobId, {
      status: "pending",
      errorMessage: undefined,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// ============================================================================
// CREDIT MANAGEMENT
// ============================================================================

/**
 * Get all credit transactions
 */
export const getAllTransactions = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const limit = args.limit || 100;
    
    const transactions = await ctx.db
      .query("creditTransactions")
      .order("desc")
      .take(limit * 2); // Get more to filter
    
    let filtered = transactions;
    if (args.type) {
      filtered = transactions.filter(t => t.type === args.type);
    }
    
    const result = filtered.slice(0, limit);
    
    // Get user emails
    const transactionsWithUsers = await Promise.all(
      result.map(async (tx) => {
        const user = await ctx.db.get(tx.userId);
        return {
          ...tx,
          userEmail: user?.email,
        };
      })
    );
    
    return transactionsWithUsers;
  },
});

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Get all subscriptions
 */
export const getAllSubscriptions = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const subscriptions = await ctx.db
      .query("subscriptions")
      .order("desc")
      .collect();
    
    // Get user emails
    const subscriptionsWithUsers = await Promise.all(
      subscriptions.map(async (sub) => {
        const user = await ctx.db.get(sub.userId);
        return {
          ...sub,
          userEmail: user?.email,
        };
      })
    );
    
    return subscriptionsWithUsers;
  },
});

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get usage analytics over time
 */
export const getUsageAnalytics = query({
  args: {
    token: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    // Get all usage logs
    const usageLogs = await ctx.db
      .query("usageLogs")
      .filter((q) => q.gte(q.field("timestamp"), startDate))
      .collect();
    
    // Group by day
    const dailyStats: Record<string, any> = {};
    
    usageLogs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          totalJobs: 0,
          totalCredits: 0,
          toolCounts: {} as Record<string, number>,
        };
      }
      dailyStats[date].totalJobs++;
      dailyStats[date].totalCredits += log.creditsUsed;
      dailyStats[date].toolCounts[log.toolType] = 
        (dailyStats[date].toolCounts[log.toolType] || 0) + 1;
    });
    
    return Object.values(dailyStats).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  },
});

/**
 * Get chat analytics
 */
export const getChatAnalytics = query({
  args: {
    token: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const analytics = await ctx.db
      .query("chatAnalytics")
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();
    
    return analytics;
  },
});

// ============================================================================
// AI TOOLS CONFIGURATION
// ============================================================================

/**
 * Get all AI tool configurations (requires admin token)
 */
export const getAllToolConfigs = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const configs = await ctx.db
      .query("aiToolConfigs")
      .collect();
    
    return configs;
  },
});

/**
 * Get all AI tool configurations (public, no admin required)
 */
export const getToolConfigsPublic = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db
      .query("aiToolConfigs")
      .collect();
    
    // Return all fields for public access
    return configs.map(config => ({
      _id: config._id,
      toolId: config.toolId,
      enabled: config.enabled,
      anonymous: config.anonymous,
      free: config.free,
      paid: config.paid,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));
  },
});

/**
 * Get enabled/disabled status for a specific tool
 */
export const getToolStatus = query({
  args: {
    toolId: v.string(),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("aiToolConfigs")
      .withIndex("by_tool_id", (q) => q.eq("toolId", args.toolId))
      .first();
    
    // If no config exists, tool is enabled by default
    return config ? config.enabled : true;
  },
});

/**
 * Toggle tool status (enable/disable)
 */
export const toggleToolStatus = mutation({
  args: {
    token: v.string(),
    toolId: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const existing = await ctx.db
      .query("aiToolConfigs")
      .withIndex("by_tool_id", (q) => q.eq("toolId", args.toolId))
      .first();
    
    const now = Date.now();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: args.enabled,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("aiToolConfigs", {
        toolId: args.toolId,
        enabled: args.enabled,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    return { success: true, enabled: args.enabled };
  },
});

/**
 * Update tool configuration (all fields)
 * Note: All fields are optional - only provided fields will be updated
 */
export const updateToolConfig = mutation({
  args: {
    token: v.string(),
    toolId: v.string(),
    enabled: v.optional(v.boolean()),
    anonymous: v.optional(v.boolean()),
    free: v.optional(v.boolean()),
    paid: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const existing = await ctx.db
      .query("aiToolConfigs")
      .withIndex("by_tool_id", (q) => q.eq("toolId", args.toolId))
      .first();
    
    const now = Date.now();
    
    try {
      if (existing) {
        // Only update fields that were explicitly provided
        const updates: Record<string, any> = {
          updatedAt: now,
        };
        
        // Only add fields if they were explicitly passed (not undefined)
        if (args.enabled !== undefined) {
          updates.enabled = args.enabled;
        }
        if (args.anonymous !== undefined) {
          updates.anonymous = args.anonymous;
        }
        if (args.free !== undefined) {
          updates.free = args.free;
        }
        if (args.paid !== undefined) {
          updates.paid = args.paid;
        }
        
        await ctx.db.patch(existing._id, updates);
      } else {
        // Create new record with provided fields
        const newConfig: Record<string, any> = {
          toolId: args.toolId,
          enabled: args.enabled ?? true,
          createdAt: now,
          updatedAt: now,
        };
        
        // Only add optional fields if explicitly provided
        if (args.anonymous !== undefined) {
          newConfig.anonymous = args.anonymous;
        }
        if (args.free !== undefined) {
          newConfig.free = args.free;
        }
        if (args.paid !== undefined) {
          newConfig.paid = args.paid;
        }
        
        await ctx.db.insert("aiToolConfigs", newConfig);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error updating tool config:", error);
      console.error("Args:", args);
      console.error("Existing:", existing);
      throw error;
    }
  },
});

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

/**
 * Get system health metrics
 */
export const getSystemHealth = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    // Check for stuck jobs (processing for > 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const allJobs = await ctx.db.query("aiJobs").collect();
    const stuckJobs = allJobs.filter(
      j => j.status === "processing" && j.updatedAt < oneHourAgo
    );
    
    // Check for recent failures (last 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentFailures = allJobs.filter(
      j => j.status === "failed" && j.createdAt >= oneDayAgo
    );
    
    // Check for expired sessions
    const allSessions = await ctx.db.query("sessions").collect();
    const expiredSessions = allSessions.filter(s => s.expiresAt < Date.now());
    
    return {
      stuckJobs: {
        count: stuckJobs.length,
        jobs: stuckJobs.slice(0, 10), // First 10
      },
      recentFailures: {
        count: recentFailures.length,
        rate: (recentFailures.length / allJobs.length * 100).toFixed(2),
      },
      expiredSessions: {
        count: expiredSessions.length,
      },
      overallHealth: stuckJobs.length === 0 && recentFailures.length < 10 ? "healthy" : "needs_attention",
    };
  },
});

/**
 * Cleanup expired sessions
 */
export const cleanupExpiredSessions = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const allSessions = await ctx.db.query("sessions").collect();
    const expiredSessions = allSessions.filter(s => s.expiresAt < Date.now());
    
    for (const session of expiredSessions) {
      await ctx.db.delete(session._id);
    }
    
    return {
      deleted: expiredSessions.length,
    };
  },
});

/**
 * Reset stuck jobs
 */
export const resetStuckJobs = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx, args.token);
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const allJobs = await ctx.db.query("aiJobs").collect();
    const stuckJobs = allJobs.filter(
      j => j.status === "processing" && j.updatedAt < oneHourAgo
    );
    
    for (const job of stuckJobs) {
      await ctx.db.patch(job._id, {
        status: "failed",
        errorMessage: "Job timeout - reset by admin",
        updatedAt: Date.now(),
      });
    }
    
    return {
      reset: stuckJobs.length,
    };
  },
});
