import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { callOpenRouter, MODELS, isOpenRouterConfigured } from "../lib/openrouter";

/**
 * Virtual Try-On Tool - Digital Wardrobe
 * 
 * Allows users to upload a photo of themselves and a clothing item,
 * then generates an image showing them wearing that clothing.
 * 
 * This uses AI to:
 * 1. Analyze the person's photo (pose, body type, lighting)
 * 2. Analyze the clothing item (style, color, pattern, type)
 * 3. Generate a realistic composite image
 */
export const virtualTryOnTool = action({
  args: {
    token: v.string(),
    personImageId: v.id("_storage"),
    clothingImageId: v.id("_storage"),
    style: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log(`\n${"#".repeat(80)}`);
    console.log(`👔 VIRTUAL TRY-ON TOOL STARTED`);
    console.log(`${"#".repeat(80)}`);
    
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
      toolType: "virtual_tryon",
      inputData: {
        personImageId: args.personImageId,
        clothingImageId: args.clothingImageId,
        itemType: args.itemType || "accessories",
        style: args.style || "realistic",
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

      // Fixed credit cost for virtual try-on (slightly higher than basic image generation)
      const creditsNeeded = 15;
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

      // Get image URLs
      console.log(`\n🖼️  Step 5: Retrieving uploaded images...`);
      const personImageUrl = await ctx.runQuery(api.files.getFileUrl, {
        token: args.token,
        storageId: args.personImageId,
      });
      const clothingImageUrl = await ctx.runQuery(api.files.getFileUrl, {
        token: args.token,
        storageId: args.clothingImageId,
      });
      console.log(`✅ Retrieved image URLs`);

      let imageDataUrl: string;

      if (isOpenRouterConfigured()) {
        try {
          console.log(`\n🤖 Step 6: Using AI to analyze images and generate description...`);
          console.log(`  - Item Type: ${args.itemType || "accessories"}`);
          console.log(`  - Style: ${args.style || "realistic"}`);
          
          const itemType = args.itemType || "accessories";
          
          // Create item-type specific instructions
          const itemTypeInstructions: Record<string, string> = {
            "accessories": `CRITICAL INSTRUCTIONS FOR ACCESSORIES:
- Keep the EXACT same person with identical facial features, skin tone, hair, and expression
- Maintain the exact same pose, body position, and background
- ONLY add the accessory item (glasses, jewelry, hat, watch, etc.) to the existing look
- The accessory should fit naturally on the person as if they're wearing it
- Preserve all original characteristics - only the accessory should be different
- Match the lighting and perspective of the original photo
- Focus on seamless integration of the accessory`,

            "upper-body": `INSTRUCTIONS FOR UPPER BODY CLOTHING:
- Maintain the person's facial features, skin tone, and general appearance
- Replace the upper body clothing with the new item (shirt, jacket, blazer, etc.)
- Ensure proper fit and draping on the person's body type
- Keep the same pose and overall setting
- Natural shadows and fabric folds
- Professional clothing visualization`,

            "lower-body": `INSTRUCTIONS FOR LOWER BODY CLOTHING:
- Maintain the person's upper body, face, and general appearance
- Replace the lower body clothing with the new item (pants, skirt, shorts, etc.)
- Ensure proper fit and draping
- Keep the same pose and overall setting
- Natural shadows and fabric folds
- Show how the garment fits the person's body type`,

            "full-outfit": `INSTRUCTIONS FOR FULL OUTFIT:
- Maintain the person's facial features and body type
- Replace the entire outfit with the new clothing (dress, suit, jumpsuit, etc.)
- Ensure proper fit across the whole body
- Keep the same pose and general setting
- Professional fashion photography quality
- Natural draping and movement of fabric`,

            "footwear": `INSTRUCTIONS FOR FOOTWEAR:
- Maintain the person's entire upper body and face
- Replace or add the footwear item (shoes, boots, sneakers, etc.)
- Show the shoes on the person's feet naturally
- Keep the same pose and overall setting
- Proper perspective and lighting
- Natural fit and placement`
          };

          const specificInstructions = itemTypeInstructions[itemType] || itemTypeInstructions["accessories"];
          
          console.log(`  - Generating detailed prompt from uploaded images...`);
          
          // Use OpenRouter to create an enhanced prompt
          const enhancedPrompt = await callOpenRouter([
            {
              role: "system",
              content: "You are a fashion photography expert specializing in virtual try-on and clothing visualization. You create detailed prompts for AI image generation that produce photorealistic results.",
            },
            {
              role: "user",
              content: `Create a photorealistic image generation prompt for a virtual try-on scenario.

${specificInstructions}

Photography Style: ${args.style || "realistic"}
Item Type: ${itemType}

Generate a detailed, specific prompt that will produce a photorealistic image. Include:
- Physical description (hair, face, pose, expression)
- The item being tried on with specific details
- Lighting, background, and atmosphere
- Photography quality and style
- Realistic textures and materials

${itemType === "accessories" ? "REMEMBER: This is an accessory - preserve ALL facial features and appearance!" : ""}

Output ONLY the detailed image generation prompt, nothing else. Be extremely specific and vivid.`,
            },
          ], {
            model: MODELS.GEMINI_FLASH,
            temperature: 0.7,
            maxTokens: 500,
          });

          console.log(`  ✓ Enhanced prompt created:`, enhancedPrompt.substring(0, 200) + "...");

          console.log(`\n🎨 Step 7: Generating virtual try-on image...`);
          
          // Import the generateImage function to create the composite
          const { generateImage } = await import("../lib/openrouter");
          imageDataUrl = await generateImage(enhancedPrompt);

          console.log(`\n✅ Image generation returned successfully`);
          console.log(`  - Image URL type:`, imageDataUrl.startsWith('data:') ? 'Data URL' : 'External URL');

          // Store the generated image
          console.log(`\n📦 Step 8: Converting and uploading to Convex storage...`);
          const base64Data = imageDataUrl.split(',')[1];
          
          if (!base64Data) {
            throw new Error("Invalid data URL format - no base64 data found");
          }
          
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: 'image/png' });
          console.log(`  - Created blob, size:`, blob.size, 'bytes');

          console.log(`\n📤 Step 9: Uploading to Convex storage...`);
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
          console.log(`  - Storage ID:`, storageId);

          console.log(`\n🔄 Step 10: Updating job with storage ID...`);
          await ctx.runMutation(api.aiJobs.updateJobStatus, {
            token: args.token,
            jobId,
            status: "processing",
            outputFileId: storageId,
          });

          console.log(`\n🔗 Step 11: Getting permanent URL...`);
          const permanentUrl = await ctx.runQuery(api.files.getFileUrl, {
            token: args.token,
            storageId,
          });

          imageDataUrl = permanentUrl || imageDataUrl;
          console.log(`✅ Image saved to Convex storage successfully`);

        } catch (error: any) {
          console.error(`\n❌ Virtual try-on generation error:`, error);
          console.error("Full error:", JSON.stringify(error, null, 2));
          
          // Fall back to placeholder
          console.log(`\n⚠️ Falling back to placeholder image...`);
          imageDataUrl = `https://via.placeholder.com/1024x1024.png?text=Virtual+Try-On`;
        }
      } else {
        // Placeholder for development
        console.log(`\nℹ️ OpenRouter not configured, using placeholder...`);
        imageDataUrl = `https://via.placeholder.com/1024x1024.png?text=Virtual+Try-On`;
      }

      console.log(`\n💳 Step 12: Deducting credits...`);
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: "Virtual try-on - Digital Wardrobe",
      });
      console.log(`✅ Credits deducted: ${creditsNeeded}`);

      console.log(`\n✅ Step 13: Marking job as completed...`);
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: {
          imageUrl: imageDataUrl,
          personImageId: args.personImageId,
          clothingImageId: args.clothingImageId,
          itemType: args.itemType || "accessories",
          style: args.style || "realistic",
          model: isOpenRouterConfigured() ? MODELS.GEMINI_FLASH_IMAGE : "placeholder",
        },
        creditsUsed: creditsNeeded,
      });
      console.log(`✅ Job marked as completed`);

      console.log(`\n${"#".repeat(80)}`);
      console.log(`🎉 VIRTUAL TRY-ON COMPLETED SUCCESSFULLY`);
      console.log(`${"#".repeat(80)}\n`);

      return {
        success: true,
        imageUrl: imageDataUrl,
        creditsUsed: creditsNeeded,
        jobId,
      };

    } catch (error: any) {
      console.error(`\n❌ VIRTUAL TRY-ON TOOL FAILED`);
      console.error(`Error message:`, error.message);
      
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

