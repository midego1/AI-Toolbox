"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConvexUser } from "@/hooks/useConvexUser";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslations } from "@/lib/translations";
import {
  Home,
  Languages,
  FileText,
  Image,
  CreditCard,
  BarChart3,
  Settings,
  BookOpen,
  HelpCircle,
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
  Mail,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navigation = [
  { name: "Dashboard", key: "home", href: "/dashboard", icon: Home },
  { name: "AI Chat", key: "aiChat", href: "/tools/chat", icon: MessageSquare, badge: "new" },
  { name: "All Tools", key: "allTools", href: "/tools", icon: Zap },
];

const toolGroups = [
  {
    name: "🎅 Sinterklaas Tools",
    key: "sinterklaasTools",
    defaultOpen: false,
    children: [
      { name: "Gedichten Generator", key: "gedichtenGenerator", href: "/tools/gedichten", icon: BookOpen },
      { name: "Brief van Sinterklaas", key: "sinterklaasBrief", href: "/tools/sinterklaas-brief", icon: Mail },
      { name: "Sinterklaas Voicemail", key: "sinterklaasVoicemail", href: "/tools/sinterklaas-voicemail", icon: Mic },
      { name: "Lootjestrekken", key: "lootjestrekken", href: "/tools/lootjestrekken", icon: Gift },
      { name: "Familie Moment", key: "familieMoment", href: "/tools/familie-moment", icon: Users },
      { name: "Schoentje Tekening", key: "schoentjeTekening", href: "/tools/schoentje-tekening", icon: Image },
      { name: "Cadeautips", key: "cadeautips", href: "/tools/cadeautips", icon: Gift },
      { name: "Surprise Ideeën", key: "surpriseIdeeen", href: "/tools/surprises", icon: Package },
    ],
  },
  {
    name: "AI Tools",
    key: "aiTools",
    defaultOpen: false,
    children: [
      { name: "Copywriter Studio", key: "copywriterStudio", href: "/tools/copywriting", icon: PenTool },
      { name: "Summarizer", key: "summarizer", href: "/tools/summarizer", icon: FileText },
      { name: "Rewriter", key: "rewriter", href: "/tools/rewriter", icon: RefreshCw },
      { name: "SEO Optimizer", key: "seoOptimizer", href: "/tools/seo-optimizer", icon: TrendingUp },
      { name: "LinkedIn Content", key: "linkedInContent", href: "/tools/linkedin-content", icon: Linkedin },
      { name: "Translation", key: "translation", href: "/tools/translation", icon: Languages },
      { name: "Transcription", key: "transcription", href: "/tools/transcription", icon: Mic },
      { name: "OCR", key: "ocr", href: "/tools/ocr", icon: FileSearch },
      { name: "Image Generation", key: "imageGeneration", href: "/tools/image-generation", icon: Image },
      { name: "Background Remover", key: "backgroundRemover", href: "/tools/background-removal", icon: Scissors },
      { name: "Digital Wardrobe", key: "digitalWardrobe", href: "/tools/wardrobe", icon: Shirt },
    ],
  },
];

const accountNav = [
  { name: "Billing", key: "billing", href: "/billing", icon: CreditCard },
  { name: "Usage Stats", key: "usageStats", href: "/usage", icon: BarChart3 },
  { name: "Settings", key: "settings", href: "/settings", icon: Settings },
];

const secondaryNav = [
  { name: "Documentation", key: "documentation", href: "/docs", icon: BookOpen },
  { name: "Support", key: "support", href: "/support", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  // State for managing collapsed sections with localStorage persistence
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-collapsed');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse sidebar state:', e);
        }
      }
    }
    return {
      sinterklaasTools: false,
      aiTools: false,
    };
  });

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(openGroups));
    }
  }, [openGroups]);
  
  // Get current user to check admin status (works with Clerk)
  const { convexUser: user } = useConvexUser();
  
  const isAdmin = user?.isAdmin || false;
  
  // DEBUG: Log admin status
  useEffect(() => {
    console.log("🔍 Sidebar Debug:", {
      user,
      isAdmin,
      userIsAdmin: user?.isAdmin,
      userId: user?._id,
      userEmail: user?.email,
    });
  }, [user, isAdmin]);
  
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
      // Sinterklaas tools
      "/tools/gedichten": "sinterklaas_gedicht",
      "/tools/sinterklaas-brief": "sinterklaas_brief",
      "/tools/sinterklaas-voicemail": "sinterklaas_voicemail",
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
  
  // Tool name translations
  const toolNameTranslations: Record<string, Record<string, string>> = {
    copywriting: { en: "Copywriter Studio", nl: "Copywriter Studio" },
    summarizer: { en: "Summarizer", nl: "Samenvatter" },
    rewriter: { en: "Rewriter", nl: "Herformuleerder" },
    "seo-optimizer": { en: "SEO Optimizer", nl: "SEO Optimalisatie" },
    "linkedin-content": { en: "LinkedIn Content", nl: "LinkedIn Content" },
    translation: { en: "Translation", nl: "Vertaling" },
    transcription: { en: "Transcription", nl: "Transcriptie" },
    ocr: { en: "OCR", nl: "OCR" },
    "image-generation": { en: "Image Generation", nl: "Afbeelding Generatie" },
    "background-removal": { en: "Background Remover", nl: "Achtergrond Verwijderaar" },
    wardrobe: { en: "Digital Wardrobe", nl: "Virtuele Garderobe" },
  };

  // Translate tool names
  const getTranslatedToolName = (href: string, defaultName: string): string => {
    const toolId = getToolIdFromHref(href);
    if (toolId && toolNameTranslations[toolId]) {
      return toolNameTranslations[toolId][language] || defaultName;
    }
    return defaultName;
  };

  // Translate navigation item names
  const translateNavItem = (item: any): string => {
    if (item.key && t.sidebar[item.key as keyof typeof t.sidebar]) {
      return t.sidebar[item.key as keyof typeof t.sidebar];
    }
    return item.name;
  };

  // Filter and translate tool groups
  // Only filter if toolConfigs has loaded (avoid showing disabled tools during initial render)
  const filteredToolGroups = toolConfigs !== undefined ? toolGroups.map((group) => {
    const filteredChildren = group.children
      .filter((child: any) => {
        const toolId = getToolIdFromHref(child.href);
        return toolId ? isToolEnabled(toolId) : true;
      })
      .map((child: any) => ({
        ...child,
        name: child.key ? translateNavItem(child) : getTranslatedToolName(child.href, child.name),
      }));

    return {
      ...group,
      children: filteredChildren,
    };
  }).filter((group) => group.children.length > 0) : [];

  // Filter and translate navigation items
  const filteredNavigation = navigation.map((item) => ({
    ...item,
    name: translateNavItem(item),
  }));

  // Filter and translate account nav items
  const filteredAccountNav = accountNav.map((item) => ({
    ...item,
    name: translateNavItem(item),
  }));
  
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center">
            <span className="text-white font-bold text-lg">🎅</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            SinterklaasGPT
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {/* Primary Navigation Items */}
        {filteredNavigation.map((item) => {
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

        {/* Collapsible Tool Groups */}
        {filteredToolGroups.map((group) => {
          const isOpen = openGroups[group.key];
          const hasActiveChild = group.children.some(
            (child: any) => pathname === child.href
          );

          return (
            <Collapsible
              key={group.key}
              open={isOpen}
              onOpenChange={(open) =>
                setOpenGroups({ ...openGroups, [group.key]: open })
              }
            >
              <CollapsibleTrigger className="w-full">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
                    isOpen || hasActiveChild
                      ? "bg-muted/50 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-semibold">{group.name}</span>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 mt-1 space-y-1">
                {group.children.map((child: any) => {
                  const Icon = child.icon;
                  const isActive = pathname === child.href;
                  return (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {Icon && <Icon className="h-5 w-5" />}
                        <span>{child.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}

      </nav>

      {/* Account & Secondary Navigation - Fixed at bottom */}
      <div className="border-t px-3 py-4 space-y-1">
        {/* Account Navigation */}
        {filteredAccountNav.map((item) => {
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
            </Link>
          );
        })}
        
        {/* Secondary Navigation */}
        <div className="mt-2 pt-2 border-t">
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
        
        {/* Admin Settings - Only visible to admins */}
        {isAdmin && (
          <Link
            href="/settings/admin"
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mt-2",
              pathname?.startsWith("/settings/admin")
                ? "bg-red-500 text-white"
                : "text-red-600 hover:bg-red-50 hover:text-red-700"
            )}
          >
            <Shield className="h-5 w-5" />
            <span>{t.sidebar.adminSettings}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
