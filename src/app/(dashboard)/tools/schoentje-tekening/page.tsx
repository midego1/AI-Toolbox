"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthToken } from "@/hooks/useAuthToken";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Button } from "@/components/ui/button";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Input } from "@/components/ui/input";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Label } from "@/components/ui/label";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Download } from "lucide-react";

export default function SchoentjeTekeningPage() {
  // Use Clerk auth token
  const token = useAuthToken();
  
  const [treats, setTreats] = useState("");
  const [decorativeElements, setDecorativeElements] = useState("");
  const [style, setStyle] = useState("traditioneel");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSchoentje = useAction(api.tools.schoentjeTekening.generateSchoentjeTekening);

  const handleGenerate = async () => {
    if (!treats.trim()) {
      alert("Vul in wat er in de schoen zit");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      if (!token) {
        alert("Je bent niet ingelogd");
        return;
      }

      const result = await generateSchoentje({
        token,
        treats,
        decorative_elements: decorativeElements || undefined,
        style: style || undefined,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Fout: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ToolAccessGuard toolId="schoentje_tekening">
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">👞</span>
          <h1 className="text-3xl font-bold tracking-tight">Schoentje Vol Tekening</h1>
        </div>
        <p className="text-muted-foreground">
          Visualiseer hoe een vol schoentje eruit ziet met traditionele lekkernijen en cadeaus!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schoen Inhoud</CardTitle>
              <CardDescription>Beschrijf wat er in de schoen gaat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="treats">Wat zit erin? *</Label>
                <Input
                  id="treats"
                  value={treats}
                  onChange={(e) => setTreats(e.target.value)}
                  placeholder="bijv. chocolademunten, pepernoten, klein speeltje, mandarijntje"
                />
              </div>

              <div>
                <Label htmlFor="decorative">Decoratieve Elementen (optioneel)</Label>
                <Input
                  id="decorative"
                  value={decorativeElements}
                  onChange={(e) => setDecorativeElements(e.target.value)}
                  placeholder="bijv. strikjes, glitter, papier"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !treats} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                size="lg"
              >
                {isLoading ? "Genereren..." : "🎨 Genereer Tekening"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Kosten: 18 credits per tekening
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
                  <span>👞 Jouw Schoentje</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {results.creditsUsed} credits gebruikt
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={results.imageUrl} 
                    alt="Schoentje met lekkernijen" 
                    className="w-full"
                  />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(results.imageUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <span className="text-6xl mb-4 block">👞</span>
                  <p>Beschrijf de inhoud en genereer een prachtige tekening van een vol schoentje!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <SchoentjeHistory />
      </div>
    </div>
    </ToolAccessGuard>
  );
}

function SchoentjeHistory() {
  const token = useAuthToken();
  const history = useQuery(
    api.aiJobs.getHistoryByType,
    token ? { token, typeFilter: "schoentje_tekening", limit: 10, offset: 0 } : "skip"
    </ToolAccessGuard>
  );

  if (!token || !history || history.items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recente Schoentje Tekeningen</CardTitle>
        <CardDescription>Je recent gegenereerde schoentje illustraties</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.items.map((job: any) => (
            <SchoentjeHistoryItem key={job._id} job={job} token={token!} />
          ))}
        </div>
      </CardContent>
    </Card>
    </ToolAccessGuard>
  );
}

function SchoentjeHistoryItem({ job, token }: { job: any; token: string }) {
  const fileUrl = useQuery(
    api.files.getFileUrl,
    job.outputFileId ? { token, storageId: job.outputFileId } : "skip"
    </ToolAccessGuard>
  );

  let treats = "Sinterklaas lekkernijen";
  let imageUrl = "";
  
  try {
    const input = typeof job.inputData === 'string' ? JSON.parse(job.inputData) : job.inputData;
    treats = input.treats || "Sinterklaas lekkernijen";
  } catch {
    treats = "Sinterklaas lekkernijen";
  }
  
  try {
    const output = typeof job.outputData === 'string' ? JSON.parse(job.outputData) : job.outputData;
    if (output && typeof output === 'object') {
      imageUrl = output.imageUrl || "";
    }
  } catch {
    imageUrl = "";
  }

  // If no imageUrl in outputData, use file URL
  if (!imageUrl && fileUrl) {
    imageUrl = fileUrl;
  }

  if (!imageUrl) return null;

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
         onClick={() => window.open(imageUrl, '_blank')}>
      <img src={imageUrl} alt={treats} className="w-full h-48 object-cover" />
      <div className="p-4">
        <div className="font-semibold text-sm mb-2">👞 {treats.substring(0, 50)}...</div>
        <div className="text-xs text-muted-foreground">
          {new Date(job.createdAt).toLocaleDateString('nl-NL')} • {job.creditsUsed} credits
        </div>
      </div>
    </div>
    </ToolAccessGuard>
  );
}
