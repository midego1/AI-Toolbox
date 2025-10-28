import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

/**
 * Generate Sinterklaas character illustrations
 */
export const generateSinterklaasIllustratie = action({
  args: {
    token: v.string(),
    pose: v.string(), // "standing with staff", "waving", "with Piet"
    style: v.optional(v.union(
      v.literal("realistisch"),
      v.literal("cartoon"),
      v.literal("traditioneel"),
      v.literal("modern")
    )),
    background: v.optional(v.string()), // "Dutch city", "Spanish orange grove", "winter scene"
    additional_elements: v.optional(v.string()), // "steamer, horse, gifts"
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not authenticated");

    const creditsNeeded = 15; // Simple character illustration

    const creditBalance = await ctx.runQuery(api.users.getCreditBalance, { token: args.token });
    if (creditBalance < creditsNeeded) throw new Error("Insufficient credits");

    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "sinterklaas_illustratie",
      inputData: args,
    }) as Id<"aiJobs">;

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Generate image
      const imagePrompt = `Generate a beautiful illustration of Sinterklaas (Dutch Santa Claus) ${args.pose}. Style: ${args.style || "traditional warm Dutch aesthetic"}. Background: ${args.background || "festive Dutch setting"}. ${args.additional_elements ? `Also include: ${args.additional_elements}.` : ""} High quality, detailed, suitable for printing or sharing. Traditional bishop robes, staff, warm expression.`;

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
        description: `Sinterklaas illustratie: ${args.pose}`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: { imageUrl: imageResult.imageUrl, pose: args.pose },
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




