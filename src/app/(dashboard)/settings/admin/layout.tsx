"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { useConvexUser } from "@/hooks/useConvexUser";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const clerkUser = useClerkUser();
  
  // Get current user from Convex (works with Clerk)
  const { convexUser: user, isCreating } = useConvexUser();
  
  const [showTimeout, setShowTimeout] = useState(false);
  
  // Show timeout message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTimeout(true), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  // DEBUG: Log user data
  useEffect(() => {
    console.log("🔍 Admin Layout Debug:", {
      user,
      isCreating,
      isAdmin: user?.isAdmin,
      hasUser: !!user,
      clerkUser: clerkUser.user?.id,
      isSignedIn: clerkUser.isSignedIn,
    });
  }, [user, isCreating, clerkUser]);

  // Check admin status and redirect if not admin
  useEffect(() => {
    if (user !== undefined && user !== null) {
      if (!user.isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, router]);

  // Loading state (while creating user or user is loading)
  if (user === undefined || isCreating) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // User not found or not admin - Show debug info
  if (user === null || !user.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="max-w-2xl w-full p-6">
          <div className="border-2 border-destructive rounded-lg p-6 bg-destructive/10">
            <h2 className="text-2xl font-bold mb-4 text-destructive">❌ Admin Access Denied</h2>
            
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">User Found:</span> {user !== null ? "✅ Yes" : "❌ No"}
                </div>
                <div>
                  <span className="font-semibold">Admin Status:</span> {user?.isAdmin ? "✅ True" : "❌ False"}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">User ID:</span> {user?._id || "N/A"}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Email:</span> {user?.email || "N/A"}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-semibold mb-2">🔧 To Fix:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to <a href="https://dashboard.convex.dev" target="_blank" className="text-blue-600 underline">Convex Dashboard</a></li>
                  <li>Open your project → Data tab → users table</li>
                  <li>Find your user (by email: <code className="bg-gray-100 px-1">{user?.email || "your-email"}</code>)</li>
                  <li>Click the <code className="bg-gray-100 px-1">isAdmin</code> field and set it to <code className="bg-gray-100 px-1">true</code></li>
                  <li>Refresh this page</li>
                </ol>
              </div>
              
              <div className="mt-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


