"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Sparkles, List, BookOpen } from "lucide-react";
import { TextToolHistory } from "@/components/shared/TextToolHistory";

const OUTPUT_FORMATS = [
  { value: "paragraph", label: "Paragraph", icon: "📄" },
  { value: "bullets", label: "Bullet Points", icon: "•" },
  { value: "executive_summary", label: "Executive Summary", icon: "📊" },
  { value: "social_media_post", label: "Social Media Post", icon: "📱" },
  { value: "tweet_thread", label: "Tweet Thread", icon: "🐦" },
  { value: "eli5", label: "Explain Like I'm 5", icon: "👶" },
  { value: "academic", label: "Academic Style", icon: "🎓" },
];

export default function SummarizerPage() {
  const [text, setText] = useState("");
  const [outputFormat, setOutputFormat] = useState("paragraph");
  const [targetWords, setTargetWords] = useState("");
  const [focusAreas, setFocusAreas] = useState("");
  const [audience, setAudience] = useState("");
  const [extractKeyPoints, setExtractKeyPoints] = useState(5);
  const [generateQuestions, setGenerateQuestions] = useState(false);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const summarize = useAction(api.tools.summarizer.summarize);

  const handleSummarize = async () => {
    if (!text.trim()) {
      alert("Please enter text to summarize");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const focusAreasArray = focusAreas ? focusAreas.split(",").map(a => a.trim()) : undefined;

      const result = await summarize({
        token,
        text,
        outputFormat,
        targetWords: targetWords ? parseInt(targetWords) : undefined,
        focusAreas: focusAreasArray,
        audience: audience || undefined,
        extractKeyPoints: extractKeyPoints || undefined,
        generateQuestions,
        sentimentAnalysis,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Advanced Text Summarizer</h1>
        </div>
        <p className="text-muted-foreground">
          Intelligent summarization with key points, study questions, and sentiment analysis
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Text to Summarize</CardTitle>
              <CardDescription>Paste your content below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your article, document, or any text you want to summarize..."
                  className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {wordCount} words • Credits: {Math.max(2, Math.ceil(wordCount / 500))}
                </p>
              </div>

              <div>
                <Label htmlFor="format">Output Format</Label>
                <select
                  id="format"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {OUTPUT_FORMATS.map(format => (
                    <option key={format.value} value={format.value}>
                      {format.icon} {format.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetWords">Target Word Count (optional)</Label>
                <input
                  id="targetWords"
                  type="number"
                  value={targetWords}
                  onChange={(e) => setTargetWords(e.target.value)}
                  placeholder="e.g., 100"
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>

              <div>
                <Label htmlFor="focus">Focus Areas (comma-separated)</Label>
                <input
                  id="focus"
                  value={focusAreas}
                  onChange={(e) => setFocusAreas(e.target.value)}
                  placeholder="e.g., AI, machine learning, ethics"
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <select
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">General</option>
                  <option value="expert">Expert</option>
                  <option value="beginner">Beginner</option>
                </select>
              </div>

              <div>
                <Label htmlFor="keypoints">Extract Top Key Points</Label>
                <input
                  id="keypoints"
                  type="number"
                  min={0}
                  max={10}
                  value={extractKeyPoints}
                  onChange={(e) => setExtractKeyPoints(parseInt(e.target.value))}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="questions"
                  type="checkbox"
                  checked={generateQuestions}
                  onChange={(e) => setGenerateQuestions(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="questions">Generate Study Questions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="sentiment"
                  type="checkbox"
                  checked={sentimentAnalysis}
                  onChange={(e) => setSentimentAnalysis(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="sentiment">Analyze Sentiment</Label>
              </div>

              <Button 
                onClick={handleSummarize} 
                disabled={isLoading || !text.trim()} 
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  "Summarizing..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Summarize Text
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {results ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Summary</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {results.creditsUsed} credits used
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{results.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Original:</span>
                      <span className="ml-2 font-medium">{results.originalWordCount} words</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Summary:</span>
                      <span className="ml-2 font-medium">{results.summaryWordCount} words</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Reading Time:</span>
                      <span className="ml-2 font-medium">{results.readingTime} min</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Copy Summary
                  </Button>
                </CardContent>
              </Card>

              {results.keyPoints && results.keyPoints.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <List className="h-5 w-5 mr-2" />
                      Key Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.keyPoints.map((point: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {results.studyQuestions && results.studyQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Study Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.studyQuestions.map((q: string, i: number) => (
                        <li key={i} className="text-sm">
                          <span className="font-medium text-primary">{i + 1}.</span> {q}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {results.sentiment && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Overall:</span>
                        <span className="font-medium capitalize">{results.sentiment.overall}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{results.sentiment.analysis}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Paste your text and click Summarize to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Section */}
        <div className="mt-8">
          <TextToolHistory
            toolName="Summarization"
            queryFunction={api.aiJobs.getSummarizerHistory}
            icon={FileText}
            extractTitle={(job) => job.inputData?.outputFormat || 'Summary'}
            extractPreview={(job) => job.outputData?.summary || job.inputData?.text?.substring(0, 100) || 'Summarization'}
          />
        </div>
      </div>
    </div>
  );
}

