"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignIn } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { PreviewOverlay } from "@/components/layout/preview-overlay";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useConvexUser } from "@/hooks/useConvexUser";
import { useAuthToken } from "@/hooks/useAuthToken";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get Clerk user
  const { isSignedIn, user, isLoaded } = useUser();
  
  // Get Convex user - will be created automatically if doesn't exist
  const { convexUser, isCreating } = useConvexUser();
  
  // Get token for Convex operations
  const token = useAuthToken();

  // Show loading state while checking auth or loading Convex user
  if (!isLoaded || convexUser === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Preview/Guest mode - allow limited access for anonymous tools
  if (!isSignedIn || !user || convexUser === null) {
    return (
      <LanguageProvider>
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r">
            <Sidebar />
          </aside>

          {/* Mobile Sidebar */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Main Content with guest banner */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <DashboardHeader
              onMenuClick={() => setSidebarOpen(true)}
              credits={0}
              userName={null}
              userEmail={null}
            />
            
            {/* Guest Upgrade Banner */}
            <div className="border-b bg-gradient-to-r from-red-50 to-orange-50">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-red-600">✨</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Using as guest
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sign in to save your work
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <main className="flex-1 overflow-y-auto bg-muted/10">
              {children}
            </main>
          </div>
        </div>
      </LanguageProvider>
    );
  }

  // Show brief loading if user is being created (only happens on first sign-in)
  if (isCreating) {
    return (
      <LanguageProvider>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Setting up your account...</p>
          </div>
        </div>
      </LanguageProvider>
    );
  }
  
  // Authenticated mode - normal dashboard
  // Show dashboard with Clerk data (Convex will sync in background)
  return (
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader
            onMenuClick={() => setSidebarOpen(true)}
            credits={convexUser?.creditsBalance ?? 10000}
            userName={convexUser?.name || user.fullName || user.firstName || "User"}
            userEmail={convexUser?.email || user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress}
          />
          <main className="flex-1 overflow-y-auto bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
