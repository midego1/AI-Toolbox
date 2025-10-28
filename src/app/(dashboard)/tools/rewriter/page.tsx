"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Sparkles, BarChart3 } from "lucide-react";
import { TextToolHistory } from "@/components/shared/TextToolHistory";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";

const REWRITE_GOALS = [
  { value: "simplify", label: "Simplify", desc: "Use simpler language" },
  { value: "academic", label: "Academic", desc: "Formal, scholarly style" },
  { value: "professional", label: "Professional", desc: "Business appropriate" },
  { value: "creative", label: "Creative", desc: "Engaging and vivid" },
  { value: "persuasive", label: "Persuasive", desc: "Compelling and convincing" },
  { value: "seo_optimize", label: "SEO Optimize", desc: "Search engine friendly" },
];

export default function RewriterPage() {
  const [text, setText] = useState("");
  const [rewriteGoal, setRewriteGoal] = useState("professional");
  const [changeLength, setChangeLength] = useState("maintain");
  const [changeTone, setChangeTone] = useState("");
  const [changeComplexity, setChangeComplexity] = useState("");
  const [changePointOfView, setChangePointOfView] = useState("");
  const [preserveKeywords, setPreserveKeywords] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [variants, setVariants] = useState(2);
  const [qualityMetrics, setQualityMetrics] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const rewriteContent = useAction(api.tools.rewriter.rewriteContent);

  const handleRewrite = async () => {
    if (!text.trim()) {
      alert("Please enter text to rewrite");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const preserveArray = preserveKeywords ? preserveKeywords.split(",").map(k => k.trim()) : undefined;
      const seoArray = seoKeywords ? seoKeywords.split(",").map(k => k.trim()) : undefined;

      const result = await rewriteContent({
        token,
        text,
        rewriteGoal,
        changeLength: changeLength !== "maintain" ? changeLength : undefined,
        changeTone: changeTone || undefined,
        changeComplexity: changeComplexity || undefined,
        changePointOfView: changePointOfView || undefined,
        preserveKeywords: preserveArray,
        seoKeywords: seoArray,
        avoidPlagiarism: true,
        variants,
        qualityMetrics,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const creditsNeeded = Math.max(3, Math.ceil(wordCount / 200) + (variants - 1));
  return (
    <ToolAccessGuard toolId="rewriter">
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <RefreshCw className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Content Rewriter & Paraphraser</h1>
        </div>
        <p className="text-muted-foreground">
          Transform your content with tone, complexity, and style control - avoid plagiarism naturally
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Original Text</CardTitle>
              <CardDescription>Paste the content you want to rewrite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your text here..."
                  className="w-full h-48 p-3 border rounded-md font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {wordCount} words • Credits needed: {creditsNeeded}
                </p>
              </div>

              <div>
                <Label htmlFor="goal">Rewrite Goal</Label>
                <select
                  id="goal"
                  value={rewriteGoal}
                  onChange={(e) => setRewriteGoal(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {REWRITE_GOALS.map(goal => (
                    <option key={goal.value} value={goal.value}>
                      {goal.label} - {goal.desc}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transformation Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="length">Length Change</Label>
                <select
                  id="length"
                  value={changeLength}
                  onChange={(e) => setChangeLength(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="maintain">Maintain Original Length</option>
                  <option value="shorten">Shorten (-30%)</option>
                  <option value="expand">Expand (+50%)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="tone">Change Tone To</Label>
                <Input
                  id="tone"
                  value={changeTone}
                  onChange={(e) => setChangeTone(e.target.value)}
                  placeholder="e.g., formal, casual, friendly, urgent"
                />
              </div>

              <div>
                <Label htmlFor="complexity">Complexity</Label>
                <select
                  id="complexity"
                  value={changeComplexity}
                  onChange={(e) => setChangeComplexity(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Keep Same</option>
                  <option value="simplify">Simplify (easier to read)</option>
                  <option value="sophisticate">Sophisticate (more advanced)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="pov">Point of View</Label>
                <select
                  id="pov"
                  value={changePointOfView}
                  onChange={(e) => setChangePointOfView(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Keep Same</option>
                  <option value="first_person">First Person (I, we)</option>
                  <option value="second_person">Second Person (you)</option>
                  <option value="third_person">Third Person (they, it)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="preserve">Preserve Keywords (comma-separated)</Label>
                <Input
                  id="preserve"
                  value={preserveKeywords}
                  onChange={(e) => setPreserveKeywords(e.target.value)}
                  placeholder="e.g., AI, machine learning, productivity"
                />
              </div>

              <div>
                <Label htmlFor="seo">SEO Keywords (comma-separated)</Label>
                <Input
                  id="seo"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="e.g., digital marketing, growth hacking"
                />
              </div>

              <div>
                <Label htmlFor="variants">Generate Variants</Label>
                <Input
                  id="variants"
                  type="number"
                  min={1}
                  max={5}
                  value={variants}
                  onChange={(e) => setVariants(parseInt(e.target.value))}
                  className="w-24"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="metrics"
                  type="checkbox"
                  checked={qualityMetrics}
                  onChange={(e) => setQualityMetrics(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="metrics">Include Quality Metrics</Label>
              </div>

              <Button 
                onClick={handleRewrite} 
                disabled={isLoading || !text.trim()} 
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  "Rewriting..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Rewrite Content
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
              {results.rewrites.map((rewrite: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Variant {rewrite.variantNumber}</span>
                      {rewrite.metrics && (
                        <div className="flex items-center text-sm">
                          <BarChart3 className="h-4 w-4 mr-1 text-blue-600" />
                          <span className="text-muted-foreground">
                            Score: {rewrite.metrics.readabilityScore}/10
                          </span>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-md max-h-96 overflow-y-auto">
                      <p className="whitespace-pre-wrap">{rewrite.text}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original:</span>
                        <span className="font-medium">{rewrite.originalWordCount} words</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rewritten:</span>
                        <span className="font-medium">{rewrite.rewrittenWordCount} words</span>
                      </div>
                    </div>

                    {rewrite.metrics && (
                      <div className="pt-3 border-t space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Readability:</span>
                          <span className="font-medium">{rewrite.metrics.readabilityScore}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Similarity to Original:</span>
                          <span className="font-medium">{rewrite.metrics.similarityToOriginal}%</span>
                        </div>
                        {rewrite.metrics.keywordPresence && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Keywords Preserved:</span>
                            <span className="font-medium text-green-600">
                              {rewrite.metrics.keywordPresence.percentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <Button variant="outline" className="w-full" size="sm">
                      Copy to Clipboard
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generated {results.rewrites.length} variants using {results.creditsUsed} credits
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter your text and select transformation options to rewrite your content</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Section */}
        <div className="mt-8">
          <TextToolHistory
            toolName="Content Rewriter"
            queryFunction={api.aiJobs.getRewriterHistory}
            icon={RefreshCw}
            extractTitle={(job) => job.inputData?.rewriteGoal || 'Rewrite'}
            extractPreview={(job) => job.outputData?.rewrites?.[0]?.text || job.inputData?.text || 'Rewriting'}
          />
        </div>
      </div>
    </div>
  );
}

