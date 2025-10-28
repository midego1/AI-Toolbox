"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Languages, Copy, Download, ArrowRightLeft, Sparkles } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { TextToolHistory } from "@/components/shared/TextToolHistory";
import { getAuthToken } from "@/lib/auth-client";
import { useAction } from "convex/react";
import { isAnonymousTool } from "@/lib/premium-tools";
import Link from "next/link";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

export default function TranslationPage() {
  const { isSignedIn } = useUser();
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const translateAction = useAction(api.tools.translation.translate);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    // Check if user needs to sign in
    if (!isSignedIn) {
      alert("Please sign in to use this tool");
      return;
    }

    setIsTranslating(true);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const result = await translateAction({
        token,
        text: inputText,
        sourceLang: sourceLanguage,
        targetLang: targetLanguage,
      });

      setOutputText(result.translatedText);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
  };

  const estimatedCredits = Math.ceil(inputText.length / 1000) || 1;

  return (
    <ToolAccessGuard toolId="translation">
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Languages className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Translation</h1>
        </div>
        <p className="text-muted-foreground">
          Translate text between 100+ languages instantly
        </p>
      </div>

      {/* Guest Upgrade Banner */}
      {!isSignedIn && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">Sign in to use this tool</p>
                <p className="text-sm text-muted-foreground">Save your work and get 100 free credits</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Language Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Language Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="source-lang">From</Label>
                <select
                  id="source-lang"
                  className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwapLanguages}
                className="mt-6"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <Label htmlFor="target-lang">To</Label>
                <select
                  id="target-lang"
                  className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Interface */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Source Text</CardTitle>
              <CardDescription>Enter the text you want to translate</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full min-h-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Type or paste your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {inputText.length} characters • ~{estimatedCredits} credit(s)
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Translation</CardTitle>
              <CardDescription>Your translated text will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full min-h-[300px] rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                {isTranslating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                      <p className="text-muted-foreground">Translating...</p>
                    </div>
                  </div>
                ) : outputText ? (
                  <p className="whitespace-pre-wrap">{outputText}</p>
                ) : (
                  <p className="text-muted-foreground">
                    Translation will appear here...
                  </p>
                )}
              </div>
              {outputText && !isTranslating && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Translate Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleTranslate}
            disabled={!inputText.trim() || isTranslating}
            className="min-w-[200px]"
          >
            {isTranslating ? "Translating..." : `Translate (${estimatedCredits} credit${estimatedCredits > 1 ? 's' : ''})`}
          </Button>
        </div>

        {/* History Section */}
        <div className="mt-8">
          <TextToolHistory
            toolName="Translation"
            queryFunction={api.aiJobs.getTranslationHistory}
            icon={Languages}
            extractTitle={(job) => `${job.inputData?.sourceLang || 'Auto'} → ${job.inputData?.targetLang || 'Unknown'}`}
            extractPreview={(job) => job.outputData?.translatedText || job.inputData?.text || "Translation"}
          />
        </div>
      </div>
    </div>
    </ToolAccessGuard>
  );
}
