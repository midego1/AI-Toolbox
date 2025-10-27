import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * Generate personalized gift suggestions for Sinterklaas
 */
export const generateCadeautips = action({
  args: {
    token: v.string(),
    age: v.number(),
    interests: v.optional(v.string()),
    budget_min: v.optional(v.number()),
    budget_max: v.optional(v.number()),
    recipient_name: v.optional(v.string()),
    occasion: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session and get user
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Not authenticated");
    }

    const creditsNeeded = 15;

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
      toolType: "cadeautips",
      inputData: args,
    });

    try {
      // Update job to processing
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      const prompt = `Je bent een Sinterklaas cadeauspecialist. Genereer gepersonaliseerde cadeautips voor:
Leeftijd: ${args.age} jaar
${args.interests ? `Interesses: ${args.interests}` : ""}
${args.budget_min && args.budget_max ? `Budget: €${args.budget_min} - €${args.budget_max}` : ""}
${args.recipient_name ? `Voor: ${args.recipient_name}` : ""}
${args.occasion ? `Gelegenheid: ${args.occasion}` : ""}

Geef 5-7 concreet cadeausuggesties als JSON array:
[
  {
    "name": "Naam van het cadeau",
    "description": "Beschrijving waarom dit goed is",
    "approximate_price": 25,
    "category": "speelgoed"
  }
]

Beschikbare categories: speelgoed, boeken, creatief, educatief, lekkernijen, sinterklaas
Nederlandse taal, specifiek voor Nederlandse markt. Alleen JSON output, geen extra tekst.`;

      const rawSuggestions = await callOpenRouter(
        [{ role: "user", content: prompt }],
        {
          model: MODELS.GEMINI_FLASH,
          temperature: 0.7,
          maxTokens: 1500,
        }
      );

      // Parse JSON response - the AI should return a JSON array
      let parsedSuggestions;
      try {
        // Try to extract JSON from markdown code blocks
        let jsonStr = rawSuggestions;
        const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/) || jsonStr.match(/```\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1];
        }
        const parsed = JSON.parse(jsonStr);
        // Wrap in items array if needed
        parsedSuggestions = { items: Array.isArray(parsed) ? parsed : [parsed] };
      } catch {
        // If parsing fails, create a fallback structure
        parsedSuggestions = {
          items: rawSuggestions.split('\n').filter(l => l.trim()).map((line, i) => ({
            name: line.replace(/^[-•]\s*/, '').trim(),
            description: '',
            category: 'overig',
            approximate_price: 0,
          }))
        };
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Cadeautips voor ${args.age} jaar`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: parsedSuggestions,
        creditsUsed: creditsNeeded,
      });

      return { suggestions: parsedSuggestions, creditsUsed: creditsNeeded };
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
