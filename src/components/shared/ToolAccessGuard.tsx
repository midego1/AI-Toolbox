"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
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
 */
export function ToolAccessGuard({ toolId, children }: ToolAccessGuardProps) {
  const token = getAuthToken();
  const { isSignedIn, isLoaded } = useUser();
  
  // Get tool configuration from database
  const toolConfigs = useQuery(api.adminTools.getToolConfigsPublic);
  const toolConfig = toolConfigs?.find(c => c.toolId === toolId);
  
  // Get current user info if authenticated
  const user = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : "skip"
  );
  
  // Check if tool allows anonymous access
  const isAnonymous = toolConfig?.anonymous === true;
  
  // If configs haven't loaded yet, use optimistic rendering
  // For non-authenticated users, assume anonymous access is OK
  if (toolConfigs === undefined) {
    // If user is not signed in, allow access (optimistic for anonymous tools)
    if (!isSignedIn) {
      return <>{children}</>;
    }
    
    // If user is signed in but Clerk is still loading, show loading
    if (!isLoaded) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading tool access...</p>
          </div>
        </div>
      );
    }
    
    // If user is signed in and Clerk is loaded, allow access
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
  
  // If tool is free or paid but user is not signed in, show sign-in prompt
  if (!isSignedIn) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground mb-4">
            This tool requires authentication to use.
          </p>
          <div className="space-y-3">
            <Link href="/signup" className="block">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Sign Up for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full">
                Already have an account? Log In
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }
  
  // If user is signed in but tool requires paid subscription
  if (isPaid && user) {
    const userTier = user.subscriptionTier;
    const hasAccess = userTier === "pro" || userTier === "enterprise";
    
    if (!hasAccess) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Upgrade Required</h3>
            <p className="text-muted-foreground mb-4">
              This tool is available with a Pro subscription.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Access to all premium tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Unlimited usage</span>
              </div>
            </div>
            <Link href="/billing" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Upgrade to Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      );
    }
  }
  
  // User has access, show the tool
  return <>{children}</>;
}

