"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gift, BookOpen, Package, CheckCircle2, ArrowRight,
  Sparkles, Star, Heart, Cookie, ShoppingBag,
  PenTool, Image, Languages, FileText, TrendingUp,
  Scissors, Linkedin
} from "lucide-react";

// Countdown component
function SinterklaasCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [targetDateStr, setTargetDateStr] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let targetDate = new Date(2025, 11, 5, 23, 59, 59); // December 5th, 2025 - Pakjesavond!
      
      // If December 5th, 2025 has passed, target 2026
      if (now > targetDate) {
        targetDate = new Date(2026, 11, 5, 23, 59, 59);
      }

      // Format target date for display (date only, no time)
      const dateStr = targetDate.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      setTargetDateStr(dateStr);

      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  const CountdownBox = ({ label, value }: { label: string; value: number }) => (
    <div className="bg-white rounded-xl shadow-xl p-3 md:p-4 min-w-[70px] md:min-w-[90px] border-3 border-red-300 hover:scale-110 transition-transform duration-300">
      <div className="text-2xl md:text-4xl font-extrabold text-red-600 mb-1">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">
        {label}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 rounded-3xl border-4 border-red-400 shadow-2xl p-6 md:p-8 animate-fade-in backdrop-blur-sm">
      <div className="text-center mb-4 md:mb-6">
        <div className="inline-flex items-center gap-2 px-3 md:px-5 py-2 bg-gradient-to-r from-red-100 to-orange-100 rounded-full shadow-lg border-2 border-red-300">
          <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-red-600 animate-sparkle" />
          <span className="text-sm md:text-base font-extrabold text-red-900">
            Sinterklaas komt eraan!
          </span>
          <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-red-600 animate-sparkle" />
        </div>
      </div>

      <div className="flex justify-center gap-2 md:gap-4 mb-4 md:mb-6 flex-wrap">
        <CountdownBox label="Dagen" value={timeLeft.days} />
        <CountdownBox label="Uren" value={timeLeft.hours} />
        <CountdownBox label="Min" value={timeLeft.minutes} />
        <CountdownBox label="Sec" value={timeLeft.seconds} />
      </div>

      {/* Target Date Display */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full border-2 border-red-200 shadow-sm">
          <span className="text-xs md:text-sm font-semibold text-red-800">
            📅 {targetDateStr}
          </span>
        </div>
      </div>

      <div className="text-center text-xs md:text-sm font-semibold text-muted-foreground">
        <span className="inline-block animate-bounce text-2xl">🎅</span>
        <span className="mx-2">Tot pakjesavond!</span>
        <span className="inline-block animate-bounce text-2xl">🎁</span>
      </div>
    </div>
  );
}

const coreFeatures = [
  {
    icon: BookOpen,
    title: "Gedichten Generator",
    description: "Persoonlijke Sinterklaas gedichten in seconden",
    emoji: "📜",
    color: "from-red-500 to-red-600"
  },
  {
    icon: Gift,
    title: "Cadeautips",
    description: "Perfect cadeau op basis van leeftijd & interesse",
    emoji: "🎁",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Package,
    title: "Surprise Ideeën",
    description: "Creatieve verpakkingsideeën met AI",
    emoji: "🎨",
    color: "from-amber-500 to-amber-600"
  },
  {
    icon: Sparkles,
    title: "Sinterklaasbrief",
    description: "Unieke brieven van de Sint voor elk kind",
    emoji: "✉️",
    color: "from-purple-500 to-purple-600"
  }
];

const aiTools = [
  { icon: PenTool, name: "Copywriter Studio", desc: "Marketing copy" },
  { icon: FileText, name: "Summarizer", desc: "Text summaries" },
  { icon: Image, name: "Image Generation", desc: "AI art" },
  { icon: Languages, name: "Translation", desc: "100+ languages" },
  { icon: TrendingUp, name: "SEO Optimizer", desc: "SEO content" },
  { icon: Linkedin, name: "LinkedIn Content", desc: "Professional posts" },
  { icon: Scissors, name: "Background Remover", desc: "Remove backgrounds" },
  { icon: Cookie, name: "Sinterklaas Tools", desc: "Traditional tools" },
];

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50 via-white to-red-50 pb-12">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto text-center">
            {/* Countdown */}
            <div className="mb-6">
              <SinterklaasCountdown />
            </div>
            
            <div className="text-6xl mb-4 animate-bounce">🎅</div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Maak Dit Pakjesavond Onvergetelijk
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              AI-gegenereerde gedichten, cadeautips en verrassingen. Geen stress, alleen plezier! 🎁
            </p>
            
            {/* Quick Access Tools */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Link 
                href="/tools/translation" 
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-red-300"
              >
                <div className="text-3xl mb-2">🌐</div>
                <p className="font-semibold text-sm mb-1">Translation</p>
                <p className="text-xs text-muted-foreground">Free to use</p>
              </Link>
              <Link 
                href="/tools/summarizer" 
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-red-300"
              >
                <div className="text-3xl mb-2">📄</div>
                <p className="font-semibold text-sm mb-1">Summarizer</p>
                <p className="text-xs text-muted-foreground">Free to use</p>
              </Link>
              <Link 
                href="/tools/ocr" 
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-red-300"
              >
                <div className="text-3xl mb-2">📸</div>
                <p className="font-semibold text-sm mb-1">OCR</p>
                <p className="text-xs text-muted-foreground">Free to use</p>
              </Link>
              <Link 
                href="/tools/rewriter" 
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-red-300"
              >
                <div className="text-3xl mb-2">✍️</div>
                <p className="font-semibold text-sm mb-1">Rewriter</p>
                <p className="text-xs text-muted-foreground">Free to use</p>
              </Link>
            </div>
            
            {/* Subtle Signup CTA */}
            <div className="text-center mb-8">
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-2">
                  Want to save your work? Sign up free
                </Button>
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Geen credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>100 gratis credits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>In 2 minuten klaar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-red-900">🎅 Sinterklaas AI Hulpmiddelen</h2>
          <p className="text-muted-foreground">Perfect voor pakjesavond</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {coreFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-2 hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader className="text-center pb-3">
                  <div className="text-4xl mb-2">{feature.emoji}</div>
                  <Icon className={`h-8 w-8 mx-auto mb-2 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Tools Grid */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-red-900 mb-4">+ 20 AI Tools Inclusief</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.name} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <Icon className="h-5 w-5 text-red-600" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">{tool.name}</div>
                    <div className="text-xs text-muted-foreground">{tool.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-red-900 mb-2">Eenvoudige Prijzen</h2>
            <p className="text-muted-foreground">Kies het plan dat bij jou past</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Gratis</CardTitle>
                <CardDescription>Perfect om uit te proberen</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">€0</span>
                  <span className="text-muted-foreground">/maand</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span>100 credits/maand</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span>Alle tools</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span>Basisondersteuning</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full" variant="outline" size="sm">
                    Start Gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-600 shadow-lg scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Populair</span>
                </div>
                <CardDescription>Meest populair</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-red-600">€29</span>
                  <span className="text-muted-foreground">/maand</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span>1.000 credits/maand</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span>Alle tools ontgrendeld</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span>Prioriteitsverwerking</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" size="sm">
                    Start Pro Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <CardDescription>Voor power users</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">€99</span>
                  <span className="text-muted-foreground">/maand</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span>5.000 credits/maand</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span>Alle Pro features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    <span>Prioriteit support</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" size="sm">
                  Neem Contact Op
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Meer credits nodig? Koop extra credits vanaf €10 voor 500 credits.
          </div>
        </div>
      </section>

      {/* All Tools Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-600 py-16 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="text-6xl mb-4">🎅</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              20+ AI Tools at Your Fingertips
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Try all tools for free. Sign up to save your work and get 100 credits.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <p className="text-sm font-semibold">🎁 Sinterklaas Tools</p>
                <p className="text-xs opacity-80">8 tools</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <p className="text-sm font-semibold">✍️ Content Tools</p>
                <p className="text-xs opacity-80">6 tools</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <p className="text-sm font-semibold">🌐 Language Tools</p>
                <p className="text-xs opacity-80">3 tools</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
                <p className="text-sm font-semibold">🖼️ Image Tools</p>
                <p className="text-xs opacity-80">4 tools</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-white/80 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Use free tools without login</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Sign up to save & get 100 credits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}