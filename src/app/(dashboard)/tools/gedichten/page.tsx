"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthToken } from "@/hooks/useAuthToken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Sparkles, Download, Copy } from "lucide-react";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslations } from "@/lib/translations";

const TONES = [
  { value: "traditioneel", label: "Traditioneel", emoji: "📜" },
  { value: "modern", label: "Modern", emoji: "🚀" },
  { value: "grappig", label: "Grappig", emoji: "😄" },
  { value: "hartverwarmend", label: "Hartverwarmend", emoji: "❤️" },
];

export default function GedichtenPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [likes, setLikes] = useState("");
  const [gift, setGift] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [tone, setTone] = useState<string>("traditioneel");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use translations
  const { language } = useLanguage();
  const t = getTranslations(language).aiTools.gedichten;

  // Use Clerk auth token
  const token = useAuthToken();

  const generateGedicht = useAction(api.tools.sinterklaasGedichten.generateGedicht);

  const handleGenerate = async () => {
    if (!name.trim()) {
      alert(t.enterName);
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      if (!token) {
        alert(t.notLoggedIn);
        return;
      }

      const result = await generateGedicht({
        token,
        name,
        age: age || undefined,
        likes: likes || undefined,
        gift: gift || undefined,
        personal_notes: personalNotes || undefined,
        tone: tone as any,
      });

      setResults(result);
    } catch (error: any) {
      alert(`${t.actions.copy} ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t.actions.copied);
  };

  const handleDownload = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolAccessGuard toolId="sinterklaas_gedicht">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <BookOpen className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          </div>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gedicht Gegevens</CardTitle>
              <CardDescription>Vertel ons over de persoon voor wie je een gedicht maakt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">{t.inputFields.name} *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.inputFields.namePlaceholder}
                />
              </div>

              <div>
                <Label htmlFor="age">{t.inputFields.age}</Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  max={100}
                  value={age || ""}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder={t.inputFields.agePlaceholder}
                />
              </div>

              <div>
                <Label htmlFor="likes">{t.inputFields.likes}</Label>
                <Input
                  id="likes"
                  value={likes}
                  onChange={(e) => setLikes(e.target.value)}
                  placeholder={t.inputFields.likesPlaceholder}
                />
              </div>

              <div>
                <Label htmlFor="gift">{t.inputFields.gift}</Label>
                <Input
                  id="gift"
                  value={gift}
                  onChange={(e) => setGift(e.target.value)}
                  placeholder={t.inputFields.giftPlaceholder}
                />
              </div>

              <div>
                <Label htmlFor="notes">{t.inputFields.notes}</Label>
                <textarea
                  id="notes"
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder={t.inputFields.notesPlaceholder}
                  className="w-full mt-1 p-2 border rounded-md min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toon & Stijl</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t.tone}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {TONES.map(toneOption => (
                    <Button
                      key={toneOption.value}
                      size="sm"
                      variant={tone === toneOption.value ? "default" : "outline"}
                      onClick={() => setTone(toneOption.value)}
                      className="w-full"
                    >
                      <span className="mr-2">{toneOption.emoji}</span>
                      {t.tones[toneOption.value as keyof typeof t.tones]}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                size="lg"
              >
                {isLoading ? (
                  t.actions.generating
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t.actions.generate}
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {t.cost}
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
                  <span>{t.yourGedicht}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {results.creditsUsed} {t.creditsUsed}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg border border-red-200">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-serif">
                    {results.poem}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => handleCopy(results.poem)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {t.actions.copy}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDownload(results.poem, `sinterklaas-gedicht-${name}.txt`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t.actions.download}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t.noResults}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <GedichtenHistory />
      </div>
    </div>
    </ToolAccessGuard>
  );
}

function GedichtenHistory() {
  const token = useAuthToken();
  const { language } = useLanguage();
  const t = getTranslations(language).aiTools.gedichten;
  
  const history = useQuery(
    api.aiJobs.getHistoryByType,
    token ? { token, typeFilter: "sinterklaas_gedicht", limit: 10, offset: 0 } : "skip"
  );

  if (!token || !history || history.items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.historyTitle}</CardTitle>
        <CardDescription>{t.historyDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.items.map((job: any) => {
            let name = "Onbekend";
            let preview = "";
            
            try {
              const input = typeof job.inputData === 'string' ? JSON.parse(job.inputData) : job.inputData;
              name = input.name || "Onbekend";
            } catch {
              name = "Gedicht";
            }
            
            try {
              const output = typeof job.outputData === 'string' ? JSON.parse(job.outputData) : job.outputData;
              if (output && typeof output === 'object' && output.poem) {
                preview = output.poem.substring(0, 100) + "...";
              } else if (typeof output === 'string') {
                preview = output.substring(0, 100) + "...";
              } else {
                preview = JSON.stringify(output).substring(0, 100) + "...";
              }
            } catch {
              preview = "";
            }

            return (
              <div key={job._id} className="p-4 border rounded-lg hover:bg-red-50 transition">
                <div className="font-semibold mb-2">{name}</div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{preview}</p>
                <div className="text-xs text-muted-foreground">
                  {new Date(job.createdAt).toLocaleDateString('nl-NL')} • {job.creditsUsed} credits
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

