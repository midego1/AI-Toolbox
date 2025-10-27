"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

/**
 * Custom hook to get Convex user profile from Clerk
 * Automatically creates user in Convex if it doesn't exist (INSTANT SYNC)
 */
export function useConvexUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser();
  const [isCreating, setIsCreating] = useState(false);
  
  // Get Convex user ID using Clerk ID
  const convexUserId = useQuery(
    api.clerk.getUserIdByClerkId,
    user?.id ? { clerkUserId: user.id } : "skip"
  );
  
  // Get full Convex user profile
  const convexUser = useQuery(
    api.clerk.getUserProfileById,
    convexUserId ? { userId: convexUserId } : "skip"
  );
  
  // Mutation to create user (using same syncClerkUser function)
  const createUserMutation = useMutation(api.clerk.syncClerkUser);
  
  // Auto-create user if signed in but doesn't exist in Convex
  useEffect(() => {
    if (
      isLoaded && 
      isSignedIn && 
      user && 
      !convexUserId && 
      !isCreating &&
      convexUser === undefined // Not loading
    ) {
      console.log("🔄 Creating Convex user instantly...");
      setIsCreating(true);
      
      createUserMutation({
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || user.firstName || "",
        avatarUrl: user.imageUrl,
      })
        .then(() => {
          console.log("✅ Convex user created!");
          setIsCreating(false);
        })
        .catch((error) => {
          console.error("❌ Failed to create Convex user:", error);
          setIsCreating(false);
        });
    }
  }, [isLoaded, isSignedIn, user, convexUserId, isCreating, createUserMutation, convexUser]);
  
  return {
    convexUser,
    convexUserId,
    isCreating,
  };
}
