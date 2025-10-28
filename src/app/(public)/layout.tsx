"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SidebarPublic } from "@/components/layout/sidebar-public";
import { DashboardHeaderPublic } from "@/components/layout/dashboard-header-public";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  // Redirect to dashboard if signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading spinner ONLY if Clerk is actively loading (not indefinitely)
  // If Clerk doesn't load, we still show the content to users
  if (isLoaded && isSignedIn) {
    // User is signed in - show spinner while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r">
        <SidebarPublic />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarPublic />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeaderPublic
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}


