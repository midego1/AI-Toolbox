import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * Generate a personalized letter from Sinterklaas to a child
 */
export const generateSinterklaasLetter = action({
  args: {
    token: v.string(),
    child_name: v.string(),
    age: v.number(),
    achievements: v.optional(v.string()),
    behavior_notes: v.optional(v.string()),
    tone: v.optional(v.union(
      v.literal("stimulerend"),
      v.literal("liefdevol"),
      v.literal("grappig"),
      v.literal("educatief")
    )),
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not authenticated");

    const creditsNeeded = 15; // More expensive because includes letter + decoration

    const creditBalance = await ctx.runQuery(api.users.getCreditBalance, { token: args.token });
    if (creditBalance < creditsNeeded) throw new Error("Insufficient credits");

    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "sinterklaas_brief",
      inputData: args,
    }) as Id<"aiJobs">;

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Generate personalized letter
      const prompt = `Je bent Sinterklaas. Schrijf een persoonlijke brief aan ${args.child_name} (${args.age} jaar oud).

${args.achievements ? `Deze prestaties zijn belangrijk: ${args.achievements}` : ""}
${args.behavior_notes ? `Dit gedrag is opgevallen: ${args.behavior_notes}` : ""}

Toon: ${args.tone || "liefdevol"}

De brief moet:
- Persoonlijk en warm zijn
- In de naam van Sinterklaas geschreven
- Specifieke details over het kind bevatten
- De prestaties erkennen
- Positief en bemoedigend zijn
- Elementen uit de Sinterklaas traditie bevatten
- Aanmoedigen om door te gaan met goed gedrag
- Eindigen met een warme groet van Sinterklaas en Piet

Schrijf de brief in het Nederlands, geschikt voor een kind van ${args.age} jaar.`;

      const letter = await callOpenRouter(
        [{ role: "user", content: prompt }],
        { model: MODELS.GEMINI_FLASH, temperature: 0.8, maxTokens: 800 }
      );

      const cleanLetter = letter
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/```/g, "")
        .trim();

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId: jobId as any,
        description: `Sinterklaas brief voor ${args.child_name}`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: { letter: cleanLetter, child_name: args.child_name },
        creditsUsed: creditsNeeded,
      });

      return { letter: cleanLetter, creditsUsed: creditsNeeded, jobId: jobId as any };
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
