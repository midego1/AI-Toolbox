import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    subscriptionTier: v.string(), // "free", "pro", "enterprise"
    creditsBalance: v.number(),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    tier: v.string(), // "pro", "enterprise"
    status: v.string(), // "active", "canceled", "past_due"
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"]),

  creditTransactions: defineTable({
    userId: v.id("users"),
    amount: v.number(), // positive for credits added, negative for credits used
    type: v.string(), // "purchase", "subscription", "tool_usage", "refund"
    description: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    relatedJobId: v.optional(v.id("aiJobs")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_created", ["userId", "createdAt"]),

  aiJobs: defineTable({
    userId: v.id("users"),
    toolType: v.string(), // "translation", "ocr", "image_generation", "headshot", "linkedin"
    status: v.string(), // "pending", "processing", "completed", "failed"
    inputData: v.any(), // flexible JSON data for different tool inputs
    outputData: v.optional(v.any()), // flexible JSON data for different tool outputs
    creditsUsed: v.number(),
    errorMessage: v.optional(v.string()),
    // File storage references
    inputFileId: v.optional(v.id("_storage")),
    outputFileId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_created", ["userId", "createdAt"])
    .index("by_status", ["status"]),

  usageLogs: defineTable({
    userId: v.id("users"),
    toolType: v.string(),
    jobId: v.id("aiJobs"),
    creditsUsed: v.number(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_timestamp", ["userId", "timestamp"]),

  // Session management for authentication
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),
});
