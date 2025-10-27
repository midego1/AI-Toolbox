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

// Get wardrobe history with image URLs
export const getWardrobeHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;

    // Get completed virtual try-on jobs
    const allJobs = await ctx.db
      .query("aiJobs")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Filter for virtual try-on and completed status
    const virtualTryOnJobs = allJobs.filter(
      (job) => job.toolType === "virtual_tryon" && job.status === "completed"
    );

    // Apply pagination
    const paginatedJobs = virtualTryOnJobs.slice(offset, offset + limit);

    // Enrich with image URLs
    const enrichedJobs = await Promise.all(
      paginatedJobs.map(async (job) => {
        let outputImageUrl = null;

        // Try to get from storage first
        if (job.outputFileId) {
          outputImageUrl = await ctx.storage.getUrl(job.outputFileId);
        }

        // Fallback to outputData if no storage URL
        if (!outputImageUrl && job.outputData?.imageUrl) {
          outputImageUrl = job.outputData.imageUrl;
        }

        return {
          _id: job._id,
          _creationTime: job._creationTime,
          itemType: job.inputData?.itemType || "accessories",
          style: job.inputData?.style || "realistic",
          outputImageUrl,
          createdAt: job.createdAt,
          creditsUsed: job.creditsUsed,
        };
      })
    );

    return {
      items: enrichedJobs,
      total: virtualTryOnJobs.length,
      hasMore: offset + limit < virtualTryOnJobs.length,
    };
  },
});

// Get background removal history
export const getBackgroundRemovalHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;

    // Get completed background removal jobs
    const allJobs = await ctx.db
      .query("aiJobs")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // Filter for background removal and completed status
    const bgRemovalJobs = allJobs.filter(
      (job) => job.toolType === "background_removal" && job.status === "completed"
    );

    // Apply pagination
    const paginatedJobs = bgRemovalJobs.slice(offset, offset + limit);

    // Enrich with image URLs
    const enrichedJobs = await Promise.all(
      paginatedJobs.map(async (job) => {
        let outputImageUrl = null;

        // Try to get from storage first
        if (job.outputFileId) {
          outputImageUrl = await ctx.storage.getUrl(job.outputFileId);
        }

        // Fallback to outputData if no storage URL
        if (!outputImageUrl && job.outputData?.resultImageUrl) {
          outputImageUrl = job.outputData.resultImageUrl;
        }

        return {
          _id: job._id,
          _creationTime: job._creationTime,
          outputType: job.inputData?.outputType || "cutout",
          backgroundColor: job.inputData?.backgroundColor,
          edgeRefinementLevel: job.inputData?.edgeRefinementLevel,
          outputImageUrl,
          createdAt: job.createdAt,
          creditsUsed: job.creditsUsed,
        };
      })
    );

    return {
      items: enrichedJobs,
      total: bgRemovalJobs.length,
      hasMore: offset + limit < bgRemovalJobs.length,
    };
  },
});

// Generic helper to get tool history
async function getToolHistory(
  ctx: any,
  userId: string,
  toolType: string,
  limit: number,
  offset: number
) {
  const allJobs = await ctx.db
    .query("aiJobs")
    .withIndex("by_user_and_created", (q: any) => q.eq("userId", userId))
    .order("desc")
    .collect();

  const toolJobs = allJobs.filter(
    (job: any) => job.toolType === toolType && job.status === "completed"
  );

  const paginatedJobs = toolJobs.slice(offset, offset + limit);

  return {
    items: paginatedJobs,
    total: toolJobs.length,
    hasMore: offset + limit < toolJobs.length,
  };
}

// Get image generation history
export const getImageGenerationHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;

    const history = await getToolHistory(ctx, userId, "image_generation", limit, offset);

    // Enrich with image URLs
    const enrichedItems = await Promise.all(
      history.items.map(async (job: any) => {
        let imageUrl = null;
        if (job.outputFileId) {
          imageUrl = await ctx.storage.getUrl(job.outputFileId);
        } else if (job.outputData?.imageUrl) {
          imageUrl = job.outputData.imageUrl;
        }

        return {
          _id: job._id,
          _creationTime: job._creationTime,
          prompt: job.inputData?.prompt || job.inputData?.enhancedPrompt || "Image generation",
          imageUrl,
          createdAt: job.createdAt,
          creditsUsed: job.creditsUsed,
        };
      })
    );

    return {
      items: enrichedItems,
      total: history.total,
      hasMore: history.hasMore,
    };
  },
});

// Get translation history
export const getTranslationHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;
    return await getToolHistory(ctx, userId, "translation", limit, offset);
  },
});

// Get OCR history
export const getOCRHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;
    return await getToolHistory(ctx, userId, "ocr", limit, offset);
  },
});

// Get copywriting history
export const getCopywritingHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;
    return await getToolHistory(ctx, userId, "copywriting", limit, offset);
  },
});

// Get summarizer history
export const getSummarizerHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;
    return await getToolHistory(ctx, userId, "summarizer", limit, offset);
  },
});

// Get rewriter history
export const getRewriterHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;
    return await getToolHistory(ctx, userId, "content_rewriter", limit, offset);
  },
});

// Get SEO optimizer history
export const getSEOHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;
    return await getToolHistory(ctx, userId, "seo_optimizer", limit, offset);
  },
});

// Get LinkedIn content history
export const getLinkedInHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;
    return await getToolHistory(ctx, userId, "linkedin_content", limit, offset);
  },
});

// Get transcription history
export const getTranscriptionHistory = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 12;
    const offset = args.offset || 0;
    return await getToolHistory(ctx, userId, "transcription", limit, offset);
  },
});

// Get history by tool type (generic function for Sinterklaas tools and others)
export const getHistoryByType = query({
  args: {
    token: v.string(),
    typeFilter: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 10;
    const offset = args.offset || 0;
    
    return await getToolHistory(ctx, userId, args.typeFilter, limit, offset);
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
