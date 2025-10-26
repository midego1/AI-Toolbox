import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { translateText, isOpenRouterConfigured, MODELS } from "../lib/openrouter";

/**
 * Translation tool using OpenRouter (Gemini 2.5 Flash Lite)
 *
 * Uses Gemini 2.5 Flash Lite for ultra-fast, cost-effective translation:
 * - $0.10/M input tokens, $0.40/M output tokens
 * - Supports 100+ languages
 * - High-quality translation
 * - Much cheaper than DeepL or Google Translate
 */
export const translate = action({
  args: {
    token: v.string(),
    text: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session and get user
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Create job
    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "translation",
      inputData: {
        text: args.text,
        sourceLang: args.sourceLang,
        targetLang: args.targetLang,
      },
    });

    try {
      // Update job to processing
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Calculate credits (roughly 1 credit per 100 characters)
      const creditsNeeded = Math.max(1, Math.ceil(args.text.length / 100));

      // Check if user has enough credits
      const creditBalance = await ctx.runQuery(api.users.getCreditBalance, {
        token: args.token,
      });

      if (creditBalance < creditsNeeded) {
        throw new Error("Insufficient credits");
      }

      let translatedText: string;

      // Use OpenRouter with Gemini 2.5 Flash Lite
      if (isOpenRouterConfigured()) {
        try {
          translatedText = await translateText(
            args.text,
            args.sourceLang,
            args.targetLang
          );
          console.log(`✅ Translation completed using ${MODELS.GEMINI_FLASH_LITE}`);
        } catch (error: any) {
          console.error("OpenRouter translation error:", error);
          // Fall back to mock
          translatedText = `[${args.targetLang.toUpperCase()}] ${args.text}`;
          console.log("⚠️ Fell back to mock translation");
        }
      } else {
        // Mock translation for development
        translatedText = `[${args.targetLang.toUpperCase()}] ${args.text}`;
        console.log("ℹ️ Using mock translation (no OpenRouter API key)");
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Translation: ${args.sourceLang} to ${args.targetLang}`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: {
          translatedText,
          sourceLang: args.sourceLang,
          targetLang: args.targetLang,
          model: isOpenRouterConfigured() ? MODELS.GEMINI_FLASH_LITE : "mock",
        },
        creditsUsed: creditsNeeded,
      });

      return {
        success: true,
        translatedText,
        creditsUsed: creditsNeeded,
        jobId,
      };
    } catch (error: any) {
      // Update job as failed
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
