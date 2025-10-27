import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * Generate educational content about Sinterklaas traditions
 */
export const getTraditieInfo = action({
  args: {
    token: v.string(),
    topic: v.optional(v.union(
      v.literal("geschiedenis"),
      v.literal("tradities"),
      v.literal("liedjes"),
      v.literal("pieten"),
      v.literal("pakjesavond"),
      v.literal("schoenzetten")
    )),
    age: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify session and get user
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Not authenticated");
    }

    const creditsNeeded = 5;

    // Check credits
    const creditBalance = await ctx.runQuery(api.users.getCreditBalance, {
      token: args.token,
    });

    if (creditBalance < creditsNeeded) {
      throw new Error("Insufficient credits");
    }

    // Create job
    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "sinterklaas_traditie",
      inputData: args,
    });

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      const topicMap: Record<string, string> = {
        geschiedenis: "de geschiedenis en oorsprong van het Sinterklaasfeest",
        tradities: "moderne en traditionele Sinterklaas gebruiken",
        liedjes: "populaire Sinterklaas liedjes en hun betekenis",
        pieten: "het verhaal van Zwarte Piet en de roetveegpieten",
        pakjesavond: "waarom we pakjesavond vieren en wat er gebeurt",
        schoenzetten: "de traditie van schoen zetten en wat Sinterklaas doet",
      };

      const topic = topicMap[args.topic || "tradities"] || topicMap["tradities"];

      const prompt = `Je bent een Sinterklaas traditie expert. Leg uit over ${topic}.

${args.age ? `Pas je uitleg aan voor een leeftijd van ${args.age} jaar.` : ""}

Geef:
1. Een begrijpelijke uitleg
2. Belangrijke feiten
3. Waarom dit belangrijk is voor het feest
4. Hoe families dit traditioneel vieren

Maak het informatief maar ook leuk en toegankelijk. Nederlands, max 300 woorden.`;

    const content = await callOpenRouter(
      [{ role: "user", content: prompt }],
      {
        model: MODELS.GEMINI_FLASH,
        temperature: 0.7,
        maxTokens: 500,
      }
    );

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Sinterklaas traditie: ${args.topic || "tradities"}`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: content,
        creditsUsed: creditsNeeded,
      });

      return { content, creditsUsed: creditsNeeded };
    } catch (error: any) {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "failed",
        errorMessage: error.message,
      });

      throw error;
    }
  },
});

/**
 * Generate a Sinterklaas quiz for children
 */
export const generateQuiz = action({
  args: {
    token: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    number_of_questions: v.optional(v.number()),
    theme: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const creditsNeeded = 12;
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not authenticated");

    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "sinterklaas_quiz",
      inputData: args,
    });

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: "Quiz generator coming soon",
        creditsUsed: creditsNeeded,
      });

      return { quiz: "Coming soon", creditsUsed: creditsNeeded };
    } catch (error: any) {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "failed",
        errorMessage: error.message,
      });
      throw error;
    }
  },
});
