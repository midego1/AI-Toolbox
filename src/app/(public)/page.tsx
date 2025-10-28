"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gift, BookOpen, Package, CheckCircle2, ArrowRight,
  Sparkles, Star, Heart, Cookie, ShoppingBag,
  PenTool, Image, Languages, FileText, TrendingUp,
  Scissors, Linkedin, ChevronRight, Zap
} from "lucide-react";

// Compact Countdown Component
function CompactCountdown() {
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
      let targetDate = new Date(2025, 11, 5, 23, 59, 59);
      
      if (now > targetDate) {
        targetDate = new Date(2026, 11, 5, 23, 59, 59);
      }

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

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-300 p-4 md:p-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl">🎅</span>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-red-900">
              Pakjesavond komt eraan!
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              📅 {targetDateStr}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-white/90 rounded-lg px-3 py-2 border-2 border-red-300 text-center min-w-[50px]">
            <div className="text-xl md:text-2xl font-bold text-red-600">{String(timeLeft.days).padStart(2, '0')}</div>
            <div className="text-[10px] text-muted-foreground uppercase">D</div>
          </div>
          <div className="bg-white/90 rounded-lg px-3 py-2 border-2 border-red-300 text-center min-w-[50px]">
            <div className="text-xl md:text-2xl font-bold text-red-600">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-[10px] text-muted-foreground uppercase">U</div>
          </div>
          <div className="bg-white/90 rounded-lg px-3 py-2 border-2 border-red-300 text-center min-w-[50px]">
            <div className="text-xl md:text-2xl font-bold text-red-600">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="text-[10px] text-muted-foreground uppercase">M</div>
          </div>
          <div className="bg-white/90 rounded-lg px-3 py-2 border-2 border-red-300 text-center min-w-[50px]">
            <div className="text-xl md:text-2xl font-bold text-red-600">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="text-[10px] text-muted-foreground uppercase">S</div>
          </div>
        </div>
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
    color: "from-red-500 to-red-600",
    href: "/tools/gedichten"
  },
  {
    icon: Gift,
    title: "Cadeautips",
    description: "Perfect cadeau op basis van leeftijd & interesse",
    emoji: "🎁",
    color: "from-orange-500 to-orange-600",
    href: "/tools/cadeautips"
  },
  {
    icon: Package,
    title: "Surprise Ideeën",
    description: "Creatieve verpakkingsideeën met AI",
    emoji: "🎨",
    color: "from-amber-500 to-amber-600",
    href: "/tools/surprises"
  },
  {
    icon: Sparkles,
    title: "Sinterklaasbrief",
    description: "Unieke brieven van de Sint voor elk kind",
    emoji: "✉️",
    color: "from-purple-500 to-purple-600",
    href: "/tools/sinterklaas-brief"
  }
];

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50">
      {/* Compact Hero with Countdown */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Compact Countdown */}
          <CompactCountdown />
          
          {/* Value Proposition */}
          <div className="text-center my-8">
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              AI-gegenereerde gedichten, cadeautips en verrassingen voor pakjesavond. Geen stress, alleen plezier! 🎁
            </p>
            
            {/* Primary CTA */}
            <div className="mb-6">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg px-8 py-6">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Gratis - 100 Credits
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Geen credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>In 2 minuten klaar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Alle tools gratis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Sinterklaas Tools - Main Selling Point */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-red-900 mb-2">
              🎅 Sinterklaas AI Hulpmiddelen
            </h2>
            <p className="text-muted-foreground">Perfect voor pakjesavond</p>
          </div>
          
          {/* 4 Core Tools */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {coreFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.href}>
                  <Card className="border-2 hover:border-red-400 hover:shadow-xl transition-all hover:-translate-y-2 h-full">
                    <CardHeader className="text-center pb-3">
                      <div className="text-5xl mb-3">{feature.emoji}</div>
                      <Icon className={`h-8 w-8 mx-auto mb-2 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                      <CardTitle className="text-base md:text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground text-center mb-3">{feature.description}</p>
                      <div className="flex items-center justify-center text-red-600 text-sm font-semibold">
                        Probeer nu <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          
          {/* Expandable Tools Section */}
          <div className="text-center">
            <div className="bg-muted/50 rounded-xl p-6 border-2 border-dashed">
              <h3 className="text-lg font-bold text-red-900 mb-2">+ 20 Meer AI Tools Beschikbaar</h3>
              <p className="text-sm text-muted-foreground mb-4">
                SEO Optimizer, LinkedIn Content, Image Generation, Translation, Copywriting & meer
              </p>
              <Link href="/signup">
                <Button variant="outline" className="border-2">
                  Bekijk Alle Tools <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Pricing - Free vs Pro */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-red-900 mb-2">Eenvoudige Prijzen</h2>
              <p className="text-muted-foreground">Kies het plan dat bij jou past</p>
            </div>
            
            {/* Two-Column Pricing */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Free Plan */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Gratis</CardTitle>
                  <CardDescription>Perfect om uit te proberen</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">€0</span>
                    <span className="text-muted-foreground">/maand</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span>100 credits/maand</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span>Alle tools toegankelijk</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span>Zonder credit card</span>
                    </li>
                  </ul>
                  <Link href="/signup">
                    <Button className="w-full" variant="outline" size="lg">
                      Start Gratis
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border-4 border-red-600 shadow-xl relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-red-600 text-white text-sm rounded-full font-semibold">
                    Populair
                  </span>
                </div>
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <CardDescription>Meest populair</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-red-600">€29</span>
                    <span className="text-muted-foreground">/maand</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span>1.000 credits/maand</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span>Alle tools ontgrendeld</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span>Prioriteitsverwerking</span>
                    </li>
                  </ul>
                  <Link href="/signup">
                    <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" size="lg">
                      Start Pro Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-6 text-sm text-muted-foreground">
              Meer credits nodig? Koop extra credits vanaf €10 voor 500 credits.
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              🎁 Klaar om pakjesavond onvergetelijk te maken?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Probeer gratis alle 20+ AI tools. Geen credit card vereist.
            </p>
            
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Zap className="mr-2 h-5 w-5" />
                Start Nu Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}