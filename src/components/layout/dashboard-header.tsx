"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Gem, Bell, LogOut, User, Settings } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslations } from "@/lib/translations";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  credits: number;
  userName?: string | null;
  userEmail?: string | null;
}

export function DashboardHeader({
  onMenuClick,
  credits,
  userName,
  userEmail,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { language } = useLanguage();
  const t = getTranslations(language);

  const handleSignOut = async () => {
    try {
      // Sign out from Clerk
      await signOut({ redirectUrl: "/" });
      // Redirect will happen automatically
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback: just redirect to home
      router.push("/");
    }
  };

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
          <span className="sr-only">{t.header.toggleMenu}</span>
        </Button>

        {/* Logo (mobile only) - Clickable for anonymous users to return home */}
        <div className="lg:hidden flex items-center space-x-2">
          {!userName ? (
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <span className="text-lg font-bold">Toolbox</span>
            </Link>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
          )}
        </div>

        {/* Desktop Home Button for anonymous users */}
        {!userName && (
          <div className="hidden md:flex">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Credits Display - Only when logged in */}
        {userName && (
          <div className="flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
            <Gem className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{credits}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {t.common.credits}
            </span>
          </div>
        )}

        {/* Notifications - Only when logged in */}
        {userName && (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
            <span className="sr-only">{t.common.notifications}</span>
          </Button>
        )}

        {/* User Menu - Only when logged in */}
        {userName && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {userName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                {t.common.profile}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                {t.common.settings}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {t.common.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Sign up buttons when not logged in */}
        {!userName && (
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
        )}
      </div>
    </header>
  );
}
