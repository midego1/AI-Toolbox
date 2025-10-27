import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

/**
 * Generate illustration of filled Dutch wooden clogs (schoen met lekkernijen)
 */
export const generateSchoentjeTekening = action({
  args: {
    token: v.string(),
    treats: v.string(), // "chocolademunten, pepernoten, speelgoed"
    decorative_elements: v.optional(v.string()), // "glitter, strikken"
    style: v.optional(v.string()), // "traditional", "modern", "whimsical"
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not authenticated");

    const creditsNeeded = 18; // Visual content

    const creditBalance = await ctx.runQuery(api.users.getCreditBalance, { token: args.token });
    if (creditBalance < creditsNeeded) throw new Error("Insufficient credits");

    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "schoentje_tekening",
      inputData: args,
    }) as Id<"aiJobs">;

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Generate image using existing image generation
      const imagePrompt = `Generate a beautiful illustration of a traditional Dutch wooden clog (klomp) filled with Sinterklaas treats: ${args.treats}. ${args.decorative_elements ? `Decorative elements: ${args.decorative_elements}.` : ""} Style: ${args.style || "warm and festive traditional Dutch aesthetic"}. Cozy setting, warm lighting, traditional elements. High quality, detailed, suitable for printing or digital sharing.`;

      const imageResult = await ctx.runAction(api.tools.imageGeneration.generateImageTool, {
        token: args.token,
        prompt: imagePrompt,
        size: "1024x1024",
      });

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId: jobId as any,
        description: `Schoentje met ${args.treats}`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: { imageUrl: imageResult.imageUrl, treats: args.treats },
        creditsUsed: creditsNeeded,
      });

      return { imageUrl: imageResult.imageUrl, creditsUsed: creditsNeeded, jobId: jobId as any };
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

