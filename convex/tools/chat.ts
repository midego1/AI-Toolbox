import { v } from "convex/values";
import { action, mutation, query, internalMutation, internalQuery } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { verifySession } from "../auth";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * CHAT SYSTEM - Advanced AI Assistant with Thinking & Advice
 * 
 * Features:
 * - Multi-turn conversations with context
 * - Internal reasoning/thinking process
 * - Confidence scoring
 * - Topic classification
 * - Automatic title generation
 * - Full history tracking
 */

const CHAT_CREDITS_PER_MESSAGE = 2; // Base cost
const THINKING_MODE_MULTIPLIER = 1.5; // Extra cost for thinking mode

/**
 * Create a new chat session
 */
export const createChatSession = mutation({
  args: {
    token: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);

    const sessionId = await ctx.db.insert("chatSessions", {
      userId,
      title: args.title || "New Chat",
      description: args.description,
      messageCount: 0,
      totalCreditsUsed: 0,
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isArchived: false,
      isFavorite: false,
    });

    return sessionId;
  },
});

/**
 * Send a message and get AI response with thinking
 */
export const sendMessage = action({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
    message: v.string(),
    includeThinking: v.optional(v.boolean()), // Show reasoning process
    systemPrompt: v.optional(v.string()), // Custom system instructions
  },
  handler: async (ctx, args): Promise<{
    messageId: any;
    response: string;
    thinking?: string;
    creditsUsed: number;
    responseTime: number;
  }> => {
    // Verify session and get user
    const userId = await ctx.runMutation(api.auth.getUserIdFromToken, {
      token: args.token,
    });

    // Check credits
    const user = await ctx.runQuery(api.users.getUserProfile, {
      token: args.token,
    });
    const creditsNeeded = args.includeThinking
      ? Math.ceil(CHAT_CREDITS_PER_MESSAGE * THINKING_MODE_MULTIPLIER)
      : CHAT_CREDITS_PER_MESSAGE;

    if (user.creditsBalance < creditsNeeded) {
      throw new Error("Insufficient credits");
    }

    // Get conversation history (last 10 messages for context)
    const history = await ctx.runQuery(internal.tools.chat.getSessionMessagesInternal, {
      token: args.token,
      sessionId: args.sessionId,
      limit: 10,
    });

    // Build messages array
    const systemMessage = args.systemPrompt || `You are an advanced AI assistant providing thoughtful advice and insights. When thinking mode is enabled, you should:
1. Show your reasoning process step-by-step
2. Consider multiple perspectives
3. Cite relevant factors in your decision-making
4. Be honest about limitations and uncertainties

Be helpful, accurate, and insightful. Break down complex topics clearly.`;

    const messages = [
      { role: "system" as const, content: systemMessage },
      ...history.messages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: args.message },
    ];

    // Call AI with thinking mode
    let thinking = undefined;
    let assistantResponse = "";

    try {
      const startTime = Date.now();

      if (args.includeThinking) {
        // First, generate thinking process
        const thinkingMessages = [
          ...messages,
          {
            role: "user" as const,
            content: "Before answering, explain your thinking process and reasoning. What factors are you considering?",
          },
        ];

        thinking = await callOpenRouter(thinkingMessages, {
          model: MODELS.GEMINI_FLASH,
          temperature: 0.7,
          maxTokens: 500,
        });

        // Now get actual response with thinking context
        const finalMessages = [
          ...messages,
          { role: "assistant" as const, content: `[Internal thinking: ${thinking}]` },
        ];

        assistantResponse = await callOpenRouter(finalMessages, {
          model: MODELS.GEMINI_FLASH,
          temperature: 0.7,
          maxTokens: 1000,
        });
      } else {
        // Direct response without thinking
        assistantResponse = await callOpenRouter(messages, {
          model: MODELS.GEMINI_FLASH,
          temperature: 0.7,
          maxTokens: 1000,
        });
      }

      const responseTime = Date.now() - startTime;

      // Save user message
      await ctx.runMutation(internal.tools.chat.addMessage, {
        token: args.token,
        sessionId: args.sessionId,
        role: "user",
        content: args.message,
        creditsUsed: 0,
      });

      // Save assistant message
      const messageId = await ctx.runMutation(internal.tools.chat.addMessage, {
        token: args.token,
        sessionId: args.sessionId,
        role: "assistant",
        content: assistantResponse,
        thinking,
        creditsUsed: creditsNeeded,
        modelUsed: MODELS.GEMINI_FLASH,
        responseTime,
      });

      // Create a temporary job for credit tracking
      const jobId = await ctx.runMutation(api.aiJobs.createJob, {
        token: args.token,
        toolType: "ai_chat",
        inputData: { message: args.message, includeThinking: args.includeThinking },
      });

      // Update job status
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: { response: assistantResponse, thinking },
        creditsUsed: creditsNeeded,
      });

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `AI Chat - ${args.includeThinking ? "with thinking" : "standard"}`,
      });

      // Update session
      await ctx.runMutation(internal.tools.chat.updateSessionMetadata, {
        token: args.token,
        sessionId: args.sessionId,
        messageCount: history.messages.length + 2, // +2 for user and assistant
        creditsUsed: creditsNeeded,
      });

      // If first message, auto-generate title
      if (history.messages.length === 0) {
        await ctx.scheduler.runAfter(0, api.tools.chat.generateSessionTitle, {
          token: args.token,
          sessionId: args.sessionId,
          firstMessage: args.message,
        });
      }

      return {
        messageId,
        response: assistantResponse,
        thinking,
        creditsUsed: creditsNeeded,
        responseTime,
      };
    } catch (error: any) {
      console.error("Chat error:", error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  },
});

/**
 * Add a message to a session (internal mutation)
 */
export const addMessage = internalMutation({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
    role: v.string(),
    content: v.string(),
    thinking: v.optional(v.string()),
    confidence: v.optional(v.number()),
    fileIds: v.optional(v.array(v.id("_storage"))),
    creditsUsed: v.number(),
    modelUsed: v.optional(v.string()),
    responseTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);

    const messageId = await ctx.db.insert("chatMessages", {
      sessionId: args.sessionId,
      userId,
      role: args.role,
      content: args.content,
      thinking: args.thinking,
      confidence: args.confidence,
      fileIds: args.fileIds,
      creditsUsed: args.creditsUsed,
      modelUsed: args.modelUsed,
      responseTime: args.responseTime,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

/**
 * Update session metadata
 */
export const updateSessionMetadata = internalMutation({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
    messageCount: v.optional(v.number()),
    creditsUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
      lastMessageAt: Date.now(),
    };

    if (args.messageCount !== undefined) {
      updates.messageCount = args.messageCount;
    }

    if (args.creditsUsed !== undefined) {
      updates.totalCreditsUsed = session.totalCreditsUsed + args.creditsUsed;
    }

    await ctx.db.patch(args.sessionId, updates);
  },
});

/**
 * Auto-generate session title from first message
 */
export const generateSessionTitle = action({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
    firstMessage: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const title = await callOpenRouter(
        [
          {
            role: "system",
            content:
              "Generate a short, descriptive title (3-6 words) for this chat session based on the user's first message. Only output the title, nothing else.",
          },
          { role: "user", content: args.firstMessage },
        ],
        {
          model: MODELS.GEMINI_FLASH_LITE,
          temperature: 0.5,
          maxTokens: 50,
        }
      );

      await ctx.runMutation(internal.tools.chat.updateSessionTitle, {
        token: args.token,
        sessionId: args.sessionId,
        title: title.trim(),
      });
    } catch (error) {
      console.error("Failed to generate title:", error);
      // Fail silently - not critical
    }
  },
});

/**
 * Update session title
 */
export const updateSessionTitle = internalMutation({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get all user's chat sessions
 */
export const getChatSessions = query({
  args: {
    token: v.string(),
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 50;

    let sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user_and_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    if (!args.includeArchived) {
      sessions = sessions.filter((s) => !s.isArchived);
    }

    return sessions;
  },
});

/**
 * Get messages for a session (internal query for use within actions)
 */
export const getSessionMessagesInternal = internalQuery({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session_and_created", (q) =>
        q.eq("sessionId", args.sessionId)
      )
      .order("asc")
      .take(args.limit || 100);

    return { session, messages };
  },
});

/**
 * Get messages for a session (public query)
 */
export const getSessionMessages = query({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session_and_created", (q) =>
        q.eq("sessionId", args.sessionId)
      )
      .order("asc")
      .take(args.limit || 100);

    return { session, messages };
  },
});

/**
 * Rate a message (thumbs up/down)
 */
export const rateMessage = mutation({
  args: {
    token: v.string(),
    messageId: v.id("chatMessages"),
    helpful: v.boolean(),
    rating: v.optional(v.number()), // 1-5 stars
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const message = await ctx.db.get(args.messageId);

    if (!message || message.userId !== userId) {
      throw new Error("Message not found");
    }

    await ctx.db.patch(args.messageId, {
      wasHelpful: args.helpful,
      userRating: args.rating,
    });
  },
});

/**
 * Archive/unarchive session
 */
export const toggleArchiveSession = mutation({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      isArchived: args.archived,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Favorite/unfavorite session
 */
export const toggleFavoriteSession = mutation({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
    favorite: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      isFavorite: args.favorite,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update session tags
 */
export const updateSessionTags = mutation({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      tags: args.tags,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete session (and all messages)
 */
export const deleteSession = mutation({
  args: {
    token: v.string(),
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const session = await ctx.db.get(args.sessionId);

    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    // Delete all messages
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete session
    await ctx.db.delete(args.sessionId);
  },
});

/**
 * Search chat history
 */
export const searchChatHistory = query({
  args: {
    token: v.string(),
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);
    const limit = args.limit || 20;

    // Get all user messages
    const allMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Simple text search (in production, use full-text search)
    const searchLower = args.searchQuery.toLowerCase();
    const matches = allMessages
      .filter((m) => m.content.toLowerCase().includes(searchLower))
      .slice(0, limit);

    // Get sessions for matched messages
    const sessionIds = [...new Set(matches.map((m) => m.sessionId))];
    const sessions = await Promise.all(
      sessionIds.map((id) => ctx.db.get(id))
    );

    return matches.map((message) => ({
      message,
      session: sessions.find((s) => s?._id === message.sessionId),
    }));
  },
});

/**
 * Get chat analytics
 */
export const getChatAnalytics = query({
  args: {
    token: v.string(),
    timeRange: v.optional(v.string()), // "7d", "30d", "90d", "all"
  },
  handler: async (ctx, args) => {
    const userId = await verifySession(ctx, args.token);

    const now = Date.now();
    const timeThresholds: Record<string, number> = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };

    const threshold =
      now - (timeThresholds[args.timeRange || "30d"] || timeThresholds["30d"]);

    // Get all sessions in time range
    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("createdAt"), threshold))
      .collect();

    // Get all messages in time range
    const allMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("createdAt"), threshold))
      .collect();

    // Calculate metrics
    const totalSessions = sessions.length;
    const totalMessages = allMessages.length;
    const totalCreditsUsed = sessions.reduce(
      (sum, s) => sum + s.totalCreditsUsed,
      0
    );
    const avgMessagesPerSession =
      totalSessions > 0 ? totalMessages / totalSessions : 0;

    const assistantMessages = allMessages.filter((m) => m.role === "assistant");
    const avgResponseTime =
      assistantMessages.length > 0
        ? assistantMessages.reduce((sum, m) => sum + (m.responseTime || 0), 0) /
          assistantMessages.length
        : 0;

    const messagesWithFeedback = allMessages.filter(
      (m) => m.wasHelpful !== undefined
    );
    const helpfulResponses = messagesWithFeedback.filter(
      (m) => m.wasHelpful
    ).length;
    const helpfulnessRate =
      messagesWithFeedback.length > 0
        ? helpfulResponses / messagesWithFeedback.length
        : 0;

    const messagesWithRating = allMessages.filter((m) => m.userRating);
    const avgRating =
      messagesWithRating.length > 0
        ? messagesWithRating.reduce((sum, m) => sum + (m.userRating || 0), 0) /
          messagesWithRating.length
        : 0;

    const messagesWithConfidence = allMessages.filter((m) => m.confidence);
    const avgConfidence =
      messagesWithConfidence.length > 0
        ? messagesWithConfidence.reduce(
            (sum, m) => sum + (m.confidence || 0),
            0
          ) / messagesWithConfidence.length
        : 0;

    // Get daily breakdown
    const dailyStats: Record<string, any> = {};
    sessions.forEach((session) => {
      const date = new Date(session.createdAt).toISOString().split("T")[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { sessions: 0, messages: 0, credits: 0 };
      }
      dailyStats[date].sessions++;
      dailyStats[date].messages += session.messageCount;
      dailyStats[date].credits += session.totalCreditsUsed;
    });

    return {
      totalSessions,
      totalMessages,
      totalCreditsUsed,
      avgMessagesPerSession: Math.round(avgMessagesPerSession * 10) / 10,
      avgResponseTime: Math.round(avgResponseTime),
      helpfulResponses,
      helpfulnessRate: Math.round(helpfulnessRate * 100),
      avgRating: Math.round(avgRating * 10) / 10,
      avgConfidence: Math.round(avgConfidence * 100),
      dailyStats: Object.entries(dailyStats)
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      favoriteCount: sessions.filter((s) => s.isFavorite).length,
    };
  },
});

