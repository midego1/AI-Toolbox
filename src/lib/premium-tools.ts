/**
 * Premium Tool Management
 * 
 * Defines which tools require a premium subscription
 */

export type ToolId = string;

// Tools that require premium subscription
export const PREMIUM_TOOLS: Set<ToolId> = new Set([
  "image-generation",
  "background-removal",
  "wardrobe",
  "headshot",
  "copywriting",
  "seo-optimizer",
  "linkedin-content",
]);

// Tools that are available for free users
export const FREE_TOOLS: Set<ToolId> = new Set([
  "translation",
  "ocr",
  "transcription",
  "rewriter",
  "summarizer",
  "chat",
  "gedichten",
  "cadeautips",
  "surprises",
]);

/**
 * Check if a tool requires premium subscription
 */
export function isPremiumTool(toolId: string): boolean {
  return PREMIUM_TOOLS.has(toolId);
}

/**
 * Check if user has access to a tool based on subscription
 */
export function hasAccessToTool(
  userTier: string | undefined | null,
  toolId: string
): boolean {
  // If no user tier, check if tool is premium
  if (!userTier || userTier === "free") {
    return !isPremiumTool(toolId);
  }
  
  // Pro and enterprise users have access to all tools
  return userTier === "pro" || userTier === "enterprise";
}

/**
 * Get tool tier requirement
 */
export function getToolTierRequirement(toolId: string): string {
  if (isPremiumTool(toolId)) {
    return "pro";
  }
  return "free";
}

/**
 * Get list of all tool IDs
 */
export function getAllToolIds(): ToolId[] {
  return Array.from(new Set([...PREMIUM_TOOLS, ...FREE_TOOLS]));
}

/**
 * Get premium tool IDs
 */
export function getPremiumToolIds(): ToolId[] {
  return Array.from(PREMIUM_TOOLS);
}

/**
 * Get free tool IDs
 */
export function getFreeToolIds(): ToolId[] {
  return Array.from(FREE_TOOLS);
}


