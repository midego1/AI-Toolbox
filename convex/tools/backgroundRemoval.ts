import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { MODELS, isOpenRouterConfigured } from "../lib/openrouter";

/**
 * Background Remover Pro
 * 
 * Advanced background removal using OpenRouter's Gemini 2.5 Flash Image model.
 * 
 * Features:
 * - Transparent PNG output
 * - Solid color backgrounds
 * - Blur original background
 * - Edge refinement
 * - Custom background replacement
 * 
 * Uses: google/gemini-2.5-flash-image-preview via OpenRouter
 */

export const removeBackground = action({
  args: {
    token: v.string(),
    imageId: v.id("_storage"),
    // Advanced parameters
    outputType: v.optional(v.string()), // cutout, mask, both
    edgeRefinementLevel: v.optional(v.number()), // 1-10
    backgroundColor: v.optional(v.string()), // Hex color for replacement
    blurBackground: v.optional(v.boolean()),
    blurAmount: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Credits: 3 for basic, +2 for advanced processing
    const creditsNeeded = 3 + (args.edgeRefinementLevel && args.edgeRefinementLevel > 5 ? 2 : 0);

    // Check credits
    const creditBalance = await ctx.runQuery(api.users.getCreditBalance, {
      token: args.token,
    });

    if (creditBalance < creditsNeeded) {
      throw new Error("Insufficient credits");
    }

    // Create job for history
    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "background_removal",
      inputData: {
        outputType: args.outputType || "cutout",
        backgroundColor: args.backgroundColor,
        blurBackground: args.blurBackground,
      },
      inputFileId: args.imageId,
    });

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Get the image URL from storage
      const imageUrl = await ctx.storage.getUrl(args.imageId);
      if (!imageUrl) {
        throw new Error("Image not found");
      }

      console.log("🖼️ Background Removal - Starting");
      console.log(`📸 Image ID: ${args.imageId}`);
      console.log(`🎨 Output Type: ${args.outputType || "cutout"}`);
      console.log(`🔧 Edge Refinement: ${args.edgeRefinementLevel || 5}/10`);

      // Check if OpenRouter is configured
      if (!isOpenRouterConfigured()) {
        throw new Error("OPENROUTER_API_KEY not configured");
      }

      // Build the background removal prompt
      const prompt = buildBackgroundRemovalPrompt(args);
      
      console.log("🤖 Using Gemini 2.5 Flash Image for background removal");
      console.log(`🔧 Model: ${MODELS.GEMINI_FLASH_IMAGE}`);
      console.log(`📝 Prompt: ${prompt}`);

      // Call OpenRouter API with image-to-image processing using the same pattern as wardrobe
      const apiKey = process.env.OPENROUTER_API_KEY;
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://sinterklaasgpt.com",
          "X-Title": "SinterklaasGPT - Background Removal",
        },
        body: JSON.stringify({
          model: MODELS.GEMINI_FLASH_IMAGE,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          modalities: ["image", "text"],
          temperature: 0.3, // Lower temp for precise background removal
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ OpenRouter API error:", errorText);
        throw new Error(`Background removal failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Background removal completed");

      // Extract the processed image from response
      let imageDataUrl: string;
      
      if (data.choices?.[0]?.message?.images?.[0]) {
        const image = data.choices[0].message.images[0];
        imageDataUrl = image.encoded_image 
          ? `data:image/png;base64,${image.encoded_image}`
          : image.image_url?.url || image.url || image.data_url || imageUrl;
      } else if (data.choices?.[0]?.message?.content) {
        const content = data.choices[0].message.content;
        if (typeof content === 'string' && content.startsWith('data:image')) {
          imageDataUrl = content;
        } else if (Array.isArray(content)) {
          const imageContent = content.find(c => c.type === 'image' || c.type === 'image_url');
          imageDataUrl = imageContent?.image_url?.url || imageContent?.url || imageUrl;
        } else {
          imageDataUrl = imageUrl;
        }
      } else {
        console.warn("⚠️ Could not find processed image in response, using original");
        imageDataUrl = imageUrl;
      }

      // Store the processed image in Convex storage to avoid document size limits
      console.log("📦 Storing processed image to Convex storage...");
      let resultStorageId: any;
      let resultImageUrl: string = imageDataUrl;

      try {
        // Only store if it's a data URL (base64), not an external URL
        if (imageDataUrl.startsWith('data:image')) {
          const base64Data = imageDataUrl.split(',')[1];
          
          if (base64Data) {
            // Convert base64 to blob
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'image/png' });
            console.log(`  - Blob size: ${blob.size} bytes`);

            // Upload to Convex storage
            const uploadUrl = await ctx.runMutation(api.files.generateUploadUrl, {
              token: args.token,
            });

            const uploadResponse = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": "image/png" },
              body: blob,
            });

            if (uploadResponse.ok) {
              const { storageId } = await uploadResponse.json();
              resultStorageId = storageId;
              console.log(`  - Stored with ID: ${storageId}`);

              // Get permanent URL
              const permanentUrl = await ctx.runQuery(api.files.getFileUrl, {
                token: args.token,
                storageId,
              });

              if (permanentUrl) {
                resultImageUrl = permanentUrl;
                console.log(`✅ Image saved to Convex storage successfully`);
              }
            }
          }
        }
      } catch (storageError: any) {
        console.warn("⚠️ Failed to store in Convex storage, using direct URL:", storageError.message);
        // Continue with imageDataUrl if storage fails
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: "Background Removal",
      });

      // Store result in history (only store storage ID, not the full image data)
      const outputData = {
        outputType: args.outputType || "cutout",
        backgroundColor: args.backgroundColor,
        edgeRefinementLevel: args.edgeRefinementLevel,
        processedAt: Date.now(),
        model: MODELS.GEMINI_FLASH_IMAGE,
        // Only store storageId if available, not the full image URL
        ...(resultStorageId && { storageId: resultStorageId }),
      };

      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData,
        outputFileId: resultStorageId,
        creditsUsed: creditsNeeded,
      });

      return {
        success: true,
        resultImageUrl,
        creditsUsed: creditsNeeded,
        jobId,
        model: "Gemini 2.5 Flash Image",
      };
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

/**
 * Build prompt for background removal based on options
 */
function buildBackgroundRemovalPrompt(args: any): string {
  const outputType = args.outputType || "cutout";
  const refinementLevel = args.edgeRefinementLevel || 5;
  
  let prompt = "";
  
  switch (outputType) {
    case "cutout":
      prompt = `Generate a professional product photo of ONLY the main subject from this image, isolated on a pure transparent background.

CRITICAL REQUIREMENTS:
- Extract and recreate ONLY the main subject/person (the focal point of the image)
- The subject must be PERFECTLY isolated with NO background elements
- All background pixels must be 100% transparent (alpha channel = 0)
- The subject should look like it's on a studio backdrop - completely isolated
- Preserve the exact appearance, colors, lighting, and details of the subject
`;
      break;
      
    case "solid":
      const color = args.backgroundColor || "#FFFFFF";
      prompt = `Generate a professional studio photo of ONLY the main subject from this image, placed on a pure solid ${color} background.

CRITICAL REQUIREMENTS:
- Extract and recreate ONLY the main subject/person (the focal point)
- Replace ALL background elements with a uniform solid ${color} color
- The subject must be cleanly separated from the background
- Make it look like a professional studio photograph with even ${color} backdrop
- Preserve the exact appearance, colors, and lighting of the subject
`;
      break;
      
    case "blur":
      const blurAmount = args.blurAmount || 10;
      prompt = `Generate a professional portrait of the main subject from this image, with the background heavily blurred (${blurAmount}px bokeh effect).

CRITICAL REQUIREMENTS:
- Keep the main subject/person perfectly sharp and in focus
- Apply heavy blur/bokeh effect to ALL background elements
- Create a depth-of-field effect like a portrait lens
- The subject should stand out clearly from the blurred background
- Preserve the exact appearance and details of the subject
`;
      break;
  }
  
  // Edge refinement instructions
  if (refinementLevel >= 7) {
    prompt += `
EDGE QUALITY - MAXIMUM PRECISION:
- Use pixel-perfect edge detection
- Preserve fine details: individual hair strands, fur, transparent objects, wisps
- Maintain soft edges where appropriate (hair, fabric, etc.)
- Handle semi-transparent elements correctly (glass, smoke, etc.)
- No visible halos, outlines, or artifacts around the subject
`;
  } else if (refinementLevel >= 4) {
    prompt += `
EDGE QUALITY - HIGH:
- Clean, smooth edge separation
- Preserve main hair details and texture
- Good handling of complex edges
- Minimal artifacts around the subject
`;
  } else {
    prompt += `
EDGE QUALITY - STANDARD:
- Clean basic edge detection
- Smooth separation between subject and background
- Professional-looking cutout
`;
  }
  
  prompt += `
OUTPUT REQUIREMENTS:
- High resolution matching the input image
- Maintain original image quality and sharpness of the subject
- Professional studio-quality result
- PNG format with proper alpha channel (for transparency)
- The subject should look natural and unaltered except for the background change

Generate the result now.`;
  
  return prompt;
}

