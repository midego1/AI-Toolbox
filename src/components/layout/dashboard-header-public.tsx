"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardHeaderPublicProps {
  onMenuClick: () => void;
}

export function DashboardHeaderPublic({
  onMenuClick,
}: DashboardHeaderPublicProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo (mobile only) */}
        <div className="lg:hidden flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center">
            <span className="text-white font-bold text-lg">🎅</span>
          </div>
          <span className="text-lg font-bold">SinterklaasGPT</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

