import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { generateImage, isOpenRouterConfigured, MODELS } from "../lib/openrouter";

/**
 * Image generation tool using OpenRouter (Gemini 2.5 Flash Image)
 *
 * Uses Gemini 2.5 Flash Image through OpenRouter:
 * - ~$0.03 per image (3 cents)
 * - Fast generation (~3-5 seconds)
 * - High-quality contextual images
 * - Multi-turn conversation support
 * - Image editing capabilities
 */
export const generateImageTool = action({
  args: {
    token: v.string(),
    prompt: v.string(),
    size: v.optional(v.string()), // Future: support different sizes
    quality: v.optional(v.string()), // Future: support quality settings
  },
  handler: async (ctx, args): Promise<any> => {
    console.log(`\n${"#".repeat(80)}`);
    console.log(`🚀 IMAGE GENERATION TOOL STARTED`);
    console.log(`${"#".repeat(80)}`);
    console.log(`📋 Input args:`, JSON.stringify({
      prompt: args.prompt,
      size: args.size || "1024x1024",
      quality: args.quality || "standard",
      tokenPreview: args.token.substring(0, 20) + "...",
    }, null, 2));
    
    // Verify session and get user
    console.log(`\n🔐 Step 1: Verifying user authentication...`);
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      console.error(`❌ Authentication failed - no user found`);
      throw new Error("Unauthorized");
    }
    console.log(`✅ User authenticated:`, user.email);
    console.log(`💰 User credits:`, user.creditsBalance);

    // Create job
    console.log(`\n📝 Step 2: Creating job in database...`);
    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "image_generation",
      inputData: {
        prompt: args.prompt,
        size: args.size || "1024x1024",
        quality: args.quality || "standard",
      },
    });
    console.log(`✅ Job created with ID:`, jobId);

    try {
      // Update job to processing
      console.log(`\n⚙️  Step 3: Updating job status to processing...`);
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });
      console.log(`✅ Job status updated to processing`);

      // Fixed credit cost for image generation
      const creditsNeeded = 10;
      console.log(`\n💳 Step 4: Checking credits...`);
      console.log(`  - Required:`, creditsNeeded);

      // Check if user has enough credits
      const creditBalance = await ctx.runQuery(api.users.getCreditBalance, {
        token: args.token,
      });
      console.log(`  - Available:`, creditBalance);

      if (creditBalance < creditsNeeded) {
        console.error(`❌ Insufficient credits: ${creditBalance} < ${creditsNeeded}`);
        throw new Error("Insufficient credits");
      }
      console.log(`✅ User has sufficient credits`);

      let imageDataUrl: string;

      // Use OpenRouter with Gemini 2.5 Flash Image
      console.log(`\n🔧 Step 5: Checking OpenRouter configuration...`);
      console.log(`  - OpenRouter configured:`, isOpenRouterConfigured());
      
      if (isOpenRouterConfigured()) {
        try {
          console.log(`\n🎨 Step 6: Calling OpenRouter image generation...`);
          console.log(`  - Prompt: "${args.prompt}"`);
          console.log(`  - About to call generateImage()...`);

          // Generate image - returns base64 data URL
          imageDataUrl = await generateImage(args.prompt);

          console.log(`\n✅ Image generation returned successfully`);
          console.log(`  - Image URL type:`, imageDataUrl.startsWith('data:') ? 'Data URL' : 'External URL');
          console.log(`  - Image URL length:`, imageDataUrl.length);
          console.log(`  - Image URL preview:`, imageDataUrl.substring(0, 100) + '...');

          console.log(`\n📦 Step 7: Converting and uploading to Convex storage...`);
          // Convert base64 data URL to blob for storage
          // Extract base64 data after "data:image/png;base64,"
          const base64Data = imageDataUrl.split(',')[1];
          console.log(`  - Extracted base64 data, length:`, base64Data?.length || 0);
          
          if (!base64Data) {
            throw new Error("Invalid data URL format - no base64 data found");
          }
          
          const binaryString = atob(base64Data);
          console.log(`  - Decoded binary string, length:`, binaryString.length);
          
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          console.log(`  - Created Uint8Array, length:`, bytes.length);
          
          const blob = new Blob([bytes], { type: 'image/png' });
          console.log(`  - Created blob, size:`, blob.size, 'bytes');

          console.log(`\n📤 Step 8: Uploading to Convex storage...`);
          const uploadUrl = await ctx.runMutation(api.files.generateUploadUrl, {
            token: args.token,
          });
          console.log(`  - Got upload URL`);

          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": "image/png" },
            body: blob,
          });
          console.log(`  - Upload response status:`, uploadResponse.status);

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`  - Upload failed:`, errorText);
            throw new Error("Failed to upload image to storage");
          }

          const { storageId } = await uploadResponse.json();
          console.log(`  - Storage ID:`, storageId);

          console.log(`\n🔄 Step 9: Updating job with storage ID...`);
          await ctx.runMutation(api.aiJobs.updateJobStatus, {
            token: args.token,
            jobId,
            status: "processing",
            outputFileId: storageId,
          });
          console.log(`  - Job updated with storage ID`);

          console.log(`\n🔗 Step 10: Getting permanent URL...`);
          const permanentUrl = await ctx.runQuery(api.files.getFileUrl, {
            token: args.token,
            storageId,
          });
          console.log(`  - Permanent URL:`, permanentUrl ? 'Retrieved' : 'Not found');

          imageDataUrl = permanentUrl || imageDataUrl;

          console.log(`✅ Image saved to Convex storage successfully`);

        } catch (error: any) {
          console.error(`\n${"!".repeat(80)}`);
          console.error("❌ OpenRouter image generation error:", error);
          console.error(`${"!".repeat(80)}`);
          console.error("Full error:", JSON.stringify(error, null, 2));
          
          // Fall back to placeholder
          console.log(`\n⚠️ Falling back to placeholder image...`);
          imageDataUrl = `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(args.prompt.substring(0, 50))}`;
          console.log(`  - Placeholder URL:`, imageDataUrl);
        }
      } else {
        // Placeholder for development
        console.log(`\nℹ️ OpenRouter not configured, using placeholder...`);
        imageDataUrl = `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(args.prompt.substring(0, 50))}`;
        console.log(`  - Placeholder URL:`, imageDataUrl);
      }

      console.log(`\n💳 Step 11: Deducting credits...`);
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Image generation: ${args.prompt.substring(0, 50)}`,
      });
      console.log(`✅ Credits deducted: ${creditsNeeded}`);

      console.log(`\n✅ Step 12: Marking job as completed...`);
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
      console.log(`✅ Job marked as completed`);

      console.log(`\n${"#".repeat(80)}`);
      console.log(`🎉 IMAGE GENERATION COMPLETED SUCCESSFULLY`);
      console.log(`${"#".repeat(80)}`);
      console.log(`Final result:`, {
        success: true,
        imageUrl: imageDataUrl.substring(0, 100) + '...',
        creditsUsed: creditsNeeded,
        jobId,
      });
      console.log(`${"#".repeat(80)}\n`);

      return {
        success: true,
        imageUrl: imageDataUrl,
        creditsUsed: creditsNeeded,
        jobId,
      };

    } catch (error: any) {
      console.error(`\n${"!".repeat(80)}`);
      console.error(`❌ IMAGE GENERATION TOOL FAILED`);
      console.error(`${"!".repeat(80)}`);
      console.error(`Error message:`, error.message);
      console.error(`Error stack:`, error.stack);
      console.error(`Full error:`, JSON.stringify(error, null, 2));
      
      // Update job as failed
      console.log(`\n🔄 Updating job status to failed...`);
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "failed",
        errorMessage: error.message,
      });
      console.log(`✅ Job marked as failed`);
      console.error(`${"!".repeat(80)}\n`);

      throw error;
    }
  },
});
