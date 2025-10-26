"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Languages,
  FileText,
  Image,
  Camera,
  Linkedin,
  CreditCard,
  BarChart3,
  Settings,
  BookOpen,
  HelpCircle,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  {
    name: "AI Tools",
    icon: null,
    children: [
      { name: "Translation", href: "/tools/translation", icon: Languages },
      { name: "OCR", href: "/tools/ocr", icon: FileText },
      { name: "Image Generation", href: "/tools/image-generation", icon: Image },
      { name: "Headshot", href: "/tools/headshot", icon: Camera },
      { name: "LinkedIn", href: "/tools/linkedin", icon: Linkedin },
    ],
  },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Usage Stats", href: "/usage", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const secondaryNav = [
  { name: "Documentation", href: "/docs", icon: BookOpen },
  { name: "Support", href: "/support", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">AI</span>
          </div>
          <span className="text-xl font-bold">Toolbox</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {item.name}
                </div>
                {item.children.map((child) => {
                  const Icon = child.icon;
                  const isActive = pathname === child.href;
                  return (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{child.name}</span>
                    </Link>
                  );
                })}
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t px-3 py-4 space-y-1">
        {secondaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
