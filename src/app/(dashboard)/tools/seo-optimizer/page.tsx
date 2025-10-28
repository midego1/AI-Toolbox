"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { TextToolHistory } from "@/components/shared/TextToolHistory";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";

export default function SEOOptimizerPage() {
  const [content, setContent] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [searchIntent, setSearchIntent] = useState("informational");
  const [optimizeHeadings, setOptimizeHeadings] = useState(true);
  const [optimizeMetaDescription, setOptimizeMetaDescription] = useState(true);
  const [optimizeTitle, setOptimizeTitle] = useState(true);
  const [addFAQs, setAddFAQs] = useState(true);
  const [addStatistics, setAddStatistics] = useState(false);
  const [improveReadability, setImproveReadability] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const optimizeSEO = useAction(api.tools.seoOptimizer.optimizeSEO);

  const handleOptimize = async () => {
    if (!content.trim() || !targetKeyword.trim()) {
      alert("Please enter content and target keyword");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const secondaryArray = secondaryKeywords ? secondaryKeywords.split(",").map(k => k.trim()) : undefined;

      const result = await optimizeSEO({
        token,
        content,
        targetKeyword,
        searchIntent,
        secondaryKeywords: secondaryArray,
        optimizeHeadings,
        optimizeMetaDescription,
        optimizeTitle,
        addFAQs,
        addStatistics,
        improveReadability,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const creditsNeeded = Math.max(8, Math.ceil(wordCount / 200) + 5);
  return (
    <ToolAccessGuard toolId="seo-optimizer">
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">SEO Content Optimizer</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive SEO optimization with keyword analysis, meta tags, and content structure improvements
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content to Optimize</CardTitle>
              <CardDescription>Paste your article or web content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your content here..."
                  className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {wordCount} words • Credits: {creditsNeeded}
                </p>
              </div>

              <div>
                <Label htmlFor="keyword">Primary Keyword *</Label>
                <Input
                  id="keyword"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="e.g., AI content writing"
                />
              </div>

              <div>
                <Label htmlFor="secondary">Secondary Keywords (comma-separated)</Label>
                <Input
                  id="secondary"
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  placeholder="e.g., AI writing tools, content automation"
                />
              </div>

              <div>
                <Label htmlFor="intent">Search Intent</Label>
                <select
                  id="intent"
                  value={searchIntent}
                  onChange={(e) => setSearchIntent(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="informational">Informational</option>
                  <option value="transactional">Transactional</option>
                  <option value="navigational">Navigational</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="headings"
                  type="checkbox"
                  checked={optimizeHeadings}
                  onChange={(e) => setOptimizeHeadings(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="headings">Optimize Headings (H2/H3)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="title"
                  type="checkbox"
                  checked={optimizeTitle}
                  onChange={(e) => setOptimizeTitle(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="title">Generate SEO Title Tags</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="meta"
                  type="checkbox"
                  checked={optimizeMetaDescription}
                  onChange={(e) => setOptimizeMetaDescription(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="meta">Generate Meta Descriptions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="faqs"
                  type="checkbox"
                  checked={addFAQs}
                  onChange={(e) => setAddFAQs(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="faqs">Generate FAQ Section</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="readability"
                  type="checkbox"
                  checked={improveReadability}
                  onChange={(e) => setImproveReadability(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="readability">Improve Readability</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="stats"
                  type="checkbox"
                  checked={addStatistics}
                  onChange={(e) => setAddStatistics(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="stats">Add Statistics Placeholders</Label>
              </div>

              <Button 
                onClick={handleOptimize} 
                disabled={isLoading || !content.trim() || !targetKeyword.trim()} 
                className="w-full mt-4"
                size="lg"
              >
                {isLoading ? (
                  "Optimizing..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Optimize for SEO
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
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>SEO Score Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-muted-foreground">{results.original.seoScore}</p>
                      <p className="text-sm text-muted-foreground">Original Score</p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{results.optimized.seoScore}</p>
                      <p className="text-sm text-muted-foreground">Optimized Score</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold text-green-600">
                      +{results.improvements.scoreIncrease} point improvement
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimized Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-md max-h-96 overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm">{results.optimized.content}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Words:</span>
                      <span>{results.optimized.wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Keyword Density:</span>
                      <span>{results.optimized.keywordDensity}%</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">Copy Optimized Content</Button>
                </CardContent>
              </Card>

              {results.optimized.metadata?.title && (
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Meta Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Title Options:</Label>
                      {results.optimized.metadata.title.map((title: string, i: number) => (
                        <div key={i} className="p-2 bg-muted rounded mt-1 text-sm">
                          {title}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {results.optimized.metadata?.metaDescription && (
                <Card>
                  <CardHeader>
                    <CardTitle>Meta Descriptions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {results.optimized.metadata.metaDescription.map((desc: string, i: number) => (
                      <div key={i} className="p-2 bg-muted rounded text-sm">
                        {desc}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {results.optimized.faqs && results.optimized.faqs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>FAQ Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.optimized.faqs.map((faq: any, i: number) => (
                      <div key={i} className="border-b pb-3 last:border-0">
                        <p className="font-medium text-sm mb-1">{faq.question}</p>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {results.improvements.suggestions && results.improvements.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Improvement Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.improvements.suggestions.map((suggestion: string, i: number) => (
                        <li key={i} className="flex items-start text-sm">
                          <AlertCircle className="h-4 w-4 mr-2 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter your content and target keyword to optimize for SEO</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Section */}
        <div className="mt-8">
          <TextToolHistory
            toolName="SEO Optimization"
            queryFunction={api.aiJobs.getSEOHistory}
            icon={TrendingUp}
            extractTitle={(job) => 'SEO Analysis'}
            extractPreview={(job) => job.outputData?.optimizedContent?.substring(0, 100) || job.inputData?.content?.substring(0, 100) || 'SEO Optimization'}
          />
        </div>
      </div>
    </div>
  );
}

