"use client";

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.error("NEXT_PUBLIC_CONVEX_URL environment variable is not set!");
  console.error("Please set NEXT_PUBLIC_CONVEX_URL in your deployment environment variables.");
}

const convex = new ConvexReactClient(convexUrl || "https://diligent-warbler-176.convex.cloud");

export function ConvexProvider({ children }: { children: ReactNode }) {
  // If no Convex URL is set, show an error message instead of blank page
  if (!convexUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-700 mb-4">
            The application is missing required environment variables.
          </p>
          <p className="text-sm text-gray-500">
            Please contact the administrator to fix this issue.
          </p>
        </div>
      </div>
    );
  }

  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
