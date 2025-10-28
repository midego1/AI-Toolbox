import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * AI Copywriter Studio
 * 
 * Generate professional marketing copy with advanced parameters:
 * - Multiple content types (emails, ads, social media, etc.)
 * - Brand voice customization
 * - Target audience profiling
 * - A/B testing with multiple variants
 * - Quality analysis and recommendations
 */

// Content type specific prompts
const CONTENT_PROMPTS = {
  email_subject: "Create compelling email subject lines that drive opens",
  email_body: "Write engaging email body copy that converts readers",
  ad_headline: "Create attention-grabbing ad headlines",
  ad_body: "Write persuasive ad copy that drives clicks",
  social_post: "Create engaging social media posts",
  product_description: "Write compelling product descriptions that sell",
  landing_page_hero: "Create powerful landing page hero sections",
  video_script: "Write engaging video scripts",
  blog_outline: "Create comprehensive blog post outlines",
  seo_meta: "Write SEO-optimized meta titles and descriptions",
};

export const generateCopy = action({
  args: {
    token: v.string(),
    contentType: v.string(),
    productName: v.string(),
    productCategory: v.string(),
    uniqueSellingPoints: v.array(v.string()),
    // Advanced parameters
    brandVoiceTone: v.optional(v.array(v.string())),
    brandVoiceAvoid: v.optional(v.array(v.string())),
    targetAudienceAge: v.optional(v.string()),
    targetAudienceProfession: v.optional(v.string()),
    targetPainPoints: v.optional(v.array(v.string())),
    maxLength: v.optional(v.number()),
    mustIncludeKeywords: v.optional(v.array(v.string())),
    ctaType: v.optional(v.string()),
    urgencyLevel: v.optional(v.number()),
    variants: v.optional(v.number()),
    includeAnalysis: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session and get user
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Calculate credits (5-10 based on variants)
    const variantCount = args.variants || 3;
    const creditsNeeded = 5 + (variantCount > 3 ? (variantCount - 3) * 2 : 0);

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
      toolType: "copywriting",
      inputData: {
        contentType: args.contentType,
        productName: args.productName,
        variants: variantCount,
      },
    });

    try {
      // Update job to processing
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Fetch tool metadata from database
      const toolMetadata = await ctx.runQuery(api.adminTools.getToolMetadataPublic, { 
        toolId: "copywriting" 
      });
      
      // Build comprehensive prompt (use database prompt if available)
      const systemPrompt = toolMetadata?.systemPrompt || buildSystemPrompt(args);
      const userPrompt = buildUserPrompt(args);

      console.log("🎨 Copywriting System Prompt:", systemPrompt);
      console.log("📝 Copywriting User Prompt:", userPrompt);

      // Generate multiple variants
      const variants = [];
      
      for (let i = 0; i < variantCount; i++) {
        const temperature = 0.7 + (i * 0.1); // Vary creativity per variant
        
        const copyText = await callOpenRouter(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          {
            model: MODELS.GEMINI_FLASH,
            temperature,
            maxTokens: args.maxLength ? Math.ceil(args.maxLength * 1.5) : 500,
          }
        );

        const variant: any = {
          copy: copyText.trim(),
          variantNumber: i + 1,
        };

        // Add analysis if requested
        if (args.includeAnalysis) {
          variant.analysis = await analyzeCopy(copyText, args);
        }

        variants.push(variant);
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Copywriting: ${args.contentType} - ${variantCount} variants`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: {
          variants,
          contentType: args.contentType,
          variantCount,
        },
        creditsUsed: creditsNeeded,
      });

      return {
        success: true,
        variants,
        creditsUsed: creditsNeeded,
        jobId,
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

function buildSystemPrompt(args: any): string {
  const contentTypePrompt = CONTENT_PROMPTS[args.contentType as keyof typeof CONTENT_PROMPTS] 
    || "Create professional marketing copy";

  let prompt = `You are an expert copywriter. ${contentTypePrompt}.\n\n`;

  // Add brand voice
  if (args.brandVoiceTone && args.brandVoiceTone.length > 0) {
    prompt += `Brand Voice: ${args.brandVoiceTone.join(", ")}\n`;
  }

  if (args.brandVoiceAvoid && args.brandVoiceAvoid.length > 0) {
    prompt += `Avoid: ${args.brandVoiceAvoid.join(", ")}\n`;
  }

  // Add target audience
  if (args.targetAudienceAge || args.targetAudienceProfession) {
    prompt += `\nTarget Audience:\n`;
    if (args.targetAudienceAge) prompt += `- Age: ${args.targetAudienceAge}\n`;
    if (args.targetAudienceProfession) prompt += `- Profession: ${args.targetAudienceProfession}\n`;
  }

  if (args.targetPainPoints && args.targetPainPoints.length > 0) {
    prompt += `- Pain Points: ${args.targetPainPoints.join(", ")}\n`;
  }

  // Add constraints
  if (args.maxLength) {
    prompt += `\nMax Length: ${args.maxLength} characters\n`;
  }

  if (args.mustIncludeKeywords && args.mustIncludeKeywords.length > 0) {
    prompt += `Required Keywords: ${args.mustIncludeKeywords.join(", ")}\n`;
  }

  if (args.ctaType) {
    prompt += `Call-to-Action Type: ${args.ctaType}\n`;
  }

  if (args.urgencyLevel && args.urgencyLevel > 5) {
    prompt += `Create a sense of urgency (level ${args.urgencyLevel}/10)\n`;
  }

  prompt += `\nOutput only the copy text, no explanations.`;

  return prompt;
}

function buildUserPrompt(args: any): string {
  let prompt = `Product: ${args.productName}\n`;
  prompt += `Category: ${args.productCategory}\n\n`;
  
  prompt += `Unique Selling Points:\n`;
  args.uniqueSellingPoints.forEach((usp: string, i: number) => {
    prompt += `${i + 1}. ${usp}\n`;
  });

  return prompt;
}

async function analyzeCopy(copyText: string, args: any): Promise<any> {
  // Simple analysis (can be enhanced with more AI calls)
  const wordCount = copyText.split(/\s+/).length;
  const charCount = copyText.length;
  const hasQuestion = copyText.includes("?");
  const hasUrgency = /\b(now|today|limited|hurry|don't miss)\b/i.test(copyText);
  
  // Check for required keywords
  const keywordsFound = args.mustIncludeKeywords
    ? args.mustIncludeKeywords.filter((kw: string) => 
        copyText.toLowerCase().includes(kw.toLowerCase())
      )
    : [];

  return {
    wordCount,
    charCount,
    hasQuestion,
    hasUrgency,
    keywordsIncluded: keywordsFound,
    readabilityScore: Math.max(1, Math.min(10, Math.round(10 - (wordCount / 20)))),
    estimatedCTR: hasUrgency ? "2.5-3.5%" : "1.5-2.5%",
  };
}




