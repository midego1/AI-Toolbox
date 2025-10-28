import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

/**
 * Lootjestrekken - Random gift assignment for Sinterklaas
 */
export const generateLootjestrekken = action({
  args: {
    token: v.string(),
    participants: v.array(v.string()), // List of names
    restrictions: v.optional(v.array(v.object({
      name: v.string(),
      cannot_get: v.array(v.string()),
    }))),
    budget: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) throw new Error("Not authenticated");

    const creditsNeeded = 8; // Simple algorithm

    const creditBalance = await ctx.runQuery(api.users.getCreditBalance, { token: args.token });
    if (creditBalance < creditsNeeded) throw new Error("Insufficient credits");

    if (args.participants.length < 2) {
      throw new Error("Er zijn minimaal 2 deelnemers nodig");
    }

    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "lootjestrekken",
      inputData: args,
    }) as Id<"aiJobs">;

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Shuffle the participants array
      const shuffled = [...args.participants].sort(() => Math.random() - 0.5);
      
      // Create assignments
      const assignments = [];
      
      // Try to satisfy restrictions
      const attempts = 20;
      let validAssignment = false;
      let finalAssignments = [];
      
      for (let attempt = 0; attempt < attempts && !validAssignment; attempt++) {
        const shuffledList = [...args.participants].sort(() => Math.random() - 0.5);
        const tempAssignments: any[] = [];
        
        for (let i = 0; i < shuffledList.length; i++) {
          const giver = shuffledList[i];
          const receiver = shuffledList[(i + 1) % shuffledList.length];
          tempAssignments.push({ giver, receiver });
        }
        
        // Check if restrictions are satisfied
        const restrictionsSatisfied = !args.restrictions || args.restrictions.every(restriction => {
          const assignment = tempAssignments.find(a => a.giver === restriction.name);
          return !assignment || !restriction.cannot_get.includes(assignment.receiver);
        });
        
        if (restrictionsSatisfied) {
          finalAssignments = tempAssignments;
          validAssignment = true;
        }
      }
      
      // If no valid assignment found, use the last attempt anyway
      if (!validAssignment && finalAssignments.length === 0) {
        for (let i = 0; i < shuffled.length; i++) {
          const giver = shuffled[i];
          const receiver = shuffled[(i + 1) % shuffled.length];
          finalAssignments.push({ giver, receiver });
        }
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId: jobId as any,
        description: `Lootjestrekken voor ${args.participants.length} personen`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: { assignments: finalAssignments, participants: args.participants },
        creditsUsed: creditsNeeded,
      });

      return { assignments: finalAssignments, creditsUsed: creditsNeeded, jobId: jobId as any };
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




