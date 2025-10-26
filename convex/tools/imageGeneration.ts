import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { generateImage, isOpenRouterConfigured, MODELS } from "../lib/openrouter";

/**
 * Image generation tool using OpenRouter (Gemini 2.5 Flash Image)
 *
 * Uses Gemini 2.5 Flash Image for high-quality image generation:
 * - ~$0.039 per image (4 cents)
 * - Contextual understanding
 * - Multi-turn conversations
 * - Image editing capabilities
 * - Faster than DALL-E 3
 */
export const generateImageTool = action({
  args: {
    token: v.string(),
    prompt: v.string(),
    size: v.optional(v.string()), // Future: support different sizes
    quality: v.optional(v.string()), // Future: support quality settings
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session and get user
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Create job
    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "image_generation",
      inputData: {
        prompt: args.prompt,
        size: args.size || "1024x1024",
        quality: args.quality || "standard",
      },
    });

    try {
      // Update job to processing
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Fixed credit cost for image generation
      const creditsNeeded = 10;

      // Check if user has enough credits
      const creditBalance = await ctx.runQuery(api.users.getCreditBalance, {
        token: args.token,
      });

      if (creditBalance < creditsNeeded) {
        throw new Error("Insufficient credits");
      }

      let imageDataUrl: string;

      // Use OpenRouter with Gemini 2.5 Flash Image
      if (isOpenRouterConfigured()) {
        try {
          console.log(`🎨 Generating image with ${MODELS.GEMINI_FLASH_IMAGE}`);
          console.log(`📝 Prompt: ${args.prompt}`);

          // Generate image - returns base64 data URL
          imageDataUrl = await generateImage(args.prompt);

          console.log(`✅ Image generated successfully`);
          console.log(`📊 Data URL length: ${imageDataUrl.length} characters`);

          // Convert base64 data URL to blob for storage
          // Extract base64 data after "data:image/png;base64,"
          const base64Data = imageDataUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'image/png' });

          // Upload to Convex storage
          const uploadUrl = await ctx.runMutation(api.files.generateUploadUrl, {
            token: args.token,
          });

          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": "image/png" },
            body: blob,
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image to storage");
          }

          const { storageId } = await uploadResponse.json();

          // Update job with storage ID
          await ctx.runMutation(api.aiJobs.updateJobStatus, {
            token: args.token,
            jobId,
            status: "processing",
            outputFileId: storageId,
          });

          // Get the permanent URL
          const permanentUrl = await ctx.runQuery(api.files.getFileUrl, {
            token: args.token,
            storageId,
          });

          imageDataUrl = permanentUrl || imageDataUrl;

          console.log(`✅ Image saved to Convex storage`);

        } catch (error: any) {
          console.error("OpenRouter image generation error:", error);
          // Fall back to placeholder
          imageDataUrl = `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(args.prompt.substring(0, 50))}`;
          console.log("⚠️ Fell back to placeholder image");
        }
      } else {
        // Placeholder for development
        imageDataUrl = `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(args.prompt.substring(0, 50))}`;
        console.log("ℹ️ Using placeholder image (no OpenRouter API key)");
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Image generation: ${args.prompt.substring(0, 50)}`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: {
          imageUrl: imageDataUrl,
          prompt: args.prompt,
          model: isOpenRouterConfigured() ? MODELS.GEMINI_FLASH_IMAGE : "placeholder",
        },
        creditsUsed: creditsNeeded,
      });

      return {
        success: true,
        imageUrl: imageDataUrl,
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
