"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useAuthToken } from "@/hooks/useAuthToken";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DIFFICULTY_LEVELS = [
  { value: "makkelijk", label: "Makkelijk", emoji: "🌱" },
  { value: "gemiddeld", label: "Gemiddeld", emoji: "📦" },
  { value: "uitdagend", label: "Uitdagend", emoji: "🎯" },
];

export default function SurprisesPage() {
  // Use Clerk auth token
  const token = useAuthToken();
  
  const [giftDescription, setGiftDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState<string>("gemiddeld");
  const [budget, setBudget] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSurprise = useAction(api.tools.surpriseIdeeen.generateSurpriseIdeeen);
  const generateComplete = useAction(api.tools.surpriseIdeeen.generateCompleteSurprise);

  const handleGenerateSurprise = async () => {
    if (!giftDescription.trim()) {
      alert("Beschrijf het cadeau");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      if (!token) {
        alert("Je bent niet ingelogd");
        return;
      }

      const result = await generateSurprise({
        token,
        gift_description: giftDescription,
        theme: theme || undefined,
        difficulty: difficulty as any,
        budget: budget || undefined,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Fout: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Package className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold tracking-tight">Surprise Ideeën Generator</h1>
        </div>
        <p className="text-muted-foreground">
          Creëer originele verpakkingsideeën voor je Sinterklaas surprises
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Surprise Gegevens</CardTitle>
              <CardDescription>Beschrijf het cadeau en je voorkeuren</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="gift">Cadeau Beschrijving *</Label>
                <Input
                  id="gift"
                  value={giftDescription}
                  onChange={(e) => setGiftDescription(e.target.value)}
                  placeholder="bijv. een nieuw skateboard of lego set"
                />
              </div>

              <div>
                <Label htmlFor="theme">Thema (optioneel)</Label>
                <Input
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="bijv. ruimte, voetbal, piraten"
                />
              </div>

              <div>
                <Label htmlFor="budget">Budget (optioneel)</Label>
                <Input
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="bijv. klein (€5-10) of groot (€20+)"
                />
              </div>

              <div>
                <Label>Moeilijkheidsgraad</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {DIFFICULTY_LEVELS.map(d => (
                    <Button
                      key={d.value}
                      size="sm"
                      variant={difficulty === d.value ? "default" : "outline"}
                      onClick={() => setDifficulty(d.value)}
                      className="w-full"
                    >
                      <span className="mr-2">{d.emoji}</span>
                      {d.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Genereer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGenerateSurprise} 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                size="lg"
              >
                {isLoading ? (
                  "Genereren..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Genereer Surprise Ideeën
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Kosten: 20 credits per generatie
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {results ? (
            <Card className="border-2 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Jouw Surprise Ideeën</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {results.creditsUsed} credits gebruikt
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results.ideas?.ideas?.map((idea: any, idx: number) => (
                    <Card key={idx} className="bg-gradient-to-br from-red-50 to-red-100/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
                            {idea.title || `Idee ${idx + 1}`}
                          </CardTitle>
                          <Badge variant="outline" className="ml-2">
                            #{idx + 1}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Concept:</h4>
                          <p className="text-sm text-muted-foreground">
                            {idea.concept}
                          </p>
                        </div>

                        {idea.materials && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Benodigd Materiaal:</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {idea.materials.map((m: string, i: number) => (
                                <li key={i} className="text-muted-foreground">{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {idea.steps && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Stappen:</h4>
                            <ol className="list-decimal list-inside text-sm space-y-1">
                              {idea.steps.map((step: string, i: number) => (
                                <li key={i} className="text-muted-foreground">{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {idea.estimated_time && (
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary">
                              ⏱ {idea.estimated_time}
                            </Badge>
                          </div>
                        )}

                        {idea.tips && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-900">
                              <strong>💡 Tip:</strong> {idea.tips}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Beschrijf je cadeau en ontvang creatieve verpakkingsideeën!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

