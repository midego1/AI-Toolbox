"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function PreviewOverlay() {
  const router = useRouter();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <Card className="max-w-md mx-4 p-8 shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in-95 duration-300 bg-white/95 backdrop-blur-xl">
        <div className="text-center space-y-6">
          {/* Lock Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>

          {/* Title */}
          <div>
            <h3 className="text-2xl font-bold text-red-900 mb-2">
              Unlock All AI Tools
            </h3>
            <p className="text-muted-foreground">
              Sign up to access this feature and 20+ more AI-powered tools
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-red-600" />
              <span className="text-sm">100 free credits to start</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-red-600" />
              <span className="text-sm">Access to all 20+ AI tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-red-600" />
              <span className="text-sm">No credit card required</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link href="/signup" className="block">
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                onClick={() => router.push("/signup")}
              >
                Sign Up Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Already have an account? Log in
              </Button>
            </Link>
          </div>

          {/* Trust Text */}
          <p className="text-xs text-muted-foreground">
            Join 100+ users creating amazing content with AI
          </p>
        </div>
      </Card>
    </div>
  );
}
