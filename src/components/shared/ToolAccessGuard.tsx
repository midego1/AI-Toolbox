"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight, Info } from "lucide-react";
import Link from "next/link";

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
  
  // NEW: Preview mode - show tool UI with a contextual sign-up banner
  // This allows users to explore the tool before signing up, improving conversion
  if (!isSignedIn) {
    return (
      <div className="space-y-6">
        {/* Contextual Sign-Up Banner */}
        <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Sign up to use this tool</p>
              <p className="text-sm text-muted-foreground">
                Create a free account to access all AI tools and get 100 credits to start
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
        
        {/* Show the tool in preview mode - users can interact but execution requires auth */}
        {children}
      </div>
    );
  }
  
  // If user is signed in but tool requires paid subscription
  if (isPaid && user) {
    const userTier = user.subscriptionTier;
    const hasAccess = userTier === "pro" || userTier === "enterprise";
    
    if (!hasAccess) {
      return (
        <div className="space-y-6">
          {/* Upgrade Banner */}
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3 p-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Upgrade to Pro</p>
                <p className="text-sm text-muted-foreground">
                  Unlock access to all premium AI tools with a Pro subscription
                </p>
              </div>
              <Link href="/billing">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Upgrade
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </Card>
          
          {/* Show the tool in preview mode */}
          {children}
        </div>
      );
    }
  }
  
  // User has access, show the tool
  return <>{children}</>;
}

