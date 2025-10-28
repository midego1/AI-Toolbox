"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthToken } from "@/hooks/useAuthToken";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Download, Copy } from "lucide-react";

const TONES = [
  { value: "stimulerend", label: "Stimulerend", emoji: "💪" },
  { value: "liefdevol", label: "Liefdevol", emoji: "❤️" },
  { value: "grappig", label: "Grappig", emoji: "😄" },
  { value: "educatief", label: "Educatief", emoji: "📚" },
];

export default function SinterklaasBriefPage() {
  // Use Clerk auth token
  const token = useAuthToken();
  
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [achievements, setAchievements] = useState("");
  const [behaviorNotes, setBehaviorNotes] = useState("");
  const [tone, setTone] = useState<string>("liefdevol");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateLetter = useAction(api.tools.sinterklaasBrief.generateSinterklaasLetter);

  const handleGenerate = async () => {
    if (!childName.trim() || !age) {
      alert("Vul naam en leeftijd in");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      if (!token) {
        alert("Je bent niet ingelogd");
        return;
      }

      const result = await generateLetter({
        token,
        child_name: childName,
        age,
        achievements: achievements || undefined,
        behavior_notes: behaviorNotes || undefined,
        tone: tone as any,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Fout: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Gekopieerd!");
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
    <ToolAccessGuard toolId="sinterklaas_brief">
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Mail className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold tracking-tight">Brief van Sinterklaas</h1>
        </div>
        <p className="text-muted-foreground">
          Creëer een persoonlijke brief van Sinterklaas voor je kind - authentiek en hartverwarmend!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gegevens voor de Brief</CardTitle>
              <CardDescription>Vertel ons over je kind voor een persoonlijke brief</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="childName">Naam van je kind *</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="bijv. Emma of Tom"
                />
              </div>

              <div>
                <Label htmlFor="age">Leeftijd *</Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  max={15}
                  value={age || ""}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="bijv. 8"
                />
              </div>

              <div>
                <Label htmlFor="achievements">Prestaties (optioneel)</Label>
                <textarea
                  id="achievements"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="Wat heeft je kind dit jaar gedaan? (bijv. goed geholpen thuis, goed leren lezen)"
                  className="w-full mt-1 p-2 border rounded-md min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="behavior">Gedrag (optioneel)</Label>
                <textarea
                  id="behavior"
                  value={behaviorNotes}
                  onChange={(e) => setBehaviorNotes(e.target.value)}
                  placeholder="Positief gedrag om te noemen in de brief"
                  className="w-full mt-1 p-2 border rounded-md min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toon van de Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selecteer Toon</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {TONES.map(t => (
                    <Button
                      key={t.value}
                      size="sm"
                      variant={tone === t.value ? "default" : "outline"}
                      onClick={() => setTone(t.value)}
                      className="w-full"
                    >
                      <span className="mr-2">{t.emoji}</span>
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !childName || !age} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                size="lg"
              >
                {isLoading ? "Genereren..." : "🚀 Genereer Brief"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Kosten: 15 credits per brief
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
                  <span>📄 Brief van Sinterklaas</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {results.creditsUsed} credits gebruikt
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg border border-red-200">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-serif">
                    {results.letter}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => handleCopy(results.letter)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Kopieer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDownload(results.letter, `brief-van-sinterklaas-${childName}.txt`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Vul de gegevens in en genereer een persoonlijke brief van Sinterklaas!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <BriefHistory />
      </div>
    </div>
    </ToolAccessGuard>
  );
}

function BriefHistory() {
  const token = useAuthToken();
  const history = useQuery(
    api.aiJobs.getHistoryByType,
    token ? { token, typeFilter: "sinterklaas_brief", limit: 10, offset: 0 } : "skip"
    </ToolAccessGuard>
  );

  if (!token || !history || history.items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recente Brieven</CardTitle>
        <CardDescription>Je recent gegenereerde brieven van Sinterklaas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.items.map((job: any) => {
            let childName = "Onbekend";
            let preview = "";
            
            try {
              const input = typeof job.inputData === 'string' ? JSON.parse(job.inputData) : job.inputData;
              childName = input.child_name || input.name || "Onbekend";
            } catch {
              childName = "Brief";
            }
            
            try {
              const output = typeof job.outputData === 'string' ? JSON.parse(job.outputData) : job.outputData;
              if (output && typeof output === 'object' && output.letter) {
                preview = output.letter.substring(0, 100) + "...";
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
                <div className="font-semibold mb-2">📄 Brief voor {childName}</div>
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
    </ToolAccessGuard>
  );
}

