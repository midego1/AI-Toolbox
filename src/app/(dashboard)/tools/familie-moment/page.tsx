"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthToken } from "@/hooks/useAuthToken";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Image, Download } from "lucide-react";

const STYLES = [
  { value: "realistisch", label: "Realistisch", emoji: "🎨" },
  { value: "cartoon", label: "Cartoon", emoji: "✨" },
  { value: "artistiek", label: "Artistiek", emoji: "🖼️" },
  { value: "traditioneel", label: "Traditioneel", emoji: "🇳🇱" },
];

export default function FamilieMomentPage() {
  // Use Clerk auth token
  const token = useAuthToken();
  
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<string>("traditioneel");
  const [setting, setSetting] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateMoment = useAction(api.tools.sinterklaasFamilieMoment.generateFamilieMoment);

  const handleGenerate = async () => {
    if (!description.trim()) {
      alert("Vul een beschrijving in");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      if (!token) {
        alert("Je bent niet ingelogd");
        return;
      }

      const result = await generateMoment({
        token,
        description,
        style: style as any,
        setting: setting || undefined,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Fout: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolAccessGuard toolId="familie_moment">


  return (
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Users className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold tracking-tight">Familie Sinterklaas Moment</h1>
        </div>
        <p className="text-muted-foreground">
          Genereer een prachtige familie illustratie van je Sinterklaas viering - perfect om te printen of te delen!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Beschrijving</CardTitle>
              <CardDescription>Beschrijf het moment dat je wilt vastleggen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Wat gebeurt er? *</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="bijv. Familie van 4 die cadeaus uitpakken met Sinterklaas en Piet in de woonkamer"
                  className="w-full mt-1 p-2 border rounded-md min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="setting">Setting (optioneel)</Label>
                <Input
                  id="setting"
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  placeholder="bijv. traditionele Nederlandse woonkamer met open haard"
                />
              </div>

              <div>
                <Label>Stijl</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {STYLES.map(s => (
                    <Button
                      key={s.value}
                      size="sm"
                      variant={style === s.value ? "default" : "outline"}
                      onClick={() => setStyle(s.value)}
                      className="w-full"
                    >
                      <span className="mr-2">{s.emoji}</span>
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !description} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                size="lg"
              >
                {isLoading ? (
                  "Genereren..."
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    Genereer Familie Moment
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Kosten: 20 credits per afbeelding
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
                  <span>🎨 Jouw Familie Moment</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {results.creditsUsed} credits gebruikt
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={results.imageUrl} 
                    alt="Familie Sinterklaas moment" 
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(results.imageUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigator.clipboard.writeText(results.imageUrl)}
                  >
                    URL Kopiëren
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Beschrijf het moment en genereer een prachtige familie illustratie!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <FamilieMomentHistory />
      </div>
    </div>
  );
}

function FamilieMomentHistory() {
  const token = useAuthToken();
  const history = useQuery(
    api.aiJobs.getHistoryByType,
    token ? { token, typeFilter: "familie_moment", limit: 10, offset: 0 } : "skip"
  );

  if (!token || !history || history.items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recente Familie Momenten</CardTitle>
        <CardDescription>Je recent gegenereerde familie illustraties</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.items.map((job: any) => (
            <FamilieMomentHistoryItem key={job._id} job={job} token={token!} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FamilieMomentHistoryItem({ job, token }: { job: any; token: string }) {
  const fileUrl = useQuery(
    api.files.getFileUrl,
    job.outputFileId ? { token, storageId: job.outputFileId } : "skip"
  );

  let description = "Familie moment";
  let imageUrl = "";
  
  try {
    const input = typeof job.inputData === 'string' ? JSON.parse(job.inputData) : job.inputData;
    description = input.description || "Familie moment";
  } catch {
    description = "Familie moment";
  }
  
  // Try to get image URL from multiple sources
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
      <img src={imageUrl} alt={description} className="w-full h-48 object-cover" />
      <div className="p-4">
        <div className="font-semibold text-sm mb-2">{description.substring(0, 50)}...</div>
        <div className="text-xs text-muted-foreground">
          {new Date(job.createdAt).toLocaleDateString('nl-NL')} • {job.creditsUsed} credits
        </div>
      </div>
    </div>
  );
}
