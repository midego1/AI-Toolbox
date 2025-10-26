import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifySession } from "./auth";

// Create a new AI job
export const createJob = mutation({
  args: {
    token: v.string(),
    toolType: v.string(),
    inputData: v.any(),
    inputFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);

    const jobId = await ctx.db.insert("aiJobs", {
      userId,
      toolType: args.toolType,
      status: "pending",
      inputData: args.inputData,
      inputFileId: args.inputFileId,
      creditsUsed: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return jobId;
  },
});

// Update job status
export const updateJobStatus = mutation({
  args: {
    token: v.string(),
    jobId: v.id("aiJobs"),
    status: v.string(),
    outputData: v.optional(v.any()),
    outputFileId: v.optional(v.id("_storage")),
    creditsUsed: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.outputData !== undefined) {
      updates.outputData = args.outputData;
    }

    if (args.outputFileId !== undefined) {
      updates.outputFileId = args.outputFileId;
    }

    if (args.creditsUsed !== undefined) {
      updates.creditsUsed = args.creditsUsed;
    }

    if (args.errorMessage !== undefined) {
      updates.errorMessage = args.errorMessage;
    }

    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.jobId, updates);

    // Log usage if job is completed
    if (args.status === "completed" && args.creditsUsed) {
      await ctx.db.insert("usageLogs", {
        userId,
        toolType: job.toolType,
        jobId: args.jobId,
        creditsUsed: args.creditsUsed,
        timestamp: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get job by ID
export const getJob = query({
  args: {
    token: v.string(),
    jobId: v.id("aiJobs"),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return job;
  },
});

// Get user's jobs
export const getUserJobs = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    toolType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 50;

    let jobs = await ctx.db
      .query("aiJobs")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // Filter by tool type if specified
    if (args.toolType) {
      jobs = jobs.filter(job => job.toolType === args.toolType);
    }

    return jobs;
  },
});

// Get usage statistics
export const getUsageStats = query({
  args: {
    token: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);

    const startDate = args.startDate || (Date.now() - (30 * 24 * 60 * 60 * 1000)); // Default 30 days
    const endDate = args.endDate || Date.now();

    const logs = await ctx.db
      .query("usageLogs")
      .withIndex("by_user_and_timestamp", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), startDate),
          q.lte(q.field("timestamp"), endDate)
        )
      )
      .collect();

    // Aggregate by tool type
    const statsByTool: Record<string, { count: number; creditsUsed: number }> = {};

    logs.forEach(log => {
      if (!statsByTool[log.toolType]) {
        statsByTool[log.toolType] = { count: 0, creditsUsed: 0 };
      }
      statsByTool[log.toolType].count++;
      statsByTool[log.toolType].creditsUsed += log.creditsUsed;
    });

    const totalCreditsUsed = logs.reduce((sum, log) => sum + log.creditsUsed, 0);
    const totalJobs = logs.length;

    return {
      totalJobs,
      totalCreditsUsed,
      statsByTool,
      logs,
    };
  },
});
