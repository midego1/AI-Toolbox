"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PenTool, FileText, Linkedin, RefreshCw, TrendingUp, 
  Languages, Scissors, Mic, FileSearch, Image,
  Sparkles, Zap, Target, BookOpen, Mail, Gift,
  Package, Users, FileImage
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslations } from "@/lib/translations";

const ALL_TOOLS = [
  {
    id: "copywriting",
    name: "AI Copywriter Studio",
    description: "Generate professional marketing copy with multiple variants and A/B testing",
    icon: PenTool,
    href: "/tools/copywriting",
    category: "Content Creation",
    credits: "5-10",
    features: ["Email copy", "Ad copy", "Social posts", "Product descriptions"],
  },
  {
    id: "summarizer",
    name: "Text Summarizer",
    description: "Advanced text summarization with key points extraction and study questions",
    icon: FileText,
    href: "/tools/summarizer",
    category: "Text Processing",
    credits: "2-5",
    features: ["Multiple formats", "Key points", "Study questions", "Sentiment analysis"],
  },
  {
    id: "rewriter",
    name: "Content Rewriter",
    description: "Rewrite and paraphrase content with tone and complexity control",
    icon: RefreshCw,
    href: "/tools/rewriter",
    category: "Content Creation",
    credits: "3-7",
    features: ["Tone change", "Simplify/sophisticate", "SEO optimization"],
  },
  {
    id: "seo-optimizer",
    name: "SEO Optimizer",
    description: "Comprehensive SEO content optimization with keyword analysis",
    icon: TrendingUp,
    href: "/tools/seo-optimizer",
    category: "Marketing",
    credits: "8-12",
    features: ["On-page SEO", "Keyword density", "Meta tags", "Content structure"],
  },
  {
    id: "linkedin-content",
    name: "LinkedIn Content Engine",
    description: "Create engaging LinkedIn posts, articles, and profile content",
    icon: Linkedin,
    href: "/tools/linkedin-content",
    category: "Social Media",
    credits: "5-8",
    features: ["Posts", "Articles", "Profile optimization", "Job descriptions"],
  },
  {
    id: "translation",
    name: "Translation",
    description: "Translate text between 100+ languages with context awareness",
    icon: Languages,
    href: "/tools/translation",
    category: "Language",
    credits: "1-3",
    features: ["100+ languages", "Context-aware", "Fast processing"],
  },
  {
    id: "transcription",
    name: "Transcription Suite",
    description: "Transcribe audio/video with speaker diarization and content enhancement",
    icon: Mic,
    href: "/tools/transcription",
    category: "Audio Processing",
    credits: "5/min",
    features: ["Multiple languages", "Speaker detection", "Summaries", "Action items"],
  },
  {
    id: "ocr",
    name: "OCR Text Extraction",
    description: "Extract text from images with high accuracy",
    icon: FileSearch,
    href: "/tools/ocr",
    category: "Document Processing",
    credits: "5",
    features: ["Image to text", "Multiple languages", "High accuracy"],
  },
  {
    id: "image-generation",
    name: "Image Generation",
    description: "Create AI-generated images from text descriptions",
    icon: Image,
    href: "/tools/image-generation",
    category: "Creative",
    credits: "10-20",
    features: ["Text-to-image", "Multiple styles", "High quality"],
  },
  {
    id: "background-removal",
    name: "Background Remover",
    description: "Remove backgrounds from images with advanced edge refinement",
    icon: Scissors,
    href: "/tools/background-removal",
    category: "Image Editing",
    credits: "3-5",
    features: ["Transparent PNG", "Custom backgrounds", "Edge refinement"],
  },
  {
    id: "wardrobe",
    name: "Virtual Wardrobe",
    description: "Try on clothes virtually with AI - supports accessories, clothing, and footwear",
    icon: Sparkles,
    href: "/tools/wardrobe",
    category: "Fashion",
    credits: "15",
    features: ["Virtual try-on", "Accessories support", "Multiple styles"],
  },
  // Sinterklaas Tools
  {
    id: "sinterklaas_gedicht",
    name: "Gedichten Generator",
    description: "Generate personalized Sinterklaas poems in traditional Dutch style",
    icon: BookOpen,
    href: "/tools/gedichten",
    category: "🎅 Sinterklaas",
    credits: "10",
    features: ["Rhyming poems", "Multiple tones", "Traditional style"],
  },
  {
    id: "sinterklaas_brief",
    name: "Brief van Sinterklaas",
    description: "Create personalized letters from Sinterklaas to children",
    icon: Mail,
    href: "/tools/sinterklaas-brief",
    category: "🎅 Sinterklaas",
    credits: "15",
    features: ["Personalized letters", "Achievement mentions", "Encouragement"],
  },
  {
    id: "lootjestrekken",
    name: "Lootjestrekken",
    description: "Organize Secret Santa/Sinterklaas gift exchanges",
    icon: Gift,
    href: "/tools/lootjestrekken",
    category: "🎅 Sinterklaas",
    credits: "8",
    features: ["Gift exchange", "Pair matching", "Budget management"],
  },
  {
    id: "familie_moment",
    name: "Familie Moment",
    description: "Generate family Sinterklaas celebration illustrations",
    icon: Users,
    href: "/tools/familie-moment",
    category: "🎅 Sinterklaas",
    credits: "20",
    features: ["Family illustrations", "Celebration scenes", "AI-generated"],
  },
  {
    id: "schoentje_tekening",
    name: "Schoentje Tekening",
    description: "Visualize filled Dutch wooden clogs with Sinterklaas treats",
    icon: Image,
    href: "/tools/schoentje-tekening",
    category: "🎅 Sinterklaas",
    credits: "18",
    features: ["Clog drawings", "Filled treats", "Traditional Dutch"],
  },
  {
    id: "sinterklaas_illustratie",
    name: "Sinterklaas Illustratie",
    description: "Create Sinterklaas character illustrations",
    icon: FileImage,
    href: "/tools/sinterklaas-illustratie",
    category: "🎅 Sinterklaas",
    credits: "15",
    features: ["Character illustrations", "Traditional style", "Multiple poses"],
  },
  {
    id: "cadeautips",
    name: "Cadeautips",
    description: "Get personalized Sinterklaas gift recommendations",
    icon: Gift,
    href: "/tools/cadeautips",
    category: "🎅 Sinterklaas",
    credits: "15",
    features: ["Gift suggestions", "Budget ranges", "Age-appropriate"],
  },
  {
    id: "surprise_ideeen",
    name: "Surprise Ideeën",
    description: "Generate creative packaging ideas for Sinterklaas gifts",
    icon: Package,
    href: "/tools/surprises",
    category: "🎅 Sinterklaas",
    credits: "20",
    features: ["Packaging designs", "Creative wrapping", "Step-by-step guides"],
  },
  {
    id: "bulk_gedichten",
    name: "Bulk Gedichten",
    description: "Generate multiple Sinterklaas poems at once (for families/classes)",
    icon: BookOpen,
    href: "/tools/bulk-gedichten",
    category: "🎅 Sinterklaas",
    credits: "5/poem",
    features: ["Multiple poems", "CSV upload", "Batch processing"],
  },
  {
    id: "sinterklaas_traditie",
    name: "Sinterklaas Traditie",
    description: "Educational content about Sinterklaas traditions",
    icon: BookOpen,
    href: "/tools/sinterklaas-traditie",
    category: "🎅 Sinterklaas",
    credits: "5",
    features: ["Educational content", "Tradition history", "Cultural info"],
  },
];

export default function ToolsPage() {
  const { language } = useLanguage();
  const toolConfigs = useQuery(api.adminTools.getToolConfigsPublic);
  
  // Get translations
  const t = getTranslations(language);
  
  // Create a map of enabled/disabled status
  const toolStatusMap = new Map<string, boolean>();
  toolConfigs?.forEach((config) => {
    toolStatusMap.set(config.toolId, config.enabled);
  });
  
  // Filter tools based on enabled status
  // Only filter if toolConfigs has loaded (avoid showing disabled tools during initial render)
  const enabledTools = toolConfigs !== undefined ? ALL_TOOLS.filter(tool => {
    const status = toolStatusMap.get(tool.id);
    return status !== undefined ? status : true; // Default to enabled if not configured
  }) : []; // Show empty array while loading
  
  // Apply translations to tools
  const translatedTools = enabledTools.map(tool => ({
    ...tool,
    name: t.tools.toolNames[tool.id as keyof typeof t.tools.toolNames] || tool.name,
    description: t.tools.toolDescriptions[tool.id as keyof typeof t.tools.toolDescriptions] || tool.description,
    category: tool.category === "🎅 Sinterklaas" 
      ? tool.category 
      : (t.tools.categories[tool.category.toLowerCase().replace(/\s+/g, "") as keyof typeof t.tools.categories] || tool.category),
  }));
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Zap className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">{t.tools.title}</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          {t.tools.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{enabledTools.length}</p>
              <p className="text-sm text-muted-foreground">{t.tools.toolAvailable}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{enabledTools.length}</p>
              <p className="text-sm text-muted-foreground">{t.tools.enabledTools}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-1 text-primary" />
              <p className="text-sm text-muted-foreground">All Powered by AI</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Tools */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🚀 {t.tools.allTools}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {translatedTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.name} href={tool.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{language === "nl" ? "Categorie:" : "Category:"}</span>
                    <span className="font-medium">{tool.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{language === "nl" ? "Credits:" : "Credits:"}</span>
                    <span className="font-medium text-primary">{tool.credits}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        </div>
      </div>

      {/* Future Roadmap */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">🔮 Future Roadmap</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-base">AI Resume Builder</CardTitle>
              <CardDescription>ATS-optimized resumes with AI assistance</CardDescription>
            </CardHeader>
          </Card>
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-base">Logo Generator</CardTitle>
              <CardDescription>Create professional logos from descriptions</CardDescription>
            </CardHeader>
          </Card>
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-base">Video Summarizer</CardTitle>
              <CardDescription>Summarize YouTube videos and transcripts</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}

