/**
 * History & Analytics Queries
 * 
 * Centralized history tracking for all AI tools
 * Users can view, reuse, and analyze past generations
 */

import { query } from "./_generated/server";
import { v } from "convex/values";
import { verifySession } from "./auth";

/**
 * Get user's AI job history with filtering and pagination
 */
export const getUserHistory = query({
  args: {
    token: v.string(),
    toolType: v.optional(v.string()), // Filter by specific tool
    status: v.optional(v.string()), // Filter by status
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify session (supports both Clerk and legacy auth)
    let userId;
    try {
      userId = await verifySession(ctx, args.token);
    } catch (e) {
      return null;
    }

    // Build query
    let jobsQuery = ctx.db
      .query("aiJobs")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .order("desc");

    // Apply filters
    const allJobs = await jobsQuery.collect();
    
    let filteredJobs = allJobs;
    
    if (args.toolType) {
      filteredJobs = filteredJobs.filter(job => job.toolType === args.toolType);
    }
    
    if (args.status) {
      filteredJobs = filteredJobs.filter(job => job.status === args.status);
    }

    // Pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paginatedJobs = filteredJobs.slice(offset, offset + limit);

    return {
      jobs: paginatedJobs,
      total: filteredJobs.length,
      hasMore: offset + limit < filteredJobs.length,
    };
  },
});

/**
 * Get a specific job by ID (for viewing details)
 */
export const getJobById = query({
  args: {
    token: v.string(),
    jobId: v.id("aiJobs"),
  },
  handler: async (ctx, args) => {
    // Verify session (supports both Clerk and legacy auth)
    let userId;
    try {
      userId = await verifySession(ctx, args.token);
    } catch (e) {
      return null;
    }

    // Get job
    const job = await ctx.db.get(args.jobId);
    
    if (!job || job.userId !== userId) {
      return null;
    }

    return job;
  },
});

/**
 * Get usage statistics by tool type
 */
export const getUsageByTool = query({
  args: {
    token: v.string(),
    timeRange: v.optional(v.string()), // "7d", "30d", "90d", "all"
  },
  handler: async (ctx, args) => {
    // Verify session (supports both Clerk and legacy auth)
    let userId;
    try {
      userId = await verifySession(ctx, args.token);
    } catch (e) {
      return null;
    }

    // Calculate time threshold
    const now = Date.now();
    const timeThresholds: Record<string, number> = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      "all": Infinity,
    };
    
    const threshold = now - (timeThresholds[args.timeRange || "30d"] || timeThresholds["30d"]);

    // Get all completed jobs
    const jobs = await ctx.db
      .query("aiJobs")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .filter((q) => q.and(
        q.eq(q.field("status"), "completed"),
        q.gte(q.field("createdAt"), threshold)
      ))
      .collect();

    // Group by tool type
    const usageByTool: Record<string, any> = {};
    
    jobs.forEach(job => {
      if (!usageByTool[job.toolType]) {
        usageByTool[job.toolType] = {
          toolType: job.toolType,
          count: 0,
          totalCredits: 0,
          lastUsed: 0,
        };
      }
      
      usageByTool[job.toolType].count++;
      usageByTool[job.toolType].totalCredits += job.creditsUsed;
      usageByTool[job.toolType].lastUsed = Math.max(
        usageByTool[job.toolType].lastUsed,
        job.createdAt
      );
    });

    return {
      usage: Object.values(usageByTool).sort((a, b) => b.count - a.count),
      totalJobs: jobs.length,
      totalCreditsSpent: jobs.reduce((sum, job) => sum + job.creditsUsed, 0),
    };
  },
});

/**
 * Get credit spending over time (for charts)
 */
export const getCreditSpendingOverTime = query({
  args: {
    token: v.string(),
    days: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    // Verify session (supports both Clerk and legacy auth)
    let userId;
    try {
      userId = await verifySession(ctx, args.token);
    } catch (e) {
      return null;
    }

    const days = args.days || 30;
    const now = Date.now();
    const startTime = now - (days * 24 * 60 * 60 * 1000);

    // Get jobs in timeframe
    const jobs = await ctx.db
      .query("aiJobs")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .filter((q) => q.and(
        q.eq(q.field("status"), "completed"),
        q.gte(q.field("createdAt"), startTime)
      ))
      .collect();

    // Group by day
    const dailySpending: Record<string, number> = {};
    
    jobs.forEach(job => {
      const date = new Date(job.createdAt).toISOString().split('T')[0];
      dailySpending[date] = (dailySpending[date] || 0) + job.creditsUsed;
    });

    // Convert to array and sort
    const spending = Object.entries(dailySpending)
      .map(([date, credits]) => ({ date, credits }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      spending,
      totalCredits: jobs.reduce((sum, job) => sum + job.creditsUsed, 0),
      averagePerDay: jobs.length > 0 
        ? Math.round(jobs.reduce((sum, job) => sum + job.creditsUsed, 0) / days)
        : 0,
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
    // Verify session (supports both Clerk and legacy auth)
    let userId;
    try {
      userId = await verifySession(ctx, args.token);
    } catch (e) {
      return null;
    }

    const limit = args.limit || 20;

    // Get recent jobs
    const jobs = await ctx.db
      .query("aiJobs")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return jobs.map(job => ({
      jobId: job._id,
      toolType: job.toolType,
      status: job.status,
      creditsUsed: job.creditsUsed,
      createdAt: job.createdAt,
      // Simplified output for feed
      preview: generatePreview(job),
    }));
  },
});

/**
 * Search job history
 */
export const searchHistory = query({
  args: {
    token: v.string(),
    searchQuery: v.string(),
    toolType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify session (supports both Clerk and legacy auth)
    let userId;
    try {
      userId = await verifySession(ctx, args.token);
    } catch (e) {
      return null;
    }

    // Get all jobs
    const jobs = await ctx.db
      .query("aiJobs")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Filter by tool type if specified
    let filteredJobs = jobs;
    if (args.toolType) {
      filteredJobs = jobs.filter(job => job.toolType === args.toolType);
    }

    // Search in inputData and outputData
    const searchLower = args.searchQuery.toLowerCase();
    const results = filteredJobs.filter(job => {
      const inputStr = JSON.stringify(job.inputData).toLowerCase();
      const outputStr = job.outputData ? JSON.stringify(job.outputData).toLowerCase() : "";
      return inputStr.includes(searchLower) || outputStr.includes(searchLower);
    });

    return results.slice(0, 50); // Limit search results
  },
});

// Helper function to generate preview text
function generatePreview(job: any): string {
  if (job.status !== "completed" || !job.outputData) {
    return job.status === "failed" ? "Generation failed" : "Processing...";
  }

  // Generate preview based on tool type
  switch (job.toolType) {
    case "translation":
      return job.outputData.translatedText?.substring(0, 100) + "...";
    case "copywriting":
      return job.outputData.variants?.[0]?.copy?.substring(0, 100) + "...";
    case "linkedin_content":
      return job.outputData.contents?.[0]?.text?.substring(0, 100) + "...";
    case "summarizer":
      return job.outputData.summary?.substring(0, 100) + "...";
    case "rewriter":
      return job.outputData.rewrites?.[0]?.text?.substring(0, 100) + "...";
    case "image_generation":
      return "Image generated successfully";
    case "virtual_tryon":
      return "Virtual try-on completed";
    case "background_removal":
      return "Background removed successfully";
    default:
      return "Completed";
  }
}

