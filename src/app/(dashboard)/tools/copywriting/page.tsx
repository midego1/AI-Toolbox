"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PenTool, Sparkles, TrendingUp } from "lucide-react";
import { TextToolHistory } from "@/components/shared/TextToolHistory";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";

const CONTENT_TYPES = [
  { value: "email_subject", label: "Email Subject Line" },
  { value: "email_body", label: "Email Body" },
  { value: "ad_headline", label: "Ad Headline" },
  { value: "ad_body", label: "Ad Body Copy" },
  { value: "social_post", label: "Social Media Post" },
  { value: "product_description", label: "Product Description" },
  { value: "landing_page_hero", label: "Landing Page Hero" },
  { value: "video_script", label: "Video Script" },
  { value: "blog_outline", label: "Blog Outline" },
  { value: "seo_meta", label: "SEO Meta Description" },
];

const BRAND_TONES = ["professional", "friendly", "witty", "inspiring", "urgent", "casual", "authoritative"];

export default function CopywritingPage() {
  const [contentType, setContentType] = useState("social_post");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [uniqueSellingPoints, setUniqueSellingPoints] = useState("");
  const [brandTone, setBrandTone] = useState<string[]>(["professional"]);
  const [targetAudience, setTargetAudience] = useState("");
  const [keywords, setKeywords] = useState("");
  const [variants, setVariants] = useState(3);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateCopy = useAction(api.tools.copywriting.generateCopy);

  const handleGenerate = async () => {
    if (!productName || !productCategory || !uniqueSellingPoints) {
      alert("Please fill in required fields");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const uspArray = uniqueSellingPoints.split("\n").filter(line => line.trim());
      const keywordArray = keywords ? keywords.split(",").map(k => k.trim()) : undefined;

      const result = await generateCopy({
        token,
        contentType,
        productName,
        productCategory,
        uniqueSellingPoints: uspArray,
        brandVoiceTone: brandTone.length > 0 ? brandTone : undefined,
        targetAudienceProfession: targetAudience || undefined,
        mustIncludeKeywords: keywordArray,
        variants,
        includeAnalysis: true,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTone = (tone: string) => {
    setBrandTone(prev =>
      prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]
    );
  };

  return (
    <ToolAccessGuard toolId="copywriting">


  return (
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <PenTool className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">AI Copywriter Studio</h1>
        </div>
        <p className="text-muted-foreground">
          Generate professional marketing copy with advanced AI - multiple variants, A/B testing, and quality analysis
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>Tell us about what you're creating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <select
                  id="contentType"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {CONTENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="productName">Product/Service Name *</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., AI Toolbox Pro"
                />
              </div>

              <div>
                <Label htmlFor="productCategory">Category *</Label>
                <Input
                  id="productCategory"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  placeholder="e.g., SaaS, AI Tools"
                />
              </div>

              <div>
                <Label htmlFor="usp">Unique Selling Points * (one per line)</Label>
                <textarea
                  id="usp"
                  value={uniqueSellingPoints}
                  onChange={(e) => setUniqueSellingPoints(e.target.value)}
                  placeholder="Fast AI processing&#10;Affordable pricing&#10;Easy to use"
                  className="w-full mt-1 p-2 border rounded-md min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Brand Voice Tone</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {BRAND_TONES.map(tone => (
                    <Button
                      key={tone}
                      size="sm"
                      variant={brandTone.includes(tone) ? "default" : "outline"}
                      onClick={() => toggleTone(tone)}
                    >
                      {tone}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Small business owners, Developers"
                />
              </div>

              <div>
                <Label htmlFor="keywords">Required Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="AI, automation, productivity"
                />
              </div>

              <div>
                <Label htmlFor="variants">Number of Variants (A/B Testing)</Label>
                <Input
                  id="variants"
                  type="number"
                  min={1}
                  max={5}
                  value={variants}
                  onChange={(e) => setVariants(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Credits: {5 + (variants > 3 ? (variants - 3) * 2 : 0)}
                </p>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading} 
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Copy
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
                    <span>Generated Variants</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {results.creditsUsed} credits used
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.variants.map((variant: any, index: number) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Variant {variant.variantNumber}</CardTitle>
                          {variant.analysis && (
                            <div className="flex items-center text-sm">
                              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                              <span className="text-muted-foreground">{variant.analysis.estimatedCTR}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 bg-muted rounded-md">
                          <p className="whitespace-pre-wrap">{variant.copy}</p>
                        </div>
                        
                        {variant.analysis && (
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Words:</span>
                              <span>{variant.analysis.wordCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Characters:</span>
                              <span>{variant.analysis.charCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Readability:</span>
                              <span>{variant.analysis.readabilityScore}/10</span>
                            </div>
                            {variant.analysis.keywordsIncluded?.length > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Keywords:</span>
                                <span className="text-green-600">✓ {variant.analysis.keywordsIncluded.length} included</span>
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
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Fill in the details and click Generate to create professional copy</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Section */}
        <div className="mt-8">
          <TextToolHistory
            toolName="Copywriting"
            queryFunction={api.aiJobs.getCopywritingHistory}
            icon={PenTool}
            extractTitle={(job) => `${job.inputData?.contentType || 'Copy'} - ${job.inputData?.product?.name || 'Untitled'}`}
            extractPreview={(job) => job.outputData?.variants?.[0]?.copy || job.inputData?.product?.uniqueSellingPoints?.[0] || "Copywriting"}
          />
        </div>
      </div>
    </div>
  );
}

