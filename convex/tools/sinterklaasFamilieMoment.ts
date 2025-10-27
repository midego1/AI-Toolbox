import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * Generate family Sinterklaas celebration scene illustration
 */
export const generateFamilieMoment = action({
  args: {
    token: v.string(),
    description: v.string(), // "family celebrating with Sinterklaas, opening gifts"
    style: v.optional(v.union(
      v.literal("realistisch"),
      v.literal("cartoon"),
      v.literal("artistiek"),
      v.literal("traditioneel")
    )),
    setting: v.optional(v.string()), // "living room", "traditional Dutch home"
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not authenticated");

    const creditsNeeded = 20; // Visual content costs more

    const creditBalance = await ctx.runQuery(api.users.getCreditBalance, { token: args.token });
    if (creditBalance < creditsNeeded) throw new Error("Insufficient credits");

    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "familie_moment",
      inputData: args,
    }) as Id<"aiJobs">;

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Use existing image generation infrastructure
      const imagePrompt = `Generate a high-quality illustration of a family celebrating Sinterklaas: ${args.description}. Style: ${args.style || "warm and festive"}. Setting: ${args.setting || "cozy Dutch living room"}. Traditional Sinterklaas elements like gifts, treats, festive decorations. Warm lighting, joyful atmosphere, detailed characters.`;

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
        description: `Familie Sinterklaas moment`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: { imageUrl: imageResult.imageUrl, description: args.description },
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
