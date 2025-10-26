import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// OCR tool using Google Cloud Vision API
export const performOCR = action({
  args: {
    token: v.string(),
    fileId: v.id("_storage"),
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
      toolType: "ocr",
      inputData: {},
      inputFileId: args.fileId,
    });

    try {
      // Update job to processing
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Fixed credit cost for OCR
      const creditsNeeded = 5;

      // Check if user has enough credits
      const creditBalance = await ctx.runQuery(api.users.getCreditBalance, {
        token: args.token,
      });

      if (creditBalance < creditsNeeded) {
        throw new Error("Insufficient credits");
      }

      // Get file URL
      const fileUrl = await ctx.runQuery(api.files.getFileUrl, {
        token: args.token,
        storageId: args.fileId,
      });

      if (!fileUrl) {
        throw new Error("File not found");
      }

      // Download file
      const fileResponse = await fetch(fileUrl);
      const fileBuffer = await fileResponse.arrayBuffer();
      const base64Image = Buffer.from(fileBuffer).toString("base64");

      // Call Google Cloud Vision API
      const googleApiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

      let extractedText: string;

      if (googleApiKey) {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requests: [
                {
                  image: {
                    content: base64Image,
                  },
                  features: [
                    {
                      type: "TEXT_DETECTION",
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Google Vision API error: ${response.statusText}`);
        }

        const data = await response.json();
        const annotations = data.responses[0]?.textAnnotations;

        if (!annotations || annotations.length === 0) {
          extractedText = "";
        } else {
          // First annotation contains all detected text
          extractedText = annotations[0].description;
        }
      } else {
        // Mock OCR for development
        extractedText = "This is mock OCR text extracted from the image. Configure GOOGLE_CLOUD_VISION_API_KEY to use real OCR.";
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: "OCR processing",
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: {
          extractedText,
        },
        creditsUsed: creditsNeeded,
      });

      return {
        success: true,
        extractedText,
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
