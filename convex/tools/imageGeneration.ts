import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// Image generation tool using OpenAI DALL-E
export const generateImage = action({
  args: {
    token: v.string(),
    prompt: v.string(),
    size: v.optional(v.string()), // "1024x1024", "1792x1024", "1024x1792"
    quality: v.optional(v.string()), // "standard" or "hd"
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session and get user
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Unauthorized");
    }

    const size = args.size || "1024x1024";
    const quality = args.quality || "standard";

    // Create job
    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "image_generation",
      inputData: {
        prompt: args.prompt,
        size,
        quality,
      },
    });

    try {
      // Update job to processing
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Calculate credits based on size and quality
      let creditsNeeded = 10; // Base cost
      if (quality === "hd") {
        creditsNeeded = 20;
      }
      if (size === "1792x1024" || size === "1024x1792") {
        creditsNeeded += 5;
      }

      // Check if user has enough credits
      const creditBalance = await ctx.runQuery(api.users.getCreditBalance, {
        token: args.token,
      });

      if (creditBalance < creditsNeeded) {
        throw new Error("Insufficient credits");
      }

      // Call OpenAI DALL-E API
      const openaiApiKey = process.env.OPENAI_API_KEY;

      let imageUrl: string;

      if (openaiApiKey) {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: args.prompt,
            n: 1,
            size,
            quality,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        imageUrl = data.data[0].url;

        // Download and store the image in Convex storage
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();

        // Upload to Convex storage
        const uploadUrl = await ctx.runMutation(api.files.generateUploadUrl, {
          token: args.token,
        });

        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageBlob.type },
          body: imageBlob,
        });

        const { storageId } = await uploadResponse.json();

        // Update job with storage ID
        await ctx.runMutation(api.aiJobs.updateJobStatus, {
          token: args.token,
          jobId,
          status: "processing",
          outputFileId: storageId,
        });

        // Get the permanent URL
        imageUrl = (await ctx.runQuery(api.files.getFileUrl, {
          token: args.token,
          storageId,
        })) || imageUrl;
      } else {
        // Mock image URL for development
        imageUrl = `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(args.prompt)}`;
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Image generation: ${size} ${quality}`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: {
          imageUrl,
          prompt: args.prompt,
          size,
          quality,
        },
        creditsUsed: creditsNeeded,
      });

      return {
        success: true,
        imageUrl,
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
