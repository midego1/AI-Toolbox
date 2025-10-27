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

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Preview mode - show content with blur overlay (not signed in)
  if (!isSignedIn || !user || convexUser === null) {
    return (
      <LanguageProvider>
        <div className="flex h-screen overflow-hidden relative">
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

          {/* Main Content with blur overlay */}
          <div className="flex flex-col flex-1 overflow-hidden relative">
            <DashboardHeader
              onMenuClick={() => setSidebarOpen(true)}
              credits={0}
              userName={null}
              userEmail={null}
            />
            <main className="flex-1 overflow-y-auto bg-muted/10 relative">
              <div className="blur-sm brightness-50 pointer-events-none select-none">
                {children}
              </div>
              <PreviewOverlay />
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
