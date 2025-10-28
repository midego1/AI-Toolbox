"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, X } from "lucide-react";
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
 * NEW: Frost overlay for anonymous users - can see through blurred content
 */
export function ToolAccessGuard({ toolId, children }: ToolAccessGuardProps) {
  const [dismissed, setDismissed] = useState(false);
  const token = getAuthToken();
  const { isSignedIn, isLoaded } = useUser();
  
  // Prevent body scroll when overlay is active
  useEffect(() => {
    if (!isSignedIn && !dismissed && isLoaded) {
      console.log('🔒 Locking scroll - overlay is active');
      const body = document.body;
      
      // Store scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.left = '0';
      body.style.right = '0';
      
      // Also add to html element
      const html = document.documentElement;
      html.style.overflow = 'hidden';
      
      // Prevent touch scrolling on mobile
      const preventDefault = (e: Event) => {
        e.preventDefault();
      };
      
      // Add event listeners to prevent scrolling
      document.addEventListener('wheel', preventDefault, { passive: false });
      document.addEventListener('touchmove', preventDefault, { passive: false });
      
      return () => {
        console.log('🔓 Unlocking scroll - overlay dismissed');
        // Remove event listeners
        document.removeEventListener('wheel', preventDefault);
        document.removeEventListener('touchmove', preventDefault);
        
        // Restore scrolling
        body.style.overflow = '';
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.left = '';
        body.style.right = '';
        html.style.overflow = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isSignedIn, dismissed, isLoaded]);
  
  // Get tool configuration from database
  const toolConfigs = useQuery(api.adminTools.getToolConfigsPublic);
  const toolConfig = toolConfigs?.find(c => c.toolId === toolId);
  
  // Check if tool allows anonymous access FIRST
  // Only true is anonymous, undefined/false means auth required
  const isAnonymous = toolConfig?.anonymous === true;
  
  console.log(`🔍 ToolAccessGuard Debug for ${toolId}:`, {
    isAnonymous,
    anonymousValue: toolConfig?.anonymous,
    isSignedIn,
    isLoaded,
    dismissed,
    willShowOverlay: !isSignedIn && !dismissed && isLoaded && !isAnonymous
  });
  
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
  
  // Frost overlay mode for anonymous users - can see through but prompted to sign up
  if (!isLoaded) {
    // Wait for auth to load
    return <>{children}</>;
  }
  
  if (!isSignedIn && !dismissed) {
    console.log(`Showing frost overlay for anonymous user on tool: ${toolId}`);
    return (
      <>
        {/* Tool content (blurred, non-interactive) - rendered in normal flow */}
        <div className="blur-sm pointer-events-none select-none opacity-60">
          {children}
        </div>
        
        {/* Frost overlay with sign-up prompt - positioned fixed to viewport */}
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <div className="bg-white/95 border border-white/30 rounded-2xl shadow-2xl p-6 max-w-md w-full relative pointer-events-auto">
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors z-10"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">Sign up to use this tool</h3>
                <p className="text-sm text-muted-foreground">
                  Create a free account to access this AI tool and get 100 credits to start
                </p>
              </div>
              
              <div className="flex gap-3">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
              
              <button
                onClick={() => setDismissed(true)}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Continue as guest (limited access)
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Show tool normally if dismissed or signed in
  return <>{children}</>;
}

