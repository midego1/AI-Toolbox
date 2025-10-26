import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// Translation tool using DeepL API
export const translate = action({
  args: {
    token: v.string(),
    text: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
  },
  handler: async (ctx, args) => {
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

      // Call DeepL API (or mock for now)
      const deeplApiKey = process.env.DEEPL_API_KEY;

      let translatedText: string;

      if (deeplApiKey) {
        const response = await fetch("https://api-free.deepl.com/v2/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            auth_key: deeplApiKey,
            text: args.text,
            source_lang: args.sourceLang.toUpperCase(),
            target_lang: args.targetLang.toUpperCase(),
          }),
        });

        if (!response.ok) {
          throw new Error(`DeepL API error: ${response.statusText}`);
        }

        const data = await response.json();
        translatedText = data.translations[0].text;
      } else {
        // Mock translation for development
        translatedText = `[${args.targetLang.toUpperCase()}] ${args.text}`;
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
