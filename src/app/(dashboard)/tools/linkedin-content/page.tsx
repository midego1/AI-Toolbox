"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin, Sparkles, TrendingUp, Users } from "lucide-react";
import { TextToolHistory } from "@/components/shared/TextToolHistory";

const CONTENT_TYPES = [
  { value: "post", label: "LinkedIn Post", desc: "Engaging post for your feed" },
  { value: "article", label: "LinkedIn Article", desc: "Long-form article" },
  { value: "recommendation", label: "Recommendation", desc: "Professional reference" },
  { value: "profile_headline", label: "Profile Headline", desc: "Under 220 characters" },
  { value: "profile_about", label: "About Section", desc: "Profile summary" },
  { value: "job_description", label: "Job Description", desc: "Hiring post" },
];

const TONES = ["professional", "thoughtful", "inspiring", "conversational", "authoritative", "friendly"];

export default function LinkedInContentPage() {
  const [contentType, setContentType] = useState("post");
  const [topic, setTopic] = useState("");
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState<string[]>(["professional"]);
  const [length, setLength] = useState("medium");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [hashtagCount, setHashtagCount] = useState(3);
  const [includeQuestion, setIncludeQuestion] = useState(true);
  const [includeCallToAction, setIncludeCallToAction] = useState(false);
  const [variants, setVariants] = useState(2);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateLinkedInContent = useAction(api.tools.linkedinContent.generateLinkedInContent);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const result = await generateLinkedInContent({
        token,
        contentType,
        topic,
        industry: industry || undefined,
        role: role || undefined,
        tone: tone.length > 0 ? tone : undefined,
        length,
        includeHashtags,
        hashtagCount: includeHashtags ? hashtagCount : undefined,
        includeQuestion,
        includeCallToAction,
        variants,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTone = (t: string) => {
    setTone(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const selectedType = CONTENT_TYPES.find(t => t.value === contentType);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Linkedin className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">LinkedIn Content Engine</h1>
        </div>
        <p className="text-muted-foreground">
          Create engaging LinkedIn content with AI - posts, articles, and profile optimization
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>What would you like to create?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Content Type</Label>
                <select
                  id="type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {CONTENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="topic">Topic / Main Message *</Label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., How AI is transforming the workplace, My experience with remote work, etc."
                  className="w-full mt-1 p-2 border rounded-md min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industry (optional)</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Technology, Finance, Healthcare"
                />
              </div>

              <div>
                <Label htmlFor="role">Your Role (optional)</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Software Engineer, Marketing Manager"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Style & Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tone</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TONES.map(t => (
                    <Button
                      key={t}
                      size="sm"
                      variant={tone.includes(t) ? "default" : "outline"}
                      onClick={() => toggleTone(t)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="length">Length</Label>
                <select
                  id="length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="short">Short (50-100 words)</option>
                  <option value="medium">Medium (100-200 words)</option>
                  <option value="long">Long (200-300 words)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="hashtags"
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="hashtags">Include Hashtags</Label>
              </div>

              {includeHashtags && (
                <div className="ml-6">
                  <Label htmlFor="hashtagCount">Number of Hashtags</Label>
                  <Input
                    id="hashtagCount"
                    type="number"
                    min={1}
                    max={10}
                    value={hashtagCount}
                    onChange={(e) => setHashtagCount(parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  id="question"
                  type="checkbox"
                  checked={includeQuestion}
                  onChange={(e) => setIncludeQuestion(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="question">End with Engaging Question</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="cta"
                  type="checkbox"
                  checked={includeCallToAction}
                  onChange={(e) => setIncludeCallToAction(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="cta">Include Call-to-Action</Label>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Credits: {5 + (variants > 2 ? variants - 2 : 0)}
                </p>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading || !topic.trim()} 
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
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
                    <span>{selectedType?.label} Variants</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {results.creditsUsed} credits
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.contents.map((content: any, index: number) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Variant {content.variantNumber}</CardTitle>
                          {content.engagement && (
                            <div className="flex items-center text-sm">
                              <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                              <span className="text-muted-foreground">
                                Score: {content.engagement.score}/100
                              </span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 bg-muted rounded-md max-h-96 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{content.text}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Words:</span>
                            <span>{content.wordCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Characters:</span>
                            <span>{content.charCount}</span>
                          </div>
                        </div>

                        {content.engagement && (
                          <div className="pt-2 border-t text-sm space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Est. Views:</span>
                              <span>{content.engagement.estimatedViews}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Est. Engagement:</span>
                              <span>{content.engagement.estimatedEngagement}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {content.engagement.hasQuestion && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  ✓ Question
                                </span>
                              )}
                              {content.engagement.hasCallToAction && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  ✓ CTA
                                </span>
                              )}
                            </div>
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
                  <Linkedin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter your topic and preferences to generate professional LinkedIn content</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Section */}
        <div className="mt-8">
          <TextToolHistory
            toolName="LinkedIn Content"
            queryFunction={api.aiJobs.getLinkedInHistory}
            icon={Linkedin}
            extractTitle={(job) => job.inputData?.contentType || 'LinkedIn Post'}
            extractPreview={(job) => job.outputData?.contents?.[0]?.text || job.inputData?.topic || 'LinkedIn Content'}
          />
        </div>
      </div>
    </div>
  );
}

