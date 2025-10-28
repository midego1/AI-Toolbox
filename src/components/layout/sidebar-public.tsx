"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Home,
  Languages,
  FileText,
  Image,
  CreditCard,
  BarChart3,
  Settings,
  Shirt,
  PenTool,
  Zap,
  RefreshCw,
  TrendingUp,
  Linkedin,
  Mic,
  Scissors,
  FileSearch,
  MessageSquare,
  Shield,
  Gift,
  Package,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "AI Tools", href: "#tools", icon: Zap },
  { name: "AI Chat", href: "/login", icon: MessageSquare, requiresAuth: true },
  {
    name: "🎅 Sinterklaas Tools",
    icon: null,
    children: [
      { name: "Gedichten Generator", href: "/tools/gedichten", icon: BookOpen, requiresAuth: true },
      { name: "Cadeautips", href: "/tools/cadeautips", icon: Gift, requiresAuth: true },
      { name: "Surprise Ideeën", href: "/tools/surprises", icon: Package, requiresAuth: true },
    ],
  },
  {
    name: "Creative & Content Tools",
    icon: null,
    children: [
      { name: "Copywriter Studio", href: "/tools/copywriting", icon: PenTool, requiresAuth: true },
      { name: "Summarizer", href: "/tools/summarizer", icon: FileText, requiresAuth: true },
      { name: "Rewriter", href: "/tools/rewriter", icon: RefreshCw, requiresAuth: true },
      { name: "SEO Optimizer", href: "/tools/seo-optimizer", icon: TrendingUp, requiresAuth: true },
      { name: "LinkedIn Content", href: "/tools/linkedin-content", icon: Linkedin, requiresAuth: true },
      { name: "Translation", href: "/tools/translation", icon: Languages, requiresAuth: true },
      { name: "Transcription", href: "/tools/transcription", icon: Mic, requiresAuth: true },
      { name: "OCR", href: "/tools/ocr", icon: FileSearch, requiresAuth: true },
      { name: "Image Generation", href: "/tools/image-generation", icon: Image, requiresAuth: true },
      { name: "Background Remover", href: "/tools/background-removal", icon: Scissors, requiresAuth: true },
      { name: "Digital Wardrobe", href: "/tools/wardrobe", icon: Shirt, requiresAuth: true },
    ],
  },
];

export function SidebarPublic() {
  const pathname = usePathname();
  
  // Get tool configs to check which tools are enabled
  const toolConfigs = useQuery(api.adminTools.getToolConfigsPublic);
  
  // Create a map of enabled/disabled status
  const toolStatusMap = new Map<string, boolean>();
  toolConfigs?.forEach((config) => {
    toolStatusMap.set(config.toolId, config.enabled);
  });
  
  // Helper function to check if a tool is enabled
  const isToolEnabled = (toolId: string): boolean => {
    const config = toolConfigs?.find(c => c.toolId === toolId);
    if (!config) return true; // Default to enabled if not configured
    return config.enabled && (config.showInSidebar !== false); // Only show if enabled AND visible in sidebar
  };
  
  // Map href to tool ID for filtering
  const getToolIdFromHref = (href: string): string | null => {
    const toolMapping: Record<string, string> = {
      "/tools/copywriting": "copywriting",
      "/tools/summarizer": "summarizer",
      "/tools/rewriter": "rewriter",
      "/tools/seo-optimizer": "seo-optimizer",
      "/tools/linkedin-content": "linkedin-content",
      "/tools/translation": "translation",
      "/tools/transcription": "transcription",
      "/tools/ocr": "ocr",
      "/tools/image-generation": "image-generation",
      "/tools/background-removal": "background-removal",
      "/tools/wardrobe": "wardrobe",
      "/tools/gedichten": "sinterklaas_gedicht",
      "/tools/sinterklaas-brief": "sinterklaas_brief",
      "/tools/lootjestrekken": "lootjestrekken",
      "/tools/familie-moment": "familie_moment",
      "/tools/schoentje-tekening": "schoentje_tekening",
      "/tools/sinterklaas-illustratie": "sinterklaas_illustratie",
      "/tools/cadeautips": "cadeautips",
      "/tools/surprises": "surprise_ideeen",
      "/tools/bulk-gedichten": "bulk_gedichten",
      "/tools/sinterklaas-traditie": "sinterklaas_traditie",
    };
    return toolMapping[href] || null;
  };
  
  // Filter navigation items based on enabled status
  // Only filter if toolConfigs has loaded (avoid showing disabled tools during initial render)
  const filteredNavigation = toolConfigs !== undefined ? navigation.map((item) => {
    if (item.children) {
      return {
        ...item,
        children: item.children
          .filter((child: any) => {
            // Check if tool is enabled based on original href (before /login redirect)
            const toolId = getToolIdFromHref(child.href);
            return toolId ? isToolEnabled(toolId) : true;
          }),
      };
    }
    return item;
  }).filter((item) => {
    // Hide category headers if they have no children
    if (item.children) {
      return item.children.length > 0;
    }
    return true;
  }) : []; // Show empty array while loading

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center">
            <span className="text-white font-bold text-lg">🎅</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            SinterklaasGPT
          </span>
        </Link>
      </div>

      {/* Get Started CTA */}
      <div className="mx-3 my-4 p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
        <h3 className="text-white font-semibold text-sm mb-2">Get Started</h3>
        <p className="text-white/90 text-xs mb-3">
          Sign up to access all AI tools and features
        </p>
        <Link href="/signup">
          <Button size="sm" variant="secondary" className="w-full">
            Sign Up Free
          </Button>
        </Link>
        <Link href="/login">
          <Button size="sm" variant="ghost" className="w-full mt-2 text-white hover:text-white hover:bg-white/10">
            Log In
          </Button>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {filteredNavigation.map((item) => {
          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {item.name}
                </div>
                {item.children.map((child: any) => {
                  const Icon = child.icon;
                  const isActive = pathname === child.href;
                  // Use the actual href - let the dashboard layout handle preview mode
                  const href = child.href;
                  return (
                    <Link
                      key={child.name}
                      href={href}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span>{child.name}</span>
                      </div>
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
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center space-x-3">
                {Icon && <Icon className="h-5 w-5" />}
                <span>{item.name}</span>
              </div>
              {(item as any).badge && (
                <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                  {(item as any).badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Info Section */}
      <div className="border-t px-3 py-4 space-y-2">
        <div className="p-3 bg-muted/50 rounded-lg text-sm">
          <p className="font-medium mb-1">🎁 Free Trial</p>
          <p className="text-xs text-muted-foreground">
            Get 100 credits to explore all features
          </p>
        </div>
      </div>
    </div>
  );
}
