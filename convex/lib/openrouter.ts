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
  // Image generation models
  FLUX_PRO: "black-forest-labs/flux-pro", // Best quality
  FLUX_DEV: "black-forest-labs/flux-dev", // Good quality, faster
  STABLE_DIFFUSION_XL: "stability-ai/stable-diffusion-xl",
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
 * Generate image using OpenRouter with Gemini 2.5 Flash Image
 * Returns base64 data URL of generated image
 */
export async function generateImage(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`🎨 OPENROUTER IMAGE GENERATION STARTING`);
    console.log(`${"=".repeat(80)}`);
    console.log(`📝 Prompt: "${prompt}"`);
    console.log(`🔧 Model: ${MODELS.GEMINI_FLASH_IMAGE}`);
    console.log(`🌐 API URL: ${OPENROUTER_API_URL}`);
    console.log(`🔑 API Key present: ${apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No'}`);
    
    const requestBody = {
      model: MODELS.GEMINI_FLASH_IMAGE,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      modalities: ["image", "text"], // Required for image generation
      temperature: 0.8,
    };
    
    console.log(`📤 Request body:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-toolbox.app",
        "X-Title": "AI Toolbox",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);
    console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n${"!".repeat(80)}`);
      console.error(`❌ OPENROUTER API ERROR`);
      console.error(`${"!".repeat(80)}`);
      console.error(`Status: ${response.status} ${response.statusText}`);
      console.error(`Response body:`, errorText);
      
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const error = JSON.parse(errorText);
        console.error(`Parsed error:`, JSON.stringify(error, null, 2));
        errorMessage = error.error?.message || errorMessage;
      } catch (e) {
        console.error(`Could not parse error response as JSON`);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`\n✅ Got successful response from OpenRouter`);
    console.log(`📊 Full response:`, JSON.stringify(data, null, 2));
    
    // Log response structure
    console.log(`\n🔍 ANALYZING RESPONSE STRUCTURE:`);
    console.log(`- Response keys:`, Object.keys(data));
    
    if (data.choices) {
      console.log(`- Choices array length:`, data.choices.length);
      if (data.choices[0]) {
        console.log(`- First choice keys:`, Object.keys(data.choices[0]));
        if (data.choices[0].message) {
          console.log(`- Message keys:`, Object.keys(data.choices[0].message));
          const msg = data.choices[0].message;
          
          // Log what we have in the message
          if (msg.content) console.log(`  - content type:`, typeof msg.content, `(${Array.isArray(msg.content) ? 'array' : 'not array'})`);
          if (msg.images) console.log(`  - images type:`, typeof msg.images, `(${Array.isArray(msg.images) ? `array of ${msg.images.length}` : 'not array'})`);
          if (msg.role) console.log(`  - role:`, msg.role);
        }
      }
    }

    // Extract image from response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error(`❌ Invalid response structure:`, JSON.stringify(data, null, 2));
      throw new Error("Invalid response structure from OpenRouter");
    }

    const message = data.choices[0].message;

    // Method 1: Check for images array (standard format)
    console.log(`\n🔍 METHOD 1: Checking message.images array...`);
    if (message.images) {
      console.log(`  ✓ message.images exists`);
      console.log(`  - Type:`, typeof message.images);
      console.log(`  - Is array:`, Array.isArray(message.images));
      
      if (Array.isArray(message.images)) {
        console.log(`  - Array length:`, message.images.length);
        
        if (message.images.length > 0) {
          const image = message.images[0];
          console.log(`  ✓ First image exists`);
          console.log(`  - Image type:`, typeof image);
          console.log(`  - Image keys:`, typeof image === 'object' ? Object.keys(image) : 'N/A');
          console.log(`  - Full image object:`, JSON.stringify(image, null, 2));
          
          // Try different possible locations
          // First check for encoded_image (base64 string)
          if (image.encoded_image) {
            const base64Data = image.encoded_image;
            console.log(`\n🎉 SUCCESS! Found encoded_image`);
            console.log(`  - Base64 length:`, base64Data.length);
            console.log(`  - Preview:`, base64Data.substring(0, 100) + '...');
            
            // Convert to data URL (assume PNG, but could detect format)
            const dataUrl = `data:image/png;base64,${base64Data}`;
            return dataUrl;
          }
          
          // Then check for URL fields
          const imageUrl = image.image_url?.url || image.url || image.data_url || image.data;
          
          if (imageUrl) {
            console.log(`\n🎉 SUCCESS! Found image URL`);
            console.log(`  - Source:`, image.image_url?.url ? 'image_url.url' : image.url ? 'url' : image.data_url ? 'data_url' : 'data');
            console.log(`  - Type:`, imageUrl.startsWith('data:') ? 'data URL' : 'external URL');
            console.log(`  - Length:`, imageUrl.length);
            console.log(`  - Preview:`, imageUrl.substring(0, 100) + '...');
            return imageUrl;
          }
          
          // If image is just a string
          if (typeof image === 'string') {
            console.log(`\n🎉 SUCCESS! Image is a string`);
            console.log(`  - Length:`, image.length);
            console.log(`  - Preview:`, image.substring(0, 100) + '...');
            return image;
          }
          
          console.log(`  ✗ Could not extract URL from image object`);
        } else {
          console.log(`  ✗ Images array is empty`);
        }
      } else {
        console.log(`  ✗ message.images is not an array`);
      }
    } else {
      console.log(`  ✗ message.images does not exist`);
    }

    // Method 2: Check content field (alternative format)
    console.log(`\n🔍 METHOD 2: Checking message.content...`);
    if (message.content) {
      console.log(`  ✓ message.content exists`);
      console.log(`  - Type:`, typeof message.content);
      console.log(`  - Is array:`, Array.isArray(message.content));
      
      // Content might be an array with image parts
      if (Array.isArray(message.content)) {
        console.log(`  - Array length:`, message.content.length);
        console.log(`  - Array items:`, JSON.stringify(message.content, null, 2));
        
        for (let i = 0; i < message.content.length; i++) {
          const part = message.content[i];
          console.log(`  - Item ${i} type:`, part.type);
          
          if (part.type === 'image' || part.type === 'image_url') {
            const url = part.image_url?.url || part.url || part.data;
            if (url) {
              console.log(`\n🎉 SUCCESS! Found image in content array at index ${i}`);
              console.log(`  - URL length:`, url.length);
              console.log(`  - Preview:`, url.substring(0, 100) + '...');
              return url;
            }
          }
        }
        console.log(`  ✗ No image found in content array`);
      }
      
      // Content might be a string with base64 data
      if (typeof message.content === 'string') {
        console.log(`  - Content is string, length:`, message.content.length);
        console.log(`  - Starts with 'data:image':`, message.content.startsWith('data:image'));
        console.log(`  - Content preview:`, message.content.substring(0, 200));
        
        if (message.content.startsWith('data:image')) {
          console.log(`\n🎉 SUCCESS! Found data URL in content string`);
          return message.content;
        } else {
          console.log(`  ✗ Content string is not a data URL`);
        }
      }
    } else {
      console.log(`  ✗ message.content does not exist`);
    }

    // If we get here, we couldn't find the image
    console.error(`\n${"!".repeat(80)}`);
    console.error(`❌ NO IMAGE FOUND IN RESPONSE`);
    console.error(`${"!".repeat(80)}`);
    console.error(`Searched in:`);
    console.error(`  1. message.images[] (not found or empty)`);
    console.error(`  2. message.content (not found or not an image)`);
    console.error(`\nFull response for debugging:`);
    console.error(JSON.stringify(data, null, 2));
    console.error(`${"=".repeat(80)}\n`);
    
    throw new Error("No image generated in response. The model may not support image generation or returned an unexpected format.");

  } catch (error: any) {
    console.error("❌ OpenRouter image generation error:", error);
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
