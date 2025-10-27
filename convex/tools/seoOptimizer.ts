import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * SEO Content Optimizer
 * 
 * Comprehensive SEO optimization tool:
 * - On-page SEO optimization
 * - Keyword strategy and density
 * - Meta tags generation
 * - Content structure improvement
 * - Readability enhancement
 * - FAQ generation
 * - Internal linking suggestions
 */

export const optimizeSEO = action({
  args: {
    token: v.string(),
    content: v.string(),
    targetKeyword: v.string(),
    // Advanced parameters
    searchIntent: v.optional(v.string()), // informational, transactional, navigational, commercial
    secondaryKeywords: v.optional(v.array(v.string())),
    optimizeHeadings: v.optional(v.boolean()),
    optimizeMetaDescription: v.optional(v.boolean()),
    optimizeTitle: v.optional(v.boolean()),
    addFAQs: v.optional(v.boolean()),
    addStatistics: v.optional(v.boolean()),
    improveReadability: v.optional(v.boolean()),
    targetKeywordDensity: v.optional(v.number()), // 1-3% recommended
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Calculate credits
    const wordCount = args.content.split(/\s+/).length;
    const creditsNeeded = Math.max(8, Math.ceil(wordCount / 200) + 5);

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
      toolType: "seo_optimizer",
      inputData: {
        wordCount,
        targetKeyword: args.targetKeyword,
      },
    });

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Step 1: Analyze current content
      const analysis = await analyzeCurrentContent(args.content, args.targetKeyword);

      // Step 2: Optimize content
      const optimizedContent = await optimizeContent(args);

      // Step 3: Generate meta tags
      let metadata: any = {};
      if (args.optimizeTitle) {
        metadata.title = await generateSEOTitle(args.targetKeyword, args.content);
      }
      if (args.optimizeMetaDescription) {
        metadata.metaDescription = await generateMetaDescription(args.targetKeyword, args.content);
      }

      // Step 4: Generate FAQs if requested
      let faqs: any = null;
      if (args.addFAQs) {
        faqs = await generateFAQs(args.content, args.targetKeyword);
      }

      // Step 5: Calculate SEO scores
      const originalScore = calculateSEOScore(args.content, args.targetKeyword);
      const optimizedScore = calculateSEOScore(optimizedContent, args.targetKeyword);

      const result = {
        original: {
          content: args.content,
          seoScore: originalScore,
          wordCount,
          keywordDensity: calculateKeywordDensity(args.content, args.targetKeyword),
        },
        optimized: {
          content: optimizedContent,
          seoScore: optimizedScore,
          wordCount: optimizedContent.split(/\s+/).length,
          keywordDensity: calculateKeywordDensity(optimizedContent, args.targetKeyword),
          metadata,
          faqs,
        },
        analysis,
        improvements: {
          scoreIncrease: optimizedScore - originalScore,
          suggestions: generateSuggestions(analysis),
        },
      };

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `SEO Optimization: ${wordCount} words`,
      });

      // Update job as completed
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "completed",
        outputData: result,
        creditsUsed: creditsNeeded,
      });

      return {
        success: true,
        ...result,
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

async function analyzeCurrentContent(content: string, targetKeyword: string): Promise<any> {
  const wordCount = content.split(/\s+/).length;
  const keywordDensity = calculateKeywordDensity(content, targetKeyword);
  const hasHeadings = /^#+\s/m.test(content) || /<h[1-6]>/i.test(content);
  const readabilityScore = calculateReadability(content);

  return {
    wordCount,
    keywordDensity,
    hasHeadings,
    readabilityScore,
    issues: [
      wordCount < 300 && "Content is too short (recommend 300+ words)",
      keywordDensity < 1 && "Keyword density too low",
      keywordDensity > 3 && "Keyword density too high (keyword stuffing risk)",
      !hasHeadings && "Missing proper heading structure",
      readabilityScore < 5 && "Content may be too complex",
    ].filter(Boolean),
  };
}

async function optimizeContent(args: any): Promise<string> {
  const systemPrompt = buildSEOOptimizationPrompt(args);
  
  const optimized = await callOpenRouter(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Optimize this content:\n\n${args.content}` },
    ],
    {
      model: MODELS.GEMINI_FLASH,
      temperature: 0.4,
      maxTokens: args.content.split(/\s+/).length * 2,
    }
  );

  return optimized.trim();
}

function buildSEOOptimizationPrompt(args: any): string {
  let prompt = `You are an SEO expert. Optimize this content for search engines while maintaining readability.\n\n`;
  
  prompt += `Primary Keyword: "${args.targetKeyword}"\n`;
  
  if (args.secondaryKeywords && args.secondaryKeywords.length > 0) {
    prompt += `Secondary Keywords: ${args.secondaryKeywords.join(", ")}\n`;
  }

  if (args.searchIntent) {
    prompt += `Search Intent: ${args.searchIntent}\n`;
  }

  if (args.targetKeywordDensity) {
    prompt += `Target Keyword Density: ${args.targetKeywordDensity}%\n`;
  }

  prompt += `\nOptimization Instructions:\n`;
  
  if (args.optimizeHeadings) {
    prompt += `- Add clear H2 and H3 headings with keyword variations\n`;
  }
  
  if (args.improveReadability) {
    prompt += `- Use shorter sentences and paragraphs\n`;
    prompt += `- Add transition words\n`;
    prompt += `- Use bullet points where appropriate\n`;
  }

  if (args.addStatistics) {
    prompt += `- Include relevant statistics (you can use placeholders like "[Insert stat]")\n`;
  }

  prompt += `- Naturally incorporate keywords without stuffing\n`;
  prompt += `- Add a strong conclusion with call-to-action\n`;
  prompt += `\nOutput the optimized content only, maintaining markdown formatting.`;

  return prompt;
}

async function generateSEOTitle(keyword: string, content: string): Promise<string[]> {
  const preview = content.substring(0, 500);
  
  const titles = await callOpenRouter(
    [
      {
        role: "system",
        content: "Generate 3 SEO-optimized title tags (under 60 characters each) that include the target keyword naturally.",
      },
      {
        role: "user",
        content: `Keyword: "${keyword}"\n\nContent preview: ${preview}`,
      },
    ],
    {
      model: MODELS.GEMINI_FLASH_LITE,
      temperature: 0.7,
      maxTokens: 200,
    }
  );

  return titles
    .split("\n")
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\.\s*/, "").trim())
    .slice(0, 3);
}

async function generateMetaDescription(keyword: string, content: string): Promise<string[]> {
  const preview = content.substring(0, 500);
  
  const descriptions = await callOpenRouter(
    [
      {
        role: "system",
        content: "Generate 3 compelling meta descriptions (140-160 characters each) with the target keyword.",
      },
      {
        role: "user",
        content: `Keyword: "${keyword}"\n\nContent preview: ${preview}`,
      },
    ],
    {
      model: MODELS.GEMINI_FLASH_LITE,
      temperature: 0.7,
      maxTokens: 300,
    }
  );

  return descriptions
    .split("\n")
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\.\s*/, "").trim())
    .slice(0, 3);
}

async function generateFAQs(content: string, keyword: string): Promise<any[]> {
  const response = await callOpenRouter(
    [
      {
        role: "system",
        content: "Generate 5 relevant FAQ questions and answers based on the content. Format as Q: and A: pairs.",
      },
      {
        role: "user",
        content: `Topic: ${keyword}\n\nContent: ${content.substring(0, 1000)}`,
      },
    ],
    {
      model: MODELS.GEMINI_FLASH,
      temperature: 0.6,
      maxTokens: 800,
    }
  );

  // Parse Q&A pairs
  const faqs: any[] = [];
  const lines = response.split("\n");
  let currentQ = "";
  let currentA = "";

  for (const line of lines) {
    if (line.startsWith("Q:")) {
      if (currentQ && currentA) {
        faqs.push({ question: currentQ, answer: currentA });
      }
      currentQ = line.replace("Q:", "").trim();
      currentA = "";
    } else if (line.startsWith("A:")) {
      currentA = line.replace("A:", "").trim();
    } else if (currentA && line.trim()) {
      currentA += " " + line.trim();
    }
  }

  if (currentQ && currentA) {
    faqs.push({ question: currentQ, answer: currentA });
  }

  return faqs.slice(0, 5);
}

function calculateKeywordDensity(content: string, keyword: string): number {
  const words = content.toLowerCase().split(/\s+/);
  const keywordWords = keyword.toLowerCase().split(/\s+/);
  
  let count = 0;
  for (let i = 0; i <= words.length - keywordWords.length; i++) {
    const phrase = words.slice(i, i + keywordWords.length).join(" ");
    if (phrase === keyword.toLowerCase()) {
      count++;
    }
  }
  
  const density = (count / words.length) * 100;
  return Math.round(density * 100) / 100;
}

function calculateSEOScore(content: string, keyword: string): number {
  let score = 0;
  
  // Word count (max 20 points)
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300) score += 20;
  else if (wordCount >= 150) score += 10;
  
  // Keyword density (max 20 points)
  const density = calculateKeywordDensity(content, keyword);
  if (density >= 1 && density <= 3) score += 20;
  else if (density >= 0.5 && density < 1) score += 10;
  
  // Has headings (max 15 points)
  if (/^#+\s/m.test(content) || /<h[1-6]>/i.test(content)) score += 15;
  
  // Keyword in first 100 words (max 15 points)
  const first100 = content.split(/\s+/).slice(0, 100).join(" ").toLowerCase();
  if (first100.includes(keyword.toLowerCase())) score += 15;
  
  // Readability (max 15 points)
  const readability = calculateReadability(content);
  if (readability >= 7) score += 15;
  else if (readability >= 5) score += 10;
  
  // Content length bonus (max 15 points)
  if (wordCount >= 1000) score += 15;
  else if (wordCount >= 500) score += 10;
  
  return Math.min(100, score);
}

function calculateReadability(text: string): number {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;
  
  return Math.max(1, Math.min(10, Math.round(10 - (avgWordsPerSentence / 3))));
}

function generateSuggestions(analysis: any): string[] {
  const suggestions = [];
  
  if (analysis.wordCount < 300) {
    suggestions.push("Expand content to at least 300 words");
  }
  
  if (analysis.keywordDensity < 1) {
    suggestions.push("Increase keyword usage naturally throughout content");
  }
  
  if (analysis.keywordDensity > 3) {
    suggestions.push("Reduce keyword usage to avoid keyword stuffing penalty");
  }
  
  if (!analysis.hasHeadings) {
    suggestions.push("Add H2 and H3 headings to improve structure");
  }
  
  if (analysis.readabilityScore < 5) {
    suggestions.push("Simplify language and use shorter sentences");
  }
  
  return suggestions;
}


