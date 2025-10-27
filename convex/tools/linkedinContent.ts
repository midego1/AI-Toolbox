import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * LinkedIn Content Engine
 * 
 * Professional LinkedIn content generation:
 * - Posts, articles, recommendations
 * - Profile optimization (headline, about)
 * - Job descriptions
 * - Advanced personalization and engagement features
 */

const CONTENT_TYPE_PROMPTS = {
  post: {
    system: "You are a LinkedIn content expert. Create engaging, professional posts that drive meaningful engagement.",
    guidance: "Use short paragraphs, emojis sparingly, and end with a thought-provoking question.",
  },
  article: {
    system: "You are a professional business writer. Create well-structured LinkedIn articles with clear sections.",
    guidance: "Include an introduction, 3-5 main sections with subheadings, and a strong conclusion.",
  },
  recommendation: {
    system: "You are a professional reference writer. Create authentic recommendations highlighting specific achievements.",
    guidance: "Focus on concrete examples and measurable results.",
  },
  profile_headline: {
    system: "You are a personal branding expert. Create compelling headlines under 220 characters.",
    guidance: "Include role, value proposition, and key expertise.",
  },
  profile_about: {
    system: "You are a career storytelling expert. Create engaging About sections that showcase personality and achievements.",
    guidance: "Tell a story, highlight achievements, and include a call-to-action.",
  },
  job_description: {
    system: "You are a talent acquisition specialist. Write clear, appealing job descriptions.",
    guidance: "Include responsibilities, requirements, and company culture.",
  },
};

export const generateLinkedInContent = action({
  args: {
    token: v.string(),
    contentType: v.string(), // post, article, recommendation, profile_headline, profile_about, job_description
    topic: v.string(),
    // Advanced parameters
    industry: v.optional(v.string()),
    role: v.optional(v.string()),
    experience: v.optional(v.string()),
    tone: v.optional(v.array(v.string())), // professional, thoughtful, inspiring, etc.
    length: v.optional(v.string()), // short, medium, long
    includeHashtags: v.optional(v.boolean()),
    hashtagCount: v.optional(v.number()),
    includeQuestion: v.optional(v.boolean()),
    includeCallToAction: v.optional(v.boolean()),
    seoKeywords: v.optional(v.array(v.string())),
    variants: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Calculate credits
    const variantCount = args.variants || 2;
    const creditsNeeded = 5 + (variantCount > 2 ? (variantCount - 2) : 0);

    // Check credits
    const creditBalance = await ctx.runQuery(api.users.getCreditBalance, {
      token: args.token,
    });

    if (creditBalance < creditsNeeded) {
      throw new Error("Insufficient credits");
    }

    // Create job for history tracking
    const jobId = await ctx.runMutation(api.aiJobs.createJob, {
      token: args.token,
      toolType: "linkedin_content",
      inputData: {
        contentType: args.contentType,
        topic: args.topic,
        industry: args.industry,
        role: args.role,
        variants: variantCount,
      },
    });

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Generate variants
      const contents = [];
      
      for (let i = 0; i < variantCount; i++) {
        const systemPrompt = buildLinkedInSystemPrompt(args, i);
        const userPrompt = buildLinkedInUserPrompt(args);

        console.log(`🔵 LinkedIn ${args.contentType} - Variant ${i + 1}`);

        const contentText = await callOpenRouter(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          {
            model: MODELS.GEMINI_FLASH,
            temperature: 0.7 + (i * 0.1),
            maxTokens: getMaxTokensForLength(args.length),
          }
        );

        const content: any = {
          text: contentText.trim(),
          variantNumber: i + 1,
          wordCount: contentText.split(/\s+/).length,
          charCount: contentText.length,
        };

        // Add engagement predictions
        content.engagement = predictEngagement(contentText, args);

        contents.push(content);
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `LinkedIn ${args.contentType}: ${variantCount} variants`,
      });

      // Store complete history in outputData
      const outputData = {
        contentType: args.contentType,
        topic: args.topic,
        contents,
        metadata: {
          generatedAt: Date.now(),
          industry: args.industry,
          role: args.role,
        },
      };

      // Update job as completed with full history
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData,
        creditsUsed: creditsNeeded,
      });

      return {
        success: true,
        contents,
        creditsUsed: creditsNeeded,
        jobId, // Return jobId so frontend can link to history
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

function buildLinkedInSystemPrompt(args: any, variantIndex: number): string {
  const typeConfig = CONTENT_TYPE_PROMPTS[args.contentType as keyof typeof CONTENT_TYPE_PROMPTS];
  
  let prompt = typeConfig?.system || "You are a professional content writer.";
  prompt += "\n\n";

  // Tone
  if (args.tone && args.tone.length > 0) {
    prompt += `Tone: ${args.tone.join(", ")}\n`;
  }

  // Length guidance
  const length = args.length || "medium";
  if (length === "short") {
    prompt += "Length: 50-100 words, concise and punchy\n";
  } else if (length === "medium") {
    prompt += "Length: 100-200 words, balanced\n";
  } else if (length === "long") {
    prompt += "Length: 200-300 words, detailed\n";
  }

  // Professional context
  if (args.industry) {
    prompt += `Industry: ${args.industry}\n`;
  }
  if (args.role) {
    prompt += `Role/Position: ${args.role}\n`;
  }
  if (args.experience) {
    prompt += `Experience Level: ${args.experience}\n`;
  }

  // Engagement features
  if (args.includeQuestion) {
    prompt += "End with an engaging question to drive comments\n";
  }
  if (args.includeCallToAction) {
    prompt += "Include a clear call-to-action\n";
  }
  if (args.includeHashtags && args.hashtagCount) {
    prompt += `Include ${args.hashtagCount} relevant hashtags at the end\n`;
  }

  // SEO
  if (args.seoKeywords && args.seoKeywords.length > 0) {
    prompt += `Keywords to naturally include: ${args.seoKeywords.join(", ")}\n`;
  }

  // Variant-specific approach
  if (variantIndex === 0) {
    prompt += "\nApproach: Focus on professionalism and credibility\n";
  } else if (variantIndex === 1) {
    prompt += "\nApproach: Focus on engagement and relatability\n";
  } else {
    prompt += "\nApproach: Try a unique, attention-grabbing angle\n";
  }

  prompt += "\n" + (typeConfig?.guidance || "");
  prompt += "\n\nOutput only the content, no explanations or meta-commentary.";

  return prompt;
}

function buildLinkedInUserPrompt(args: any): string {
  return `Create LinkedIn ${args.contentType} about: ${args.topic}`;
}

function getMaxTokensForLength(length?: string): number {
  switch (length) {
    case "short": return 200;
    case "long": return 600;
    default: return 400; // medium
  }
}

function predictEngagement(text: string, args: any): any {
  // Simple engagement scoring
  const hasQuestion = text.includes("?");
  const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(text);
  const hasHashtags = text.includes("#");
  const hasNumbers = /\d+/.test(text);
  const hasCallToAction = /\b(share|comment|thoughts|agree|disagree|learn more|reach out)\b/i.test(text);
  
  let score = 50; // Base score
  
  if (hasQuestion) score += 10;
  if (hasEmojis) score += 5;
  if (hasHashtags) score += 5;
  if (hasNumbers) score += 8; // Statistics drive engagement
  if (hasCallToAction) score += 12;
  
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 100 && wordCount <= 200) score += 10; // Sweet spot
  
  return {
    score: Math.min(100, score),
    hasQuestion,
    hasCallToAction,
    estimatedViews: score > 70 ? "High (500+)" : score > 50 ? "Medium (200-500)" : "Low (50-200)",
    estimatedEngagement: score > 70 ? "3-5%" : score > 50 ? "2-3%" : "1-2%",
  };
}


