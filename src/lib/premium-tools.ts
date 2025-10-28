/**
 * Premium Tool Management
 * 
 * Defines three tiers: Anonymous (no auth), Free (auth required), Premium (subscription required)
 */

export type ToolId = string;

// Tools that can be used anonymously without authentication (trial mode)
export const ANONYMOUS_TOOLS: Set<ToolId> = new Set([
  "translation",
  "summarizer",
  "rewriter",
  "ocr",
  "transcription",
]);

// Tools that are free for authenticated users (require sign-in)
export const FREE_TOOLS: Set<ToolId> = new Set([
  "chat",
  "gedichten",
  "cadeautips",
  "surprises",
]);

// Tools that require premium subscription (Pro tier)
export const PREMIUM_TOOLS: Set<ToolId> = new Set([
  "image-generation",
  "background-removal",
  "wardrobe",
  "headshot",
  "copywriting",
  "seo-optimizer",
  "linkedin-content",
]);

/**
 * Check if a tool can be used anonymously
 */
export function isAnonymousTool(toolId: string): boolean {
  return ANONYMOUS_TOOLS.has(toolId);
}

/**
 * Check if a tool requires premium subscription
 */
export function isPremiumTool(toolId: string): boolean {
  return PREMIUM_TOOLS.has(toolId);
}

/**
 * Check if tool requires authentication
 */
export function requiresAuthentication(toolId: string): boolean {
  return !isAnonymousTool(toolId);
}

/**
 * Check if user has access to a tool based on subscription
 */
export function hasAccessToTool(
  userTier: string | undefined | null,
  toolId: string,
  isAuthenticated: boolean = false
): boolean {
  // Anonymous users can only access anonymous tools
  if (!isAuthenticated) {
    return isAnonymousTool(toolId);
  }
  
  // Free tier users can access free tools and premium tools are blocked
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
  if (isAnonymousTool(toolId)) {
    return "anonymous";
  }
  return "free"; // Free tools require authentication
}

/**
 * Get list of all tool IDs
 */
export function getAllToolIds(): ToolId[] {
  return Array.from(new Set([...PREMIUM_TOOLS, ...FREE_TOOLS, ...ANONYMOUS_TOOLS]));
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

/**
 * Get anonymous tool IDs
 */
export function getAnonymousToolIds(): ToolId[] {
  return Array.from(ANONYMOUS_TOOLS);
}


