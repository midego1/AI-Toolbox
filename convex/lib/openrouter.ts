/**
 * OpenRouter API Integration
 *
 * OpenRouter provides access to 400+ AI models through a single API.
 * We use Gemini 2.5 Flash models for cost-effective, high-quality AI processing.
 *
 * Models used:
 * - Gemini 2.5 Flash: Translation, text processing, content generation
 * - Gemini 2.5 Flash Lite: Fast tasks, low-cost operations
 * - Gemini 2.5 Flash Image: Image generation and editing
 *
 * Get API key: https://openrouter.ai/keys
 */

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Model identifiers
export const MODELS = {
  GEMINI_FLASH: "google/gemini-2.5-flash",
  GEMINI_FLASH_LITE: "google/gemini-2.5-flash-lite-preview-09-2025",
  GEMINI_FLASH_IMAGE: "google/gemini-2.5-flash-image-preview",
  // Fallback options
  GPT_4O_MINI: "openai/gpt-4o-mini",
  CLAUDE_SONNET: "anthropic/claude-3-sonnet",
};

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  modalities?: string[]; // For image generation
}

/**
 * Call OpenRouter API with chat completion
 */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const {
    model = MODELS.GEMINI_FLASH,
    temperature = 0.7,
    maxTokens = 2000,
    topP = 1,
    modalities,
  } = options;

  try {
    const body: any = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
    };

    // Add modalities for image generation
    if (modalities) {
      body.modalities = modalities;
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-toolbox.app",
        "X-Title": "AI Toolbox",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response from OpenRouter API");
    }

    return data.choices[0].message.content;

  } catch (error: any) {
    console.error("OpenRouter API error:", error);
    throw new Error(`Failed to call OpenRouter: ${error.message}`);
  }
}

/**
 * Generate image using Gemini 2.5 Flash Image
 * Returns base64 data URL of generated image
 */
export async function generateImage(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-toolbox.app",
        "X-Title": "AI Toolbox",
      },
      body: JSON.stringify({
        model: MODELS.GEMINI_FLASH_IMAGE,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"], // Required for image generation
        temperature: 0.8, // Higher creativity for images
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract image from response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const message = data.choices[0].message;

      // Images are returned in the images array as base64 data URLs
      if (message.images && message.images.length > 0) {
        const imageUrl = message.images[0].image_url?.url;
        if (imageUrl) {
          return imageUrl; // Returns data:image/png;base64,...
        }
      }
    }

    throw new Error("No image generated in response");

  } catch (error: any) {
    console.error("OpenRouter image generation error:", error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

/**
 * Translate text using Gemini 2.5 Flash Lite
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: `You are a professional translator. Translate the text from ${sourceLang} to ${targetLang}. Only output the translated text, nothing else.`,
    },
    {
      role: "user",
      content: text,
    },
  ];

  return await callOpenRouter(messages, {
    model: MODELS.GEMINI_FLASH_LITE, // Use lite for speed
    temperature: 0.3, // Lower temp for accurate translation
    maxTokens: 2000,
  });
}

/**
 * Process OCR text extraction (analyze image)
 * Note: For actual OCR from images, you'd need vision capabilities
 * This is for text processing/cleanup after OCR
 */
export async function processOCRText(extractedText: string): Promise<string> {
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: "You are a text processing assistant. Clean up and format the provided OCR-extracted text. Fix obvious OCR errors, improve formatting, but preserve the original meaning and content.",
    },
    {
      role: "user",
      content: extractedText,
    },
  ];

  return await callOpenRouter(messages, {
    model: MODELS.GEMINI_FLASH_LITE,
    temperature: 0.2,
    maxTokens: 4000,
  });
}

/**
 * Generate LinkedIn content
 */
export async function generateLinkedInContent(
  prompt: string,
  contentType: "post" | "recommendation" | "headline" | "summary"
): Promise<string> {
  const systemPrompts = {
    post: "You are a LinkedIn content expert. Create engaging, professional LinkedIn posts that drive engagement. Use short paragraphs, bullet points when appropriate, and a conversational yet professional tone.",
    recommendation: "You are a professional reference writer. Create authentic, specific LinkedIn recommendations that highlight achievements and working relationships.",
    headline: "You are a personal branding expert. Create compelling LinkedIn headlines that are concise, keyword-rich, and showcase professional value.",
    summary: "You are a career storytelling expert. Create compelling LinkedIn summaries that tell a professional story, highlight achievements, and showcase personality.",
  };

  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: systemPrompts[contentType],
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  return await callOpenRouter(messages, {
    model: MODELS.GEMINI_FLASH,
    temperature: 0.8, // Higher creativity for content
    maxTokens: 1000,
  });
}

/**
 * Enhance image generation prompt
 */
export async function enhanceImagePrompt(userPrompt: string): Promise<string> {
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: "You are an AI image prompt expert. Enhance the user's image description to create a detailed, vivid prompt that will produce high-quality AI-generated images. Focus on visual details, style, lighting, composition, and mood. Keep it under 100 words.",
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  return await callOpenRouter(messages, {
    model: MODELS.GEMINI_FLASH,
    temperature: 0.7,
    maxTokens: 300,
  });
}

/**
 * Check if OpenRouter is configured
 */
export function isOpenRouterConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

/**
 * Get cost estimate for a task
 * Based on OpenRouter pricing (approximate)
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: string = MODELS.GEMINI_FLASH
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    [MODELS.GEMINI_FLASH]: { input: 0.30 / 1_000_000, output: 2.50 / 1_000_000 },
    [MODELS.GEMINI_FLASH_LITE]: { input: 0.10 / 1_000_000, output: 0.40 / 1_000_000 },
    [MODELS.GEMINI_FLASH_IMAGE]: { input: 0.30 / 1_000_000, output: 30.00 / 1_000_000 }, // Each image = 1290 tokens = ~$0.039
  };

  const modelPricing = pricing[model] || pricing[MODELS.GEMINI_FLASH];
  return (inputTokens * modelPricing.input) + (outputTokens * modelPricing.output);
}

/**
 * Estimate image generation cost
 * Gemini Flash Image: ~1290 tokens per image = $0.039/image
 */
export function estimateImageCost(): number {
  return 0.039; // ~4 cents per image
}
