"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useAuthToken } from "@/hooks/useAuthToken";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Button } from "@/components/ui/button";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Input } from "@/components/ui/input";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Label } from "@/components/ui/label";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Gift, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";

export default function CadeautipsPage() {
  // Use Clerk auth token
  const token = useAuthToken();
  
  const [age, setAge] = useState<number>(8);
  const [interests, setInterests] = useState("");
  const [budgetMin, setBudgetMin] = useState<number | undefined>(undefined);
  const [budgetMax, setBudgetMax] = useState<number | undefined>(undefined);
  const [recipientName, setRecipientName] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateCadeautips = useAction(api.tools.cadeautips.generateCadeautips);

  const handleGenerate = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      if (!token) {
        alert("Je bent niet ingelogd");
        return;
      }

      const result = await generateCadeautips({
        token,
        age,
        interests: interests || undefined,
        budget_min: budgetMin || undefined,
        budget_max: budgetMax || undefined,
        recipient_name: recipientName || undefined,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Fout: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ToolAccessGuard toolId="cadeautips">
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Gift className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold tracking-tight">Cadeautips Generator</h1>
        </div>
        <p className="text-muted-foreground">
          Ontvang gepersonaliseerde cadeautips voor de perfecte Sinterklaas cadeaus
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadeau Gegevens</CardTitle>
              <CardDescription>Vertel ons over de ontvanger</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Naam (optioneel)</Label>
                <Input
                  id="name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="bijv. Emma"
                />
              </div>

              <div>
                <Label htmlFor="age">Leeftijd *</Label>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="interests">Hobby's & Interesses</Label>
                <Input
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="bijv. voetbal, tekenen, lego"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMin">Min. Budget (€)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    min={0}
                    value={budgetMin || ""}
                    onChange={(e) => setBudgetMin(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax">Max. Budget (€)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    min={0}
                    value={budgetMax || ""}
                    onChange={(e) => setBudgetMax(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Opties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                size="lg"
              >
                {isLoading ? (
                  "Genereren..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Genereer Cadeautips
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Kosten: 15 credits per generatie
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
                  <span>Jouw Cadeautips</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {results.creditsUsed} credits gebruikt
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.suggestions?.items?.map((item: any, idx: number) => (
                    <Card key={idx} className="bg-red-50">
                      <CardContent className="pt-4">
                        <div className="font-semibold text-red-900 mb-2">
                          {item.name || `Suggestion ${idx + 1}`}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.description || ''}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {item.category && (
                            <Badge variant="outline">{item.category}</Badge>
                          )}
                          {item.approximate_price && (
                            <Badge variant="secondary">
                              ~€{item.approximate_price}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <p className="text-center text-muted-foreground">Geen suggesties gevonden</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Vul de gegevens in en klik op Genereren om cadeautips te ontvangen</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </ToolAccessGuard>
  );
}

