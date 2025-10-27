import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { callOpenRouter, MODELS } from "../lib/openrouter";

/**
 * Advanced Text Summarizer
 * 
 * Intelligent text summarization with advanced features:
 * - Multiple output formats (paragraph, bullets, executive summary, etc.)
 * - Length control (target words/sentences/compression ratio)
 * - Focus areas (extract info about specific topics)
 * - Preserve elements (quotes, statistics, names, dates)
 * - Audience-specific summaries
 * - Key points extraction
 * - Study questions generation
 * - Sentiment analysis
 */

export const summarize = action({
  args: {
    token: v.string(),
    text: v.string(),
    // Advanced parameters
    outputFormat: v.optional(v.string()), // paragraph, bullets, executive_summary, etc.
    targetWords: v.optional(v.number()),
    compressionRatio: v.optional(v.number()), // 0.1 = 10% of original
    focusAreas: v.optional(v.array(v.string())),
    preserveQuotes: v.optional(v.boolean()),
    preserveStatistics: v.optional(v.boolean()),
    audience: v.optional(v.string()), // expert, general, beginner
    extractKeyPoints: v.optional(v.number()), // Top N key points
    generateQuestions: v.optional(v.boolean()),
    sentimentAnalysis: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Verify session
    const user = await ctx.runQuery(api.auth.getCurrentUser, { token: args.token });
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Calculate credits based on text length
    const wordCount = args.text.split(/\s+/).length;
    const creditsNeeded = Math.max(2, Math.ceil(wordCount / 500)); // 2 credits per 500 words

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
      toolType: "summarizer",
      inputData: {
        wordCount,
        outputFormat: args.outputFormat || "paragraph",
      },
    });

    try {
      await ctx.runMutation(api.aiJobs.updateJobStatus, {
        token: args.token,
        jobId,
        status: "processing",
      });

      // Build system prompt
      const systemPrompt = buildSummarySystemPrompt(args);
      const userPrompt = buildSummaryUserPrompt(args);

      console.log("📊 Summarizer System Prompt:", systemPrompt);

      // Generate summary
      const summaryText = await callOpenRouter(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        {
          model: MODELS.GEMINI_FLASH,
          temperature: 0.3, // Lower for factual accuracy
          maxTokens: args.targetWords ? args.targetWords * 2 : 1000,
        }
      );

      const result: any = {
        summary: summaryText.trim(),
        originalWordCount: wordCount,
        summaryWordCount: summaryText.split(/\s+/).length,
        readingTime: Math.ceil(summaryText.split(/\s+/).length / 200), // minutes
      };

      // Extract key points if requested
      if (args.extractKeyPoints && args.extractKeyPoints > 0) {
        result.keyPoints = await extractKeyPoints(args.text, args.extractKeyPoints);
      }

      // Generate study questions if requested
      if (args.generateQuestions) {
        result.studyQuestions = await generateStudyQuestions(summaryText);
      }

      // Sentiment analysis if requested
      if (args.sentimentAnalysis) {
        result.sentiment = await analyzeSentiment(args.text);
      }

      // Deduct credits
      await ctx.runMutation(api.users.deductCredits, {
        token: args.token,
        amount: creditsNeeded,
        jobId,
        description: `Text Summarization: ${wordCount} words`,
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

function buildSummarySystemPrompt(args: any): string {
  let prompt = "You are an expert at summarizing text. ";

  // Output format
  const format = args.outputFormat || "paragraph";
  switch (format) {
    case "bullets":
      prompt += "Provide the summary as clear, concise bullet points. ";
      break;
    case "executive_summary":
      prompt += "Create an executive summary with key findings and recommendations. ";
      break;
    case "social_media_post":
      prompt += "Summarize as an engaging social media post. ";
      break;
    case "tweet_thread":
      prompt += "Summarize as a Twitter/X thread (each tweet under 280 characters). ";
      break;
    case "eli5":
      prompt += "Explain like I'm 5 - use simple language anyone can understand. ";
      break;
    case "academic":
      prompt += "Create an academic-style summary with formal language. ";
      break;
    default:
      prompt += "Provide a clear, concise summary in paragraph form. ";
  }

  // Length control
  if (args.targetWords) {
    prompt += `Target length: approximately ${args.targetWords} words. `;
  } else if (args.compressionRatio) {
    prompt += `Compress to ${args.compressionRatio * 100}% of the original length. `;
  }

  // Focus areas
  if (args.focusAreas && args.focusAreas.length > 0) {
    prompt += `Focus on these topics: ${args.focusAreas.join(", ")}. `;
  }

  // Preserve elements
  if (args.preserveQuotes) {
    prompt += "Include important quotes. ";
  }
  if (args.preserveStatistics) {
    prompt += "Include key statistics and data points. ";
  }

  // Audience
  if (args.audience) {
    prompt += `Tailor the summary for a ${args.audience} audience. `;
  }

  return prompt;
}

function buildSummaryUserPrompt(args: any): string {
  return `Please summarize the following text:\n\n${args.text}`;
}

async function extractKeyPoints(text: string, count: number): Promise<string[]> {
  const prompt = `Extract the ${count} most important key points from this text. Return only the points as a numbered list:\n\n${text.substring(0, 3000)}`;
  
  const response = await callOpenRouter(
    [
      { role: "system", content: "You extract key points from text concisely." },
      { role: "user", content: prompt },
    ],
    {
      model: MODELS.GEMINI_FLASH_LITE,
      temperature: 0.2,
      maxTokens: 500,
    }
  );

  // Parse numbered list
  return response
    .split("\n")
    .filter(line => /^\d+\./.test(line.trim()))
    .map(line => line.replace(/^\d+\.\s*/, "").trim())
    .slice(0, count);
}

async function generateStudyQuestions(summaryText: string): Promise<string[]> {
  const prompt = `Based on this summary, generate 5 thought-provoking study questions:\n\n${summaryText}`;
  
  const response = await callOpenRouter(
    [
      { role: "system", content: "You create insightful study questions." },
      { role: "user", content: prompt },
    ],
    {
      model: MODELS.GEMINI_FLASH_LITE,
      temperature: 0.6,
      maxTokens: 400,
    }
  );

  return response
    .split("\n")
    .filter(line => /^\d+\./.test(line.trim()) || line.includes("?"))
    .map(line => line.replace(/^\d+\.\s*/, "").trim())
    .slice(0, 5);
}

async function analyzeSentiment(text: string): Promise<any> {
  const prompt = `Analyze the sentiment of this text. Provide: overall sentiment (positive/negative/neutral), confidence (0-100), and key emotional themes. Be concise.\n\nText: ${text.substring(0, 2000)}`;
  
  const response = await callOpenRouter(
    [
      { role: "system", content: "You analyze sentiment accurately and concisely." },
      { role: "user", content: prompt },
    ],
    {
      model: MODELS.GEMINI_FLASH_LITE,
      temperature: 0.2,
      maxTokens: 200,
    }
  );

  // Simple parsing (can be enhanced)
  const sentiment = response.toLowerCase().includes("positive") ? "positive" 
    : response.toLowerCase().includes("negative") ? "negative" 
    : "neutral";

  return {
    overall: sentiment,
    analysis: response.trim(),
  };
}


