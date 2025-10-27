import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * Generate creative surprise (packaging) ideas for Sinterklaas gifts
 */
export const generateSurpriseIdeeen = action({
  args: {
    token: v.string(),
    gift_description: v.string(),
    theme: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("makkelijk"), v.literal("gemiddeld"), v.literal("uitdagend"))),
    budget: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session and get user
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Not authenticated");
    }

    const creditsNeeded = 20;

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
      toolType: "surprise_ideeen",
      inputData: args,
    });

    try {
      // Update job to processing
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      const prompt = `Je bent een creatieve Sinterklaas surprise expert. Genereer verpakkingsideeën voor:
Cadeau: ${args.gift_description}
${args.theme ? `Thema: ${args.theme}` : ""}
${args.difficulty ? `Moeilijkheidsgraad: ${args.difficulty}` : "gemiddeld"}
${args.budget ? `Budget: ${args.budget}` : ""}

Creëer 3 creatieve surprise ideeën. Output ALLEEN JSON:
{
  "ideas": [
    {
      "title": "Naam van de surprise",
      "concept": "Korte beschrijving van het concept",
      "materials": ["benodigd materiaal 1", "materiaal 2"],
      "steps": ["stap 1", "stap 2", "stap 3"],
      "estimated_time": "X minuten",
      "tips": "extra tips"
    }
  ]
}

Maak het INSPIREREND en CREATIEF voor Sinterklaas traditie. Alleen JSON, geen extra tekst.`;

    const rawIdeas = await callOpenRouter(
      [{ role: "user", content: prompt }],
      {
        model: MODELS.GEMINI_FLASH,
        temperature: 0.9,
        maxTokens: 2000,
      }
    );

      // Parse JSON response
      let parsedIdeas;
      try {
        // Try to extract JSON from markdown code blocks
        let jsonStr = rawIdeas;
        const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/) || jsonStr.match(/```\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        }
        parsedIdeas = JSON.parse(jsonStr);
      } catch {
        // If parsing fails, create a fallback structure
        parsedIdeas = {
          ideas: [{
            title: "Surprise Idee",
            concept: rawIdeas,
            materials: [],
            steps: [],
            estimated_time: "30 minuten",
          }]
        };
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Surprise ideeën: ${args.gift_description}`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: parsedIdeas,
        creditsUsed: creditsNeeded,
      });

      return { ideas: parsedIdeas, creditsUsed: creditsNeeded };
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

/**
 * Generate a complete surprise package (combines gift, packaging, and poem)
 */
export const generateCompleteSurprise = action({
  args: {
    token: v.string(),
    name: v.string(),
    age: v.number(),
    interests: v.string(),
    budget: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Similar implementation but for complete packages
    // This is left as a future enhancement
    return { completeSurprise: "Coming soon", creditsUsed: 40 };
  },
});
