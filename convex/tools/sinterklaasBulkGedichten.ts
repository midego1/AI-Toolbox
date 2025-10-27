import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * Generate multiple Sinterklaas poems at once (for families/classes)
 */
export const generateBulkGedichten = action({
  args: {
    token: v.string(),
    people: v.array(v.object({
      name: v.string(),
      age: v.optional(v.number()),
      likes: v.optional(v.string()),
      gift: v.optional(v.string()),
      personal_notes: v.optional(v.string()),
    })),
    tone: v.optional(v.union(v.literal("traditioneel"), v.literal("modern"), v.literal("grappig"), v.literal("hartverwarmend"))),
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not authenticated");

    // Higher credits needed for bulk generation
    const creditsNeeded = 5 * args.people.length; // 5 per poem with bulk discount
    if (creditsNeeded < 20) throw new Error("Bulk generation requires at least 4 people");

    const creditBalance = await ctx.runQuery(api.users.getCreditBalance, { token: args.token });
    if (creditBalance < creditsNeeded) throw new Error("Insufficient credits");

    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "bulk_gedichten",
      inputData: args,
    }) as Id<"aiJobs">;

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Generate all poems
      const poems = [];
      for (const person of args.people) {
        const prompt = `Je bent een ervaren Sinterklaas gedichtenmaker. Maak een persoonlijk Sinterklaas gedicht voor:
Naam: ${person.name}
${person.age ? `Leeftijd: ${person.age} jaar` : ""}
${person.likes ? `Interesses: ${person.likes}` : ""}
${person.gift ? `Cadeau: ${person.gift}` : ""}
${person.personal_notes ? `Persoonlijke notities: ${person.personal_notes}` : ""}
Tone: ${args.tone || "traditioneel"}

Het gedicht moet:
- Minimaal 4 coupletten hebben
- Traditioneel rijmend zijn (a-a-b-b)
- Op een positieve en vriendelijke toon zijn
- Refereren aan Sinterklaas tradities
- Persoonlijk en specifiek zijn
- Eindigen met "Piet" als laatste woord

Maak het gedicht in het Nederlands.`;

        const rawPoem = await callOpenRouter(
          [{ role: "user", content: prompt }],
          { model: MODELS.GEMINI_FLASH, temperature: 0.8, maxTokens: 800 }
        );

        const poem = rawPoem
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .replace(/```/g, "")
          .trim();

        poems.push({ name: person.name, poem });
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId: jobId as any,
        description: `Bulk gedichten voor ${args.people.length} personen`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: { poems, total: args.people.length },
        creditsUsed: creditsNeeded,
      });

      return { poems, creditsUsed: creditsNeeded, jobId: jobId as any };
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
