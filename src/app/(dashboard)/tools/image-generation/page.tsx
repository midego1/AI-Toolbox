"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Download, Sparkles } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [size, setSize] = useState("1024x1024");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { token } = useAuth();

  const generateImageTool = useAction(api.tools.imageGeneration.generateImageTool);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!token) {
      toast.error("Please log in to generate images");
      return;
    }

    setIsGenerating(true);

    try {
      // Enhance prompt with style if specified
      let enhancedPrompt = prompt;
      if (style !== "realistic") {
        enhancedPrompt = `${prompt} in ${style} style`;
      }

      const result = await generateImageTool({
        token,
        prompt: enhancedPrompt,
        size,
        quality: "standard",
      });

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        toast.success(`Image generated! (${result.creditsUsed} credits used)`);
      } else {
        throw new Error("Failed to generate image");
      }
    } catch (error: any) {
      console.error("Image generation error:", error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <ImageIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Image Generation</h1>
        </div>
        <p className="text-muted-foreground">
          Create stunning AI-generated images from text descriptions
        </p>
      </div>

      <div className="grid gap-6">
        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Image Settings</CardTitle>
            <CardDescription>Configure your AI-generated image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Input
                id="prompt"
                placeholder="A serene landscape with mountains and a lake at sunset..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Describe the image you want to create in detail
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <select
                  id="style"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  <option value="realistic">Realistic</option>
                  <option value="artistic">Artistic</option>
                  <option value="anime">Anime</option>
                  <option value="digital-art">Digital Art</option>
                  <option value="3d-render">3D Render</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <select
                  id="size"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  <option value="1024x1024">Square (1024x1024)</option>
                  <option value="1024x1792">Portrait (1024x1792)</option>
                  <option value="1792x1024">Landscape (1792x1024)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="min-w-[200px]"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Image (10 credits)
              </>
            )}
          </Button>
        </div>

        {/* Generated Image */}
        {generatedImage && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
              <CardDescription>Your AI-created masterpiece</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden mb-4">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full h-auto"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = generatedImage;
                    link.download = `ai-generated-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Image
                </Button>
                <Button variant="outline" onClick={() => setGeneratedImage("")}>
                  Generate Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
