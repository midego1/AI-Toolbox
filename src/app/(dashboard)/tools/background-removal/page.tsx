"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Upload, Sparkles, Download } from "lucide-react";
import { BackgroundRemovalHistory } from "@/components/background-removal/BackgroundRemovalHistory";

export default function BackgroundRemovalPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [outputType, setOutputType] = useState("cutout");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [blurBackground, setBlurBackground] = useState(false);
  const [blurAmount, setBlurAmount] = useState(10);
  const [edgeRefinementLevel, setEdgeRefinementLevel] = useState(5);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const removeBackground = useAction(api.tools.backgroundRemoval.removeBackground);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Upload the file
      const uploadUrl = await generateUploadUrl({ token });
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!uploadResult.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await uploadResult.json();

      // Process background removal
      const result = await removeBackground({
        token,
        imageId: storageId,
        outputType,
        backgroundColor: outputType === "cutout" ? undefined : backgroundColor,
        blurBackground,
        blurAmount: blurBackground ? blurAmount : undefined,
        edgeRefinementLevel,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const creditsNeeded = 3 + (edgeRefinementLevel > 5 ? 2 : 0);

  return (
    <ToolAccessGuard toolId="background-removal">


  return (
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Scissors className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Background Remover Pro</h1>
        </div>
        <p className="text-muted-foreground">
          Remove backgrounds from images with advanced edge refinement and custom backgrounds
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Select an image to remove the background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {preview ? (
                  <div>
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview("");
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-primary underline">Click to upload</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="output">Output Type</Label>
                <select
                  id="output"
                  value={outputType}
                  onChange={(e) => setOutputType(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="cutout">Transparent Background (PNG)</option>
                  <option value="solid">Solid Color Background</option>
                  <option value="blur">Blur Original Background</option>
                </select>
              </div>

              {outputType === "solid" && (
                <div>
                  <Label htmlFor="color">Background Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      id="color"
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              )}

              {outputType === "blur" && (
                <div>
                  <Label htmlFor="blur">Blur Amount: {blurAmount}px</Label>
                  <input
                    id="blur"
                    type="range"
                    min={5}
                    max={50}
                    value={blurAmount}
                    onChange={(e) => setBlurAmount(parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="refinement">Edge Refinement Level: {edgeRefinementLevel}/10</Label>
                <input
                  id="refinement"
                  type="range"
                  min={1}
                  max={10}
                  value={edgeRefinementLevel}
                  onChange={(e) => setEdgeRefinementLevel(parseInt(e.target.value))}
                  className="w-full mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher values = better edge quality but more credits
                </p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Credits needed: <span className="font-medium text-primary">{creditsNeeded}</span>
                </p>
              </div>

              <Button 
                onClick={handleRemoveBackground} 
                disabled={isLoading || !selectedFile} 
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Remove Background
                  </>
                )}
              </Button>

              {results?.note && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <p className="text-yellow-800">{results.note}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Add REMOVE_BG_API_KEY environment variable for real processing
                  </p>
                </div>
              )}
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
                    <span>Result</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {results.creditsUsed} credits used
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 bg-checkered">
                    <img 
                      src={results.resultImageUrl} 
                      alt="Result" 
                      className="max-w-full mx-auto rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Full Size
                    </Button>
                  </div>

                  {results.note && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                      ℹ️ This is a preview. Configure REMOVE_BG_API_KEY for production use.
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <Scissors className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload an image to remove its background</p>
                  <p className="text-sm mt-2">Supports portraits, products, and more</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <BackgroundRemovalHistory />
      </div>

      <style jsx>{`
        .bg-checkered {
          background-image: 
            linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
}

