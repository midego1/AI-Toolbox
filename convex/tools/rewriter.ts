import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * Content Rewriter & Paraphraser
 * 
 * Advanced text rewriting with:
 * - Multiple rewrite goals (simplify, academic, professional, creative, etc.)
 * - Length control (shorten, expand, maintain)
 * - Tone and complexity changes
 * - Point of view transformation
 * - SEO optimization
 * - Plagiarism avoidance
 * - Multiple variants for A/B testing
 */

export const rewriteContent = action({
  args: {
    token: v.string(),
    text: v.string(),
    // Advanced parameters
    rewriteGoal: v.optional(v.string()), // simplify, academic, professional, creative, persuasive, seo_optimize
    changeLength: v.optional(v.string()), // shorten, expand, maintain
    changeTone: v.optional(v.string()), // Target tone
    changeComplexity: v.optional(v.string()), // simplify, sophisticate
    changePointOfView: v.optional(v.string()), // first_person, third_person, second_person
    preserveKeywords: v.optional(v.array(v.string())),
    avoidPlagiarism: v.optional(v.boolean()),
    seoKeywords: v.optional(v.array(v.string())),
    variants: v.optional(v.number()),
    qualityMetrics: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Calculate credits
    const wordCount = args.text.split(/\s+/).length;
    const variantCount = args.variants || 2;
    const creditsNeeded = Math.max(3, Math.ceil(wordCount / 200) + (variantCount - 1));

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
      toolType: "rewriter",
      inputData: {
        wordCount,
        rewriteGoal: args.rewriteGoal || "professional",
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
      const rewrites = [];
      
      for (let i = 0; i < variantCount; i++) {
        const systemPrompt = buildRewriteSystemPrompt(args, i);
        
        const rewrittenText = await callOpenRouter(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Rewrite this text:\n\n${args.text}` },
          ],
          {
            model: MODELS.GEMINI_FLASH,
            temperature: 0.6 + (i * 0.1), // Vary creativity
            maxTokens: calculateMaxTokens(args.text, args.changeLength),
          }
        );

        const rewrite: any = {
          text: rewrittenText.trim(),
          variantNumber: i + 1,
          originalWordCount: wordCount,
          rewrittenWordCount: rewrittenText.split(/\s+/).length,
        };

        // Add quality metrics if requested
        if (args.qualityMetrics) {
          rewrite.metrics = {
            readabilityScore: calculateReadability(rewrittenText),
            similarityToOriginal: calculateSimilarity(args.text, rewrittenText),
            keywordPresence: args.preserveKeywords 
              ? checkKeywordPresence(rewrittenText, args.preserveKeywords)
              : null,
          };
        }

        rewrites.push(rewrite);
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Content Rewriting: ${wordCount} words, ${variantCount} variants`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: { rewrites },
        creditsUsed: creditsNeeded,
      });

      return {
        success: true,
        rewrites,
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

function buildRewriteSystemPrompt(args: any, variantIndex: number): string {
  let prompt = "You are an expert content rewriter. ";

  // Rewrite goal
  const goal = args.rewriteGoal || "professional";
  switch (goal) {
    case "simplify":
      prompt += "Rewrite the text in simpler language that anyone can understand. ";
      break;
    case "academic":
      prompt += "Rewrite in academic style with formal language and proper citations format. ";
      break;
    case "professional":
      prompt += "Rewrite in professional business language. ";
      break;
    case "creative":
      prompt += "Rewrite creatively with engaging language and vivid descriptions. ";
      break;
    case "persuasive":
      prompt += "Rewrite to be more persuasive and compelling. ";
      break;
    case "seo_optimize":
      prompt += "Rewrite for SEO optimization while maintaining readability. ";
      break;
  }

  // Length changes
  if (args.changeLength === "shorten") {
    prompt += "Make it approximately 30% shorter while keeping key information. ";
  } else if (args.changeLength === "expand") {
    prompt += "Expand it by approximately 50% with more details and examples. ";
  }

  // Tone change
  if (args.changeTone) {
    prompt += `Adjust the tone to be ${args.changeTone}. `;
  }

  // Complexity change
  if (args.changeComplexity === "simplify") {
    prompt += "Use simpler vocabulary and shorter sentences. ";
  } else if (args.changeComplexity === "sophisticate") {
    prompt += "Use more sophisticated vocabulary and complex sentence structures. ";
  }

  // Point of view change
  if (args.changePointOfView) {
    const pov = args.changePointOfView.replace("_", " ");
    prompt += `Rewrite in ${pov} perspective. `;
  }

  // Keywords to preserve
  if (args.preserveKeywords && args.preserveKeywords.length > 0) {
    prompt += `Make sure to include these keywords: ${args.preserveKeywords.join(", ")}. `;
  }

  // SEO keywords
  if (args.seoKeywords && args.seoKeywords.length > 0) {
    prompt += `Naturally incorporate these SEO keywords: ${args.seoKeywords.join(", ")}. `;
  }

  // Plagiarism avoidance
  if (args.avoidPlagiarism) {
    prompt += "Significantly rephrase the content to ensure uniqueness. ";
  }

  // Variant-specific instructions
  if (variantIndex === 0) {
    prompt += "Prioritize clarity and conciseness. ";
  } else if (variantIndex === 1) {
    prompt += "Prioritize engagement and readability. ";
  } else {
    prompt += "Try a more creative approach. ";
  }

  prompt += "Output only the rewritten text, no explanations.";

  return prompt;
}

function calculateMaxTokens(originalText: string, changeLength?: string): number {
  const baseTokens = originalText.split(/\s+/).length * 1.5;
  
  if (changeLength === "shorten") {
    return Math.ceil(baseTokens * 0.7);
  } else if (changeLength === "expand") {
    return Math.ceil(baseTokens * 2);
  }
  
  return Math.ceil(baseTokens * 1.2);
}

function calculateReadability(text: string): number {
  // Simple readability score (1-10, higher is easier to read)
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;
  
  // Shorter sentences = easier to read
  return Math.max(1, Math.min(10, Math.round(10 - (avgWordsPerSentence / 3))));
}

function calculateSimilarity(text1: string, text2: string): number {
  // Simple word overlap similarity (0-100%)
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  let overlap = 0;
  words1.forEach(word => {
    if (words2.has(word)) overlap++;
  });
  
  const similarity = (overlap / Math.max(words1.size, words2.size)) * 100;
  return Math.round(similarity);
}

function checkKeywordPresence(text: string, keywords: string[]): any {
  const lowerText = text.toLowerCase();
  const found = keywords.filter(kw => lowerText.includes(kw.toLowerCase()));
  
  return {
    found,
    missing: keywords.filter(kw => !found.includes(kw)),
    percentage: Math.round((found.length / keywords.length) * 100),
  };
}



