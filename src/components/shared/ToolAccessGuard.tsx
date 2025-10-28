"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";

interface ToolAccessGuardProps {
  toolId: string;
  children: React.ReactNode;
}

/**
 * Universal access guard for all AI tools
 * Handles:
 * - Anonymous access (no login required)
 * - Free tier access (login required)
 * - Premium tier access (subscription required)
 * 
 * NEW: Allows preview mode - users can see the UI before signing up
 */
export function ToolAccessGuard({ toolId, children }: ToolAccessGuardProps) {
  const token = getAuthToken();
  const { isSignedIn, isLoaded } = useUser();
  
  // Get tool configuration from database
  const toolConfigs = useQuery(api.adminTools.getToolConfigsPublic);
  const toolConfig = toolConfigs?.find(c => c.toolId === toolId);
  
  // Check if tool allows anonymous access FIRST
  const isAnonymous = toolConfig?.anonymous === true;
  
  // Only get current user info if authenticated AND we need to check access
  // For anonymous tools, we don't need to query user info
  const user = useQuery(
    api.auth.getCurrentUser,
    (token && !isAnonymous) ? { token } : "skip"
  );
  
  // If configs haven't loaded yet, use optimistic rendering
  // For non-authenticated users, assume anonymous access is OK
  if (toolConfigs === undefined) {
    // Always allow access when configs are loading - this prevents infinite spinners
    // The actual access control will be handled by the tool itself when it tries to execute
    return <>{children}</>;
  }
  
  // Check if tool is enabled
  if (toolConfig && !toolConfig.enabled) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold mb-2">Tool Disabled</h3>
          <p className="text-muted-foreground">
            This tool has been temporarily disabled by the administrator.
          </p>
        </Card>
      </div>
    );
  }
  
  const isFree = toolConfig?.free === true;
  const isPaid = toolConfig?.paid === true;
  
  console.log(`ToolAccessGuard for ${toolId}:`, {
    isAnonymous,
    isFree,
    isPaid,
    isSignedIn,
    isLoaded,
  });
  
  // If tool allows anonymous access, show it to everyone
  if (isAnonymous) {
    console.log(`Tool ${toolId} allows anonymous access - showing content`);
    return <>{children}</>;
  }
  
  // Allow preview mode - show tool UI without blocking banner
  // Users can explore freely, auth check happens at execution time
  if (!isSignedIn) {
    return <>{children}</>;
  }
  
  // User is signed in - show the tool
  // Auth checks for premium features should be handled by the tool itself
  return <>{children}</>;
}

