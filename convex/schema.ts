import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.optional(v.string()), // Optional for OAuth/Clerk users
    name: v.optional(v.string()),
    subscriptionTier: v.string(), // "free", "pro", "enterprise"
    creditsBalance: v.number(),
    stripeCustomerId: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()), // Admin privileges
    language: v.optional(v.string()), // "nl" (Dutch) or "en" (English), defaults to "nl"
    // OAuth/Clerk fields
    oauthProvider: v.optional(v.string()), // "google", "github", "apple", "clerk"
    oauthProviderId: v.optional(v.string()), // Provider's user ID
    clerkUserId: v.optional(v.string()), // Clerk user ID for quick lookup
    avatarUrl: v.optional(v.string()), // Profile picture URL
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_oauth_provider", ["oauthProvider", "oauthProviderId"])
    .index("by_clerk_user_id", ["clerkUserId"]),

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
    toolType: v.string(), // "translation", "ocr", "image_generation", "headshot", "linkedin", "virtual_tryon"
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

  // Chat conversations
  chatSessions: defineTable({
    userId: v.id("users"),
    title: v.string(), // Auto-generated from first message
    description: v.optional(v.string()),
    messageCount: v.number(),
    totalCreditsUsed: v.number(),
    lastMessageAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Metadata for analytics
    primaryTopic: v.optional(v.string()), // e.g., "business_advice", "technical", "creative"
    tags: v.optional(v.array(v.string())),
    sentiment: v.optional(v.string()), // "positive", "neutral", "negative"
    isArchived: v.boolean(),
    isFavorite: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_updated", ["userId", "updatedAt"])
    .index("by_user_and_topic", ["userId", "primaryTopic"]),

  // Individual chat messages
  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    userId: v.id("users"),
    role: v.string(), // "user", "assistant", "system"
    content: v.string(),
    
    // Thinking/Reasoning (for advanced AI responses)
    thinking: v.optional(v.string()), // Internal reasoning process
    confidence: v.optional(v.number()), // 0-1 confidence score
    
    // Metadata
    creditsUsed: v.number(),
    modelUsed: v.optional(v.string()), // e.g., "gemini-2.5-flash"
    tokensUsed: v.optional(v.number()),
    responseTime: v.optional(v.number()), // milliseconds
    
    // Attachments/Context
    fileIds: v.optional(v.array(v.id("_storage"))),
    contextReferences: v.optional(v.array(v.string())), // References to previous messages
    
    // Quality metrics
    wasHelpful: v.optional(v.boolean()), // User feedback
    userRating: v.optional(v.number()), // 1-5 stars
    
    createdAt: v.number(),
    editedAt: v.optional(v.number()),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_created", ["sessionId", "createdAt"])
    .index("by_user", ["userId"]),

  // Chat analytics aggregations
  chatAnalytics: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD for daily aggregation
    
    // Volume metrics
    totalSessions: v.number(),
    totalMessages: v.number(),
    totalCreditsUsed: v.number(),
    
    // Topic breakdown
    topicBreakdown: v.any(), // { "business": 5, "technical": 3, etc. }
    
    // Engagement metrics
    avgMessagesPerSession: v.number(),
    avgResponseTime: v.number(),
    totalThinkingTime: v.number(), // Sum of all thinking processing
    
    // Quality metrics
    avgConfidence: v.number(),
    helpfulResponses: v.number(),
    totalFeedback: v.number(),
    avgRating: v.number(),
    
    createdAt: v.number(),
  })
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user", ["userId"]),

  // AI Tools Configuration
  aiToolConfigs: defineTable({
    toolId: v.string(), // e.g., "copywriting", "translation"
    enabled: v.boolean(),
    anonymous: v.optional(v.boolean()), // Can be used without authentication
    free: v.optional(v.boolean()), // Free for authenticated users
    paid: v.optional(v.boolean()), // Requires subscription (premium)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tool_id", ["toolId"]),
  
  // AI Tools Metadata (for editing prompts and settings)
  aiTools: defineTable({
    toolId: v.string(), // e.g., "copywriting", "translation"
    name: v.string(), // Display name
    description: v.string(), // Tool description
    category: v.string(), // Category for grouping
    icon: v.optional(v.string()), // Icon identifier
    credits: v.string(), // Credits cost (e.g., "5-10")
    
    // Tool-specific configuration
    defaultPrompt: v.optional(v.string()), // Default AI prompt
    systemPrompt: v.optional(v.string()), // System instructions
    
    // Configuration options
    configOptions: v.optional(v.any()), // Tool-specific settings (JSON)
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tool_id", ["toolId"]),
});
