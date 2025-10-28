"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthToken } from "@/hooks/useAuthToken";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslations } from "@/lib/translations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Languages,
  FileText,
  Image,
  Wand2,
  MessageSquare,
  TrendingUp,
  Clock,
  Zap,
  Scissors,
  Pen,
  Search,
  Mic,
  Linkedin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  BarChart3,
  Shirt,
  ChevronDown,
  ChevronRight,
  Eye,
  Download,
  Calendar,
  Target,
  Activity,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const quickAccessTools = [
  {
    name: "Chat",
    href: "/tools/chat",
    icon: MessageSquare,
    description: "AI conversations",
    color: "text-blue-500",
  },
  {
    name: "Translation",
    href: "/tools/translation",
    icon: Languages,
    description: "Translate text",
    color: "text-green-500",
  },
  {
    name: "OCR",
    href: "/tools/ocr",
    icon: FileText,
    description: "Extract text",
    color: "text-amber-500",
  },
  {
    name: "Image Gen",
    href: "/tools/image-generation",
    icon: Image,
    description: "Create images",
    color: "text-purple-500",
  },
  {
    name: "Wardrobe",
    href: "/tools/wardrobe",
    icon: Shirt,
    description: "Virtual try-on",
    color: "text-pink-500",
  },
  {
    name: "Background",
    href: "/tools/background-removal",
    icon: Scissors,
    description: "Remove BG",
    color: "text-red-500",
  },
  {
    name: "Copywriting",
    href: "/tools/copywriting",
    icon: Pen,
    description: "Generate copy",
    color: "text-indigo-500",
  },
  {
    name: "LinkedIn",
    href: "/tools/linkedin-content",
    icon: Linkedin,
    description: "Create posts",
    color: "text-blue-600",
  },
  {
    name: "Rewriter",
    href: "/tools/rewriter",
    icon: Wand2,
    description: "Rewrite text",
    color: "text-teal-500",
  },
  {
    name: "Summarizer",
    href: "/tools/summarizer",
    icon: FileText,
    description: "Summarize text",
    color: "text-cyan-500",
  },
  {
    name: "SEO",
    href: "/tools/seo-optimizer",
    icon: Search,
    description: "Optimize SEO",
    color: "text-emerald-500",
  },
  {
    name: "Transcription",
    href: "/tools/transcription",
    icon: Mic,
    description: "Audio to text",
    color: "text-orange-500",
  },
];

// Tool type display names
const toolTypeNames: Record<string, string> = {
  chat: "Chat",
  ai_chat: "AI Chat",
  translation: "Translation",
  ocr: "OCR",
  image_generation: "Image Generation",
  virtual_tryon: "Virtual Try-on",
  background_removal: "Background Removal",
  copywriting: "Copywriting",
  linkedin_content: "LinkedIn Content",
  rewriter: "Rewriter",
  summarizer: "Summarizer",
  seo_optimizer: "SEO Optimizer",
  transcription: "Transcription",
  cadeautips: "Cadeautips",
  sinterklaas_gedicht: "Sinterklaas Gedicht",
  surprise_ideeen: "Surprise Ideeën",
  schoentje_tekening: "Schoentje Tekening",
  sinterklaas_brief: "Sinterklaas Brief",
  lootjestrekken: "Lootjestrekken",
};

// Map tool types to their URLs
const toolTypeToUrl: Record<string, string> = {
  chat: "/tools/chat",
  ai_chat: "/tools/chat",
  translation: "/tools/translation",
  ocr: "/tools/ocr",
  image_generation: "/tools/image-generation",
  virtual_tryon: "/tools/wardrobe",
  background_removal: "/tools/background-removal",
  copywriting: "/tools/copywriting",
  linkedin_content: "/tools/linkedin-content",
  rewriter: "/tools/rewriter",
  summarizer: "/tools/summarizer",
  seo_optimizer: "/tools/seo-optimizer",
  transcription: "/tools/transcription",
  cadeautips: "/tools/cadeautips",
  sinterklaas_gedicht: "/tools/sinterklaas-gedicht",
  surprise_ideeen: "/tools/surprise-ideeen",
  schoentje_tekening: "/tools/schoentje-tekening",
  sinterklaas_brief: "/tools/sinterklaas-brief",
  lootjestrekken: "/tools/lootjestrekken",
};

// Format time ago
function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

// Format full date
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Generate preview for activity output
function generateOutputPreview(job: any): { text: string; hasImage: boolean; imageUrl?: string; storageId?: string } {
  if (!job.outputData) {
    return { text: "No output available", hasImage: false };
  }

  const output = job.outputData;

  switch (job.toolType) {
    case "chat":
      return { 
        text: output.content?.substring(0, 200) || "Chat response", 
        hasImage: false 
      };
    
    case "translation":
      return { 
        text: output.translatedText?.substring(0, 200) || "Translation completed", 
        hasImage: false 
      };
    
    case "ocr":
      return { 
        text: output.extractedText?.substring(0, 200) || "Text extracted", 
        hasImage: false 
      };
    
    case "image_generation":
      return { 
        text: output.prompt || "Image generated successfully",
        hasImage: true,
        imageUrl: output.imageUrl,
        storageId: job.outputFileId
      };
    
    case "virtual_tryon":
      return { 
        text: `Virtual try-on: ${output.itemType || "accessories"}`,
        hasImage: true,
        imageUrl: output.imageUrl, // Fixed: use imageUrl not outputImageUrl
        storageId: job.outputFileId
      };
    
    case "background_removal":
      // Background removal stores image in outputFileId, not in outputData
      return { 
        text: `Background removed • ${output.outputType || "cutout"} mode`,
        hasImage: true,
        imageUrl: undefined, // Will use storageId to fetch URL
        storageId: job.outputFileId
      };
    
    case "copywriting":
      const firstVariant = output.variants?.[0];
      return { 
        text: firstVariant?.copy?.substring(0, 200) || "Copywriting completed", 
        hasImage: false 
      };
    
    case "linkedin_content":
      const firstPost = output.contents?.[0];
      return { 
        text: firstPost?.text?.substring(0, 200) || "LinkedIn content created", 
        hasImage: false 
      };
    
    case "rewriter":
      const firstRewrite = output.rewrites?.[0];
      return { 
        text: firstRewrite?.text?.substring(0, 200) || "Text rewritten", 
        hasImage: false 
      };
    
    case "summarizer":
      return { 
        text: output.summary?.substring(0, 200) || "Text summarized", 
        hasImage: false 
      };
    
    case "seo_optimizer":
      return { 
        text: output.optimizedTitle || output.optimizedDescription?.substring(0, 200) || "SEO optimized", 
        hasImage: false 
      };
    
    case "transcription":
      return { 
        text: output.transcription?.substring(0, 200) || "Audio transcribed", 
        hasImage: false 
      };
    
    default:
      return { text: "Completed successfully", hasImage: false };
  }
}

// Activity Item Component  
function ActivityItem({ activity, token }: { activity: any; token: string | null }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const preview = generateOutputPreview(activity);

  // Fetch image URL from Convex storage if we have a storageId
  const storageImageUrl = useQuery(
    api.files.getFileUrl,
    isExpanded && preview.hasImage && preview.storageId && token
      ? { token, storageId: preview.storageId as any }
      : "skip"
  );

  const displayImageUrl = preview.imageUrl || storageImageUrl;

  return (
    <div className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start space-x-3 flex-1">
          {activity.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : activity.status === "failed" ? (
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-sm">
                {toolTypeNames[activity.toolType] || activity.toolType}
              </p>
              <Badge variant="outline" className="text-xs">
                -{activity.creditsUsed} credits
              </Badge>
              {preview.hasImage && (
                <Badge variant="secondary" className="text-xs">
                  <Image className="h-3 w-3 mr-1" />
                  Image
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {timeAgo(activity.createdAt)} • {formatDate(activity.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pl-8 space-y-2">
          {activity.status === "completed" && preview.text && (
            <div className="bg-muted/50 rounded-md p-3 space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Output Preview</span>
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">
                {preview.text}
                {preview.text.length >= 200 && "..."}
              </p>
              {preview.hasImage && (
                <div className="mt-3">
                  {!displayImageUrl && isExpanded && preview.storageId ? (
                    <div className="flex items-center justify-center py-8 bg-muted rounded-md">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : displayImageUrl ? (
                    <div className="relative group">
                      <img 
                        src={displayImageUrl} 
                        alt="Output preview" 
                        className="rounded-md w-full max-h-64 object-contain bg-muted/50"
                        onError={(e) => {
                          console.error('Image failed to load:', displayImageUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <a 
                        href={displayImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button size="sm" variant="secondary">
                          <Eye className="h-3 w-3 mr-1" />
                          View Full
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 bg-muted rounded-md text-muted-foreground text-sm">
                      Image not available
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activity.status === "failed" && activity.errorMessage && (
            <div className="bg-red-500/10 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                Error: {activity.errorMessage}
              </p>
            </div>
          )}

          {activity.inputData && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">Processing time:</span>
                <span>
                  {activity.completedAt 
                    ? `${Math.round((activity.completedAt - activity.createdAt) / 1000)}s`
                    : "N/A"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { language } = useLanguage();
  const t = getTranslations(language);
  
  // Get auth token (Clerk user ID or legacy token)
  const token = useAuthToken();
  
  // Tab state persistence
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboardActiveTab') || 'overview';
    }
    return 'overview';
  });
  
  // Save to localStorage when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardActiveTab', value);
    }
  };

  // Fetch dashboard data
  const dashboardStats = useQuery(
    api.users.getDashboardStats,
    token ? { token } : "skip"
  );

  const userProfile = useQuery(
    api.users.getUserProfile,
    token ? { token } : "skip"
  );

  const recentActivity = useQuery(
    api.history.getUserHistory,
    token ? { token, limit: 15 } : "skip"
  );

  const usageByTool = useQuery(
    api.history.getUsageByTool,
    token ? { token, timeRange: "30d" } : "skip"
  );

  const creditSpending = useQuery(
    api.history.getCreditSpendingOverTime,
    token ? { token, days: 7 } : "skip"
  );

  // Get tool configs to filter disabled tools
  // Add error handling to prevent infinite spinner
  const toolConfigs = useQuery(api.adminTools.getToolConfigsPublic, {}, {});
  
  // Create a map of enabled/disabled status
  const toolStatusMap = new Map<string, boolean>();
  toolConfigs?.forEach((config) => {
    toolStatusMap.set(config.toolId, config.enabled);
  });
  
  // Helper function to check if a tool is enabled
  const isToolEnabled = (href: string): boolean => {
    const toolMapping: Record<string, string> = {
      "/tools/translation": "translation",
      "/tools/ocr": "ocr",
      "/tools/image-generation": "image-generation",
      "/tools/wardrobe": "wardrobe",
      "/tools/background-removal": "background-removal",
      "/tools/copywriting": "copywriting",
      "/tools/linkedin-content": "linkedin-content",
      "/tools/rewriter": "rewriter",
      "/tools/summarizer": "summarizer",
      "/tools/seo-optimizer": "seo-optimizer",
      "/tools/transcription": "transcription",
    };
    
    const toolId = toolMapping[href];
    if (toolId) {
      const status = toolStatusMap.get(toolId);
      return status !== undefined ? status : true; // Default to enabled if not configured
    }
    return true; // Show non-monitored tools (chat, etc.)
  };
  
  // Get translated quick access tools
  const quickAccessToolsWithTranslations = quickAccessTools.map(tool => {
    const toolKey = tool.href.replace('/tools/', '');
    const translatedTool = {
      ...tool,
      name: t.tools.toolNames[toolKey as keyof typeof t.tools.toolNames] || tool.name,
      description: t.tools.toolDescriptions[toolKey as keyof typeof t.tools.toolDescriptions] || tool.description,
    };
    return translatedTool;
  });

  // Filter quick access tools based on enabled status (only when toolConfigs is loaded)
  const enabledQuickAccessTools = toolConfigs !== undefined 
    ? quickAccessToolsWithTranslations.filter(tool => isToolEnabled(tool.href))
    : []; // Show empty array while loading to avoid flash

  // Loading state - include toolConfigs
  const isLoadingTools = toolConfigs === undefined;
  const isLoading = !dashboardStats || !userProfile;

  // Calculate percentage remaining
  const creditsBalance = dashboardStats?.creditsBalance || 0;
  const creditsUsed = dashboardStats?.creditsUsedLast30Days || 0;
  const totalCredits = creditsBalance + creditsUsed;
  const percentRemaining = totalCredits > 0 
    ? Math.round((creditsBalance / totalCredits) * 100) 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">
            {userProfile?.name 
              ? `${t.dashboard.welcomeBack}, ${userProfile.name}!` 
              : `${t.dashboard.welcome}! ${t.dashboard.yourStats}`}
          </p>
        </div>
        {userProfile?.subscriptionTier && (
          <Badge variant="secondary" className="text-sm capitalize">
            {userProfile.subscriptionTier} Plan
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t.dashboard.overview}</TabsTrigger>
          <TabsTrigger value="activity">{t.dashboard.activity}</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Credits Remaining
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {creditsBalance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userProfile?.subscriptionTier === "free" ? "Free Plan" : `${userProfile?.subscriptionTier} Plan`}
                </p>
                <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all"
                    style={{ width: `${Math.min(percentRemaining, 100)}%` }}
                  />
                </div>
              </>
            )}
          </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {creditsUsed.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Credits used
                </p>
                {creditSpending && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ~{creditSpending.averagePerDay}/day avg
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardStats?.totalJobs.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
                <div className="flex items-center space-x-3 mt-2 text-xs">
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{dashboardStats?.completedJobs || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>{dashboardStats?.failedJobs || 0}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardStats?.totalJobs > 0
                    ? Math.round((dashboardStats.completedJobs / dashboardStats.totalJobs) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Completion rate
                </p>
                {usageByTool?.totalJobs && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {usageByTool.totalJobs} this month
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Tools */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{t.dashboard.quickAccess}</h2>
          <Link href="/tools">
            <Button variant="outline" size="sm">
              {t.tools.viewAllTools} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoadingTools ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="text-center space-y-2 p-4">
                  <div className="mx-auto h-8 w-8 bg-muted rounded-full" />
                  <div className="h-4 w-16 bg-muted rounded mx-auto" />
                  <div className="h-3 w-20 bg-muted rounded mx-auto" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {enabledQuickAccessTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.href}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                    <CardHeader className="text-center space-y-2 p-4">
                      <div className="mx-auto">
                        <Icon className={`h-8 w-8 ${tool.color}`} />
                      </div>
                      <CardTitle className="text-sm">{tool.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          {/* Activity Summary Cards */}
          {recentActivity && recentActivity.jobs && recentActivity.jobs.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">{t.dashboard.recentActivity}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {recentActivity.jobs.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">jobs displayed</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Success Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {recentActivity.jobs.length > 0
                          ? Math.round((recentActivity.jobs.filter(j => j.status === "completed").length / recentActivity.jobs.length) * 100)
                          : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">completion rate</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Credits Used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {recentActivity.jobs.reduce((sum, job) => sum + (job.creditsUsed || 0), 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">in recent jobs</p>
                    </div>
                    <Zap className="h-8 w-8 text-amber-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Most Used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-sm font-bold truncate">
                        {(() => {
                          const toolCounts: Record<string, number> = {};
                          recentActivity.jobs.forEach(job => {
                            toolCounts[job.toolType] = (toolCounts[job.toolType] || 0) + 1;
                          });
                          const mostUsed = Object.entries(toolCounts).sort((a, b) => b[1] - a[1])[0];
                          return mostUsed ? toolTypeNames[mostUsed[0]] || mostUsed[0] : "N/A";
                        })()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">top tool</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Activity Grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Activity Feed - Takes 2 columns */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>Activity Feed</span>
                    </CardTitle>
                    <CardDescription>Your latest AI tool usage with detailed outputs</CardDescription>
                  </div>
                  <Link href="/usage">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!recentActivity ? (
                  <div className="flex items-center justify-center py-12 px-6">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !recentActivity.jobs || recentActivity.jobs.length === 0 ? (
                  <div className="text-center py-12 px-6 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No activity yet</p>
                    <p className="text-xs mt-1">Start using tools to see your activity here</p>
                    <Link href="/tools">
                      <Button variant="outline" size="sm" className="mt-4">
                        Explore Tools <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 px-6 py-4">
                    {recentActivity.jobs.map((activity) => (
                      <ActivityItem key={activity._id} activity={activity} token={token} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column - Stats & Insights */}
            <div className="space-y-4">
              {/* Status Breakdown */}
              {recentActivity && recentActivity.jobs && recentActivity.jobs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Status Breakdown</span>
                    </CardTitle>
                    <CardDescription className="text-xs">Last {recentActivity.jobs.length} jobs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const completed = recentActivity.jobs.filter(j => j.status === "completed").length;
                      const failed = recentActivity.jobs.filter(j => j.status === "failed").length;
                      const processing = recentActivity.jobs.filter(j => j.status === "processing").length;
                      const total = recentActivity.jobs.length;

                      return (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-muted-foreground">Completed</span>
                              </div>
                              <span className="font-medium">{completed}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-green-500 rounded-full h-2"
                                style={{ width: `${(completed / total) * 100}%` }}
                              />
                            </div>
                          </div>

                          {failed > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <span className="text-muted-foreground">Failed</span>
                                </div>
                                <span className="font-medium">{failed}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-red-500 rounded-full h-2"
                                  style={{ width: `${(failed / total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {processing > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                                  <span className="text-muted-foreground">Processing</span>
                                </div>
                                <span className="font-medium">{processing}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-blue-500 rounded-full h-2"
                                  style={{ width: `${(processing / total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Tool Usage in Recent Activity */}
              {recentActivity && recentActivity.jobs && recentActivity.jobs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Tools Used</span>
                    </CardTitle>
                    <CardDescription className="text-xs">Recent activity breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const toolCounts: Record<string, { count: number; credits: number }> = {};
                        recentActivity.jobs.forEach(job => {
                          if (!toolCounts[job.toolType]) {
                            toolCounts[job.toolType] = { count: 0, credits: 0 };
                          }
                          toolCounts[job.toolType].count++;
                          toolCounts[job.toolType].credits += job.creditsUsed || 0;
                        });

                        const sortedTools = Object.entries(toolCounts)
                          .sort((a, b) => b[1].count - a[1].count)
                          .slice(0, 5);

                        return sortedTools.map(([toolType, data]) => (
                          <div key={toolType} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">
                                {toolTypeNames[toolType] || toolType}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {data.count}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{data.credits} credits</span>
                              <span>{((data.count / recentActivity.jobs.length) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-1.5"
                                style={{ width: `${(data.count / recentActivity.jobs.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Time Distribution */}
              {recentActivity && recentActivity.jobs && recentActivity.jobs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Activity Timeline</span>
                    </CardTitle>
                    <CardDescription className="text-xs">When you're most active</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const now = Date.now();
                        const last1h = recentActivity.jobs.filter(j => now - j.createdAt < 3600000).length;
                        const last24h = recentActivity.jobs.filter(j => now - j.createdAt < 86400000).length;
                        const last7d = recentActivity.jobs.filter(j => now - j.createdAt < 604800000).length;
                        const total = recentActivity.jobs.length;

                        return (
                          <>
                            <div className="flex items-center justify-between py-2 border-b">
                              <span className="text-sm text-muted-foreground">Last hour</span>
                              <span className="text-sm font-bold">{last1h} jobs</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                              <span className="text-sm text-muted-foreground">Last 24 hours</span>
                              <span className="text-sm font-bold">{last24h} jobs</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                              <span className="text-sm text-muted-foreground">Last 7 days</span>
                              <span className="text-sm font-bold">{last7d} jobs</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-sm text-muted-foreground">Total shown</span>
                              <span className="text-sm font-bold">{total} jobs</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              {recentActivity && recentActivity.jobs && recentActivity.jobs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Quick Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(() => {
                      const totalCredits = recentActivity.jobs.reduce((sum, job) => sum + (job.creditsUsed || 0), 0);
                      const avgCredits = totalCredits / recentActivity.jobs.length;
                      const completedJobs = recentActivity.jobs.filter(j => j.status === "completed");
                      const avgProcessingTime = completedJobs.length > 0
                        ? completedJobs.reduce((sum, job) => {
                            const time = job.completedAt && job.createdAt ? job.completedAt - job.createdAt : 0;
                            return sum + time;
                          }, 0) / completedJobs.length / 1000
                        : 0;

                      return (
                        <>
                          <div className="flex items-center justify-between text-xs py-1.5">
                            <span className="text-muted-foreground">Avg credits/job</span>
                            <span className="font-medium">{avgCredits.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs py-1.5">
                            <span className="text-muted-foreground">Avg processing</span>
                            <span className="font-medium">{avgProcessingTime.toFixed(1)}s</span>
                          </div>
                          <div className="flex items-center justify-between text-xs py-1.5">
                            <span className="text-muted-foreground">Total credits</span>
                            <span className="font-medium">{totalCredits}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs py-1.5">
                            <span className="text-muted-foreground">Unique tools</span>
                            <span className="font-medium">
                              {new Set(recentActivity.jobs.map(j => j.toolType)).size}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Total Usage (30d)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {usageByTool?.totalJobs.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">jobs completed</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Credits Spent (30d)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {usageByTool?.totalCreditsSpent.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">total credits</p>
                  </div>
                  <Zap className="h-8 w-8 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Avg Cost/Job</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {usageByTool && usageByTool.totalJobs > 0 
                        ? Math.round(usageByTool.totalCreditsSpent / usageByTool.totalJobs)
                        : 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">credits per job</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Daily Average (7d)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {creditSpending?.averagePerDay || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">credits/day</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics Grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Top Tools - Takes 2 columns */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Tool Usage Breakdown</span>
                    </CardTitle>
                    <CardDescription>Last 30 days • All tools ranked by usage</CardDescription>
                  </div>
                  <Link href="/usage">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
            {!usageByTool ? (
              <div className="flex items-center justify-center py-8 px-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !usageByTool.usage || usageByTool.usage.length === 0 ? (
              <div className="text-center py-8 px-6 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No usage data yet</p>
                <p className="text-xs mt-1">Start using tools to see statistics</p>
              </div>
            ) : (
              <div className="overflow-y-auto px-6 py-4 space-y-2">
                {usageByTool.usage.map((tool, index) => {
                  const percentage = usageByTool.totalJobs > 0 
                    ? (tool.count / usageByTool.totalJobs) * 100 
                    : 0;
                  const avgCost = tool.count > 0 ? tool.totalCredits / tool.count : 0;
                  
                  const toolUrl = toolTypeToUrl[tool.toolType];
                  const displayName = toolTypeNames[tool.toolType] || tool.toolType;
                  
                  return (
                    <div key={tool.toolType} className="group">
                      {toolUrl ? (
                        <Link href={toolUrl}>
                          <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                            {/* Rank & Tool Name */}
                            <div className="flex items-center gap-2 flex-shrink-0 min-w-0 flex-1">
                              <span className="text-xs font-bold text-muted-foreground bg-muted w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-sm font-medium truncate">
                                {displayName}
                              </span>
                            </div>
                            
                            {/* Bar */}
                            <div className="flex-1 min-w-0">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all"
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                              </div>
                            </div>
                            
                            {/* Stats */}
                            <div className="flex items-center gap-3 text-xs flex-shrink-0">
                              <Badge variant="secondary" className="text-xs">
                                {tool.count}
                              </Badge>
                              <span className="text-muted-foreground min-w-[60px] text-right">
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                          {/* Rank & Tool Name */}
                          <div className="flex items-center gap-2 flex-shrink-0 min-w-0 flex-1">
                            <span className="text-xs font-bold text-muted-foreground bg-muted w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium truncate">
                              {displayName}
                            </span>
                          </div>
                          
                          {/* Bar */}
                          <div className="flex-1 min-w-0">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Stats */}
                          <div className="flex items-center gap-3 text-xs flex-shrink-0">
                            <Badge variant="secondary" className="text-xs">
                              {tool.count}
                            </Badge>
                            <span className="text-muted-foreground min-w-[60px] text-right">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
               </div>
             )}
              </CardContent>
            </Card>

            {/* Right Column - Credit Timeline & Stats */}
            <div className="space-y-4">
              {/* Credit Spending Timeline */}
              {creditSpending && creditSpending.spending && creditSpending.spending.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>7-Day Trend</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {creditSpending.totalCredits} credits • {creditSpending.averagePerDay}/day avg
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5">
                      {creditSpending.spending.map((day) => {
                        const maxCredits = Math.max(...creditSpending.spending.map(d => d.credits));
                        const percentage = maxCredits > 0 ? (day.credits / maxCredits) * 100 : 0;
                        const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                        
                        return (
                          <div key={day.date}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs ${isToday ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                {new Date(day.date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                                {isToday && ' (Today)'}
                              </span>
                              <span className="text-xs font-medium">
                                {day.credits}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-1.5 transition-all"
                                style={{ width: `${Math.max(percentage, 2)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Success Rate Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Performance</span>
                  </CardTitle>
                  <CardDescription className="text-xs">Job completion metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{dashboardStats?.completedJobs || 0}</span>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 rounded-full h-2"
                        style={{ 
                          width: `${dashboardStats?.totalJobs ? (dashboardStats.completedJobs / dashboardStats.totalJobs) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Failed</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{dashboardStats?.failedJobs || 0}</span>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-red-500 rounded-full h-2"
                        style={{ 
                          width: `${dashboardStats?.totalJobs ? (dashboardStats.failedJobs / dashboardStats.totalJobs) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-2xl font-bold text-green-600">
                        {dashboardStats?.totalJobs
                          ? Math.round((dashboardStats.completedJobs / dashboardStats.totalJobs) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top 3 Most Expensive Tools */}
              {usageByTool && usageByTool.usage && usageByTool.usage.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Most Expensive</span>
                    </CardTitle>
                    <CardDescription className="text-xs">Top credit consumers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...usageByTool.usage]
                        .sort((a, b) => b.totalCredits - a.totalCredits)
                        .slice(0, 3)
                        .map((tool, index) => {
                          const avgCost = tool.count > 0 ? tool.totalCredits / tool.count : 0;
                          return (
                            <div key={tool.toolType} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <span className="text-xs font-bold text-muted-foreground w-5">
                                  #{index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {toolTypeNames[tool.toolType] || tool.toolType}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {avgCost.toFixed(1)} credits/use
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">{tool.totalCredits}</p>
                                <p className="text-xs text-muted-foreground">credits</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Additional Analytics Row */}
          {usageByTool && usageByTool.usage && usageByTool.usage.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Most Used Tool */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span>Most Used Tool</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {toolTypeNames[usageByTool.usage[0].toolType] || usageByTool.usage[0].toolType}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {usageByTool.usage[0].count} uses • {usageByTool.usage[0].totalCredits} credits
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {((usageByTool.usage[0].count / usageByTool.totalJobs) * 100).toFixed(1)}% of all jobs
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Most Efficient Tool */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span>Most Efficient</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const mostEfficient = [...usageByTool.usage]
                      .filter(tool => tool.count > 2) // Only tools with meaningful usage
                      .sort((a, b) => (a.totalCredits / a.count) - (b.totalCredits / b.count))[0];
                    
                    if (!mostEfficient) return <p className="text-sm text-muted-foreground text-center py-4">Not enough data</p>;
                    
                    const avgCost = mostEfficient.totalCredits / mostEfficient.count;
                    return (
                      <div className="text-center py-4">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {toolTypeNames[mostEfficient.toolType] || mostEfficient.toolType}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Only {avgCost.toFixed(1)} credits per use
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {mostEfficient.count} times used
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Total Tools Used */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <span>Tool Variety</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {usageByTool.usage.length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      different tools used
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {usageByTool.usage.filter(t => t.count > 5).length} tools used 5+ times
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Low Credits Warning */}
      {creditsBalance < 50 && creditsBalance > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <CardTitle className="text-base">Low Credits</CardTitle>
                <CardDescription className="mt-1">
                  You have {creditsBalance} credits remaining. Consider purchasing more to continue using AI tools.
                </CardDescription>
                <Link href="/billing">
                  <Button size="sm" className="mt-3">
                    Buy Credits <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
