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
import { Gift, Plus, X, Eye, EyeOff, Download } from "lucide-react";

export default function LootjestrekkenPage() {
  const [participants, setParticipants] = useState<string[]>(["", ""]);
  const [budget, setBudget] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // Use Clerk auth token
  const token = useAuthToken();

  const generateLottery = useAction(api.tools.lootjestrekken.generateLootjestrekken);

  const addParticipant = () => {
    setParticipants([...participants, ""]);
  };

  const updateParticipant = (index: number, value: string) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const removeParticipant = (index: number) => {
    const updated = participants.filter((_, i) => i !== index);
    setParticipants(updated.length >= 2 ? updated : ["", ""]);
  };

  const handleGenerate = async () => {
    const validParticipants = participants.filter(p => p.trim());
    
    if (validParticipants.length < 2) {
      alert("Er zijn minimaal 2 deelnemers nodig");
      return;
    }

    // Check for duplicates
    const uniqueParticipants = new Set(validParticipants);
    if (uniqueParticipants.size !== validParticipants.length) {
      alert("Er zijn dubbele namen. Elke deelnemer moet uniek zijn.");
      return;
    }

    setIsLoading(true);
    setResults(null);
    setRevealed({});

    try {
      if (!token) {
        alert("Je bent niet ingelogd");
        return;
      }

      const result = await generateLottery({
        token,
        participants: validParticipants,
        budget: budget || undefined,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Fout: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReveal = (giver: string) => {
    setRevealed(prev => ({ ...prev, [giver]: !prev[giver] }));
  };

  const handleDownload = () => {
    if (!results?.assignments) return;
    
    const content = results.assignments
      .map((a: any) => `${a.giver} → ${a.receiver}`)
      .join('\n');
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lootjestrekken-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <ToolAccessGuard toolId="lootjestrekken">
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Gift className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold tracking-tight">Lootjestrekken</h1>
        </div>
        <p className="text-muted-foreground">
          Trek lootjes voor je Sinterklaas viering! Wie koopt voor wie?
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deelnemers</CardTitle>
              <CardDescription>Voeg de namen toe van alle deelnemers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {participants.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => updateParticipant(index, e.target.value)}
                    placeholder={`Deelnemer ${index + 1}`}
                  />
                  {participants.length > 2 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeParticipant(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addParticipant}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Voeg deelnemer toe
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instellingen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="budget">Budget (optioneel)</Label>
                <Input
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="bijv. €5-15"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || participants.filter(p => p.trim()).length < 2} 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                size="lg"
              >
                {isLoading ? "Loten trekken..." : "🎲 Trek Lootjes"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Kosten: 8 credits
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
                  <span>🎲 Lootjes Getrokken</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {results.creditsUsed} credits gebruikt
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {results.assignments.map((assignment: any) => (
                    <div key={assignment.giver} className="p-4 border rounded-lg bg-gradient-to-br from-red-50 to-red-100/50">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{assignment.giver}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleReveal(assignment.giver)}
                        >
                          {revealed[assignment.giver] ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Verberg
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Toon
                            </>
                          )}
                        </Button>
                      </div>
                      {revealed[assignment.giver] && (
                        <div className="mt-2 text-lg font-bold text-red-600">
                          → {assignment.receiver}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {budget && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    💰 Budget: {budget}
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Resultaten
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Voeg deelnemers toe en klik op "Trek Lootjes" om te beginnen!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <LootjestrekkenHistory />
      </div>
    </div>
  );
}

function LootjestrekkenHistory() {
  // Use Clerk auth token
  const token = useAuthToken();
  const history = useQuery(
    api.aiJobs.getHistoryByType,
    token ? { token, typeFilter: "lootjestrekken", limit: 10, offset: 0 } : "skip"
  );

  // Debug logging
  console.log("🎲 Lootjestrekken History Debug:", {
    hasToken: !!token,
    hasHistory: !!history,
    itemsCount: history?.items?.length || 0,
    items: history?.items || []
  });

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recente Lootjes Trekkingen</CardTitle>
          <CardDescription>Je bent niet ingelogd</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!history) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recente Lootjes Trekkingen</CardTitle>
          <CardDescription>Laden...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (history.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recente Lootjes Trekkingen</CardTitle>
          <CardDescription>Nog geen geschiedenis - trek je eerste lootjes!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Je hebt nog geen lootjes getrokken</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recente Lootjes Trekkingen</CardTitle>
        <CardDescription>Je recent getrokken lootjes - klik om details te zien</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.items.map((job: any) => {
            let assignments: any[] = [];
            let participants: string[] = [];
            let budget = "";
            
            try {
              const input = typeof job.inputData === 'string' ? JSON.parse(job.inputData) : job.inputData;
              participants = input.participants || [];
              budget = input.budget || "";
            } catch {
              participants = [];
            }
            
            try {
              const output = typeof job.outputData === 'string' ? JSON.parse(job.outputData) : job.outputData;
              if (output && typeof output === 'object' && Array.isArray(output.assignments)) {
                assignments = output.assignments;
              }
            } catch {
              assignments = [];
            }

            return (
              <LootjestrekkenHistoryItem 
                key={job._id} 
                job={job}
                assignments={assignments}
                participants={participants}
                budget={budget}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function LootjestrekkenHistoryItem({ job, assignments, participants, budget }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 border rounded-lg hover:bg-red-50 transition">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">
          🎲 Lootjes voor {participants.length} personen
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Verberg" : "Toon Details"}
        </Button>
      </div>
      
      {budget && (
        <div className="text-sm text-muted-foreground mb-2">
          Budget: {budget}
        </div>
      )}
      
      {expanded && assignments.length > 0 && (
        <div className="mt-3 space-y-2 border-t pt-3">
          {assignments.map((assignment: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="font-medium">{assignment.giver}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-semibold text-red-600">{assignment.receiver}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-2">
        {new Date(job.createdAt).toLocaleDateString('nl-NL')} • {job.creditsUsed} credits
      </div>
    </div>
  );
}
