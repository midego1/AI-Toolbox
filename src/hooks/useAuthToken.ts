"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

/**
 * Hook to get token for Convex authentication
 * Returns Clerk user ID as token (backwards compatible with old auth)
 */
export function useAuthToken() {
  const { user, isLoaded } = useClerkUser();
  const [token, setToken] = useState<string | null>(null);

  // Get Convex user ID from Clerk
  const convexUserId = useQuery(
    api.clerk.getUserIdByClerkId,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  // When we have the Convex user ID, use it as the "token" for backwards compatibility
  useEffect(() => {
    console.log("useAuthToken - isLoaded:", isLoaded, "user:", !!user, "convexUserId:", convexUserId);
    
    if (isLoaded && user) {
      if (convexUserId) {
        console.log("useAuthToken - Setting token to:", convexUserId);
        // Use Convex user ID as token for existing API
        setToken(convexUserId);
      } else {
        console.log("useAuthToken - convexUserId is null/undefined");
      }
    } else {
      console.log("useAuthToken - Not loaded or no user:", { isLoaded, hasUser: !!user });
      setToken(null);
    }
  }, [isLoaded, user, convexUserId]);

  return token;
}

