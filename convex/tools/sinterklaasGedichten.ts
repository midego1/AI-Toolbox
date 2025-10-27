import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * Generate a personalized Sinterklaas poem (gedicht) for a specific person
 */
export const generateGedicht = action({
  args: {
    token: v.string(),
    name: v.string(),
    age: v.optional(v.number()),
    likes: v.optional(v.string()),
    gift: v.optional(v.string()),
    personal_notes: v.optional(v.string()),
    tone: v.optional(v.union(v.literal("traditioneel"), v.literal("modern"), v.literal("grappig"), v.literal("hartverwarmend"))),
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session and get user ID (works with both Clerk and legacy auth)
    const userId = await ctx.runMutation(api.auth.getUserIdFromToken, { token: args.token });
    
    // Get user details for logging
    const user = await ctx.runQuery(api.clerk.getUserProfileById, { userId });
    if (!user) {
      throw new Error("User not found");
    }

    const creditsNeeded = 10;

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
      toolType: "sinterklaas_gedicht",
      inputData: args,
    }) as Id<"aiJobs">;

    try {
      // Update job to processing
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Create AI prompt for Sinterklaas poem
      const prompt = `Je bent een ervaren Sinterklaas gedichtenmaker. Maak een persoonlijk Sinterklaas gedicht voor:
Naam: ${args.name}
${args.age ? `Leeftijd: ${args.age} jaar` : ""}
${args.likes ? `Interesses: ${args.likes}` : ""}
${args.gift ? `Cadeau: ${args.gift}` : ""}
${args.personal_notes ? `Persoonlijke notities: ${args.personal_notes}` : ""}
Tone: ${args.tone || "traditioneel"}

BELANGRIJK: Het gedicht MOET PERFECT RIJMEN in het traditionele a-a-b-b patroon!

Voorbeeld van het rijmstructuur:
Regel 1: eindigt op woord A (bijv. "schoen")
Regel 2: eindigt op woord B (bijv. "mijn")
Regel 3: eindigt op woord B (bijv. "zijn")
Regel 4: eindigt op woord A (bijv. "regen")

Dit patroon herhaalt zich voor elk couplet.

Het gedicht moet:
- Minimaal 4 coupletten hebben
- PERFECT rijmend zijn (a-a-b-b patroon)
- Elke regel moet echt rijmen - controleer dit!
- Op een positieve en vriendelijke toon zijn
- Refereren aan Sinterklaas tradities
- Persoonlijk en specifiek zijn voor de persoon
- Eindigen met "Piet" als laatste woord

Maak het gedicht in het Nederlands. Zorg dat het PERFECT rijmt!`;

      // Call OpenRouter API using helper function
      const rawPoem = await callOpenRouter(
        [{ role: "user", content: prompt }],
        {
          model: MODELS.GEMINI_FLASH,
          temperature: 0.8,
          maxTokens: 1000,
        }
      );

      // Clean up the poem - remove any markdown formatting or JSON wrapping
      const poem = rawPoem
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/```/g, "")
        .trim();

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId: jobId as any,
        description: `Sinterklaas gedicht: ${args.name}`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: {
          poem,
          name: args.name,
        },
        creditsUsed: creditsNeeded,
      });

      return { poem, creditsUsed: creditsNeeded, jobId: jobId as any };
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
