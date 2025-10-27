"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { hasAccessToTool } from "@/lib/premium-tools";
import { PreviewOverlay } from "./preview-overlay";
import { useRouter } from "next/navigation";

interface PremiumOverlayProps {
  toolId: string;
  children: React.ReactNode;
}

export function PremiumOverlay({ toolId, children }: PremiumOverlayProps) {
  const token = getAuthToken();
  const router = useRouter();
  const user = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : "skip"
  );

  // If no token, let the layout handle the preview mode
  // Don't add our own overlay here to avoid double overlay
  if (!token) {
    return <>{children}</>;
  }

  // Check if user has access to this tool
  const userTier = user?.subscriptionTier;
  const hasAccess = hasAccessToTool(userTier, toolId);

  // If logged-in user doesn't have access, show blur overlay
  if (!hasAccess) {
    return (
      <div className="relative">
        <div className="blur-md brightness-75 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 z-50">
          <PreviewOverlay />
        </div>
      </div>
    );
  }

  // User has access, show content normally
  return <>{children}</>;
}

