"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { useState } from "react";

export function GuestUpgradeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="border-b bg-gradient-to-r from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Sparkles className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Using as guest
              </p>
              <p className="text-xs text-muted-foreground">
                Sign in to save your work & unlock all tools
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/signup">
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                Free Sign Up
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subtle floating upgrade prompt
export function FloatingUpgradePrompt() {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
      <Link href="/signup">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg shadow-xl hover:shadow-2xl transition-all max-w-xs border-2 border-white">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">Unlock Full Access</p>
              <p className="text-xs opacity-90">
                Sign up free to save your work
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

