"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Button } from "@/components/ui/button";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Label } from "@/components/ui/label";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { Shirt, Upload, Download, Sparkles, X } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";
import { WardrobeHistory } from "@/components/wardrobe/WardrobeHistory";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";

export default function WardrobePage() {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [personImagePreview, setPersonImagePreview] = useState<string>("");
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [clothingImagePreview, setClothingImagePreview] = useState<string>("");
  const [itemType, setItemType] = useState("accessories");
  const [style, setStyle] = useState("realistic");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const virtualTryOnTool = useAction(api.tools.wardrobe.virtualTryOnTool);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handlePersonImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPersonImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClothingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClothingImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setClothingImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!personImage || !clothingImage) {
      setError("Please upload both a photo of yourself and the clothing item");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("Please log in to use the virtual wardrobe");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccess("");

    try {
      // Upload person image
      const personUploadUrl = await generateUploadUrl({ token });
      const personData = await personImage.arrayBuffer();
      const personUploadResponse = await fetch(personUploadUrl, {
        method: "POST",
        headers: { "Content-Type": personImage.type },
        body: personData,
      });
      
      if (!personUploadResponse.ok) {
        throw new Error("Failed to upload person image");
      }
      
      const { storageId: personStorageId } = await personUploadResponse.json();

      // Upload clothing image
      const clothingUploadUrl = await generateUploadUrl({ token });
      const clothingData = await clothingImage.arrayBuffer();
      const clothingUploadResponse = await fetch(clothingUploadUrl, {
        method: "POST",
        headers: { "Content-Type": clothingImage.type },
        body: clothingData,
      });
      
      if (!clothingUploadResponse.ok) {
        throw new Error("Failed to upload clothing image");
      }
      
      const { storageId: clothingStorageId } = await clothingUploadResponse.json();

      // Generate virtual try-on
      const result = await virtualTryOnTool({
        token,
        personImageId: personStorageId,
        clothingImageId: clothingStorageId,
        itemType,
        style,
      });

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setSuccess(`Virtual try-on generated! (${result.creditsUsed} credits used)`);
      } else {
        throw new Error("Failed to generate virtual try-on");
      }
    } catch (error: any) {
      console.error("Virtual try-on error:", error);
      setError(error.message || "Failed to generate virtual try-on");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearPersonImage = () => {
    setPersonImage(null);
    setPersonImagePreview("");
  };

  const clearClothingImage = () => {
    setClothingImage(null);
    setClothingImagePreview("");
  };
  return (
    <ToolAccessGuard toolId="wardrobe">
      <div className="container mx-auto p-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Shirt className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Digital Wardrobe</h1>
        </div>
        <p className="text-muted-foreground">
          Upload a photo of yourself and a clothing item to see how it looks on you
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>Provide a photo of yourself and the clothing item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Person Image Upload */}
              <div className="space-y-2">
                <Label>Your Photo</Label>
                {!personImagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePersonImageChange}
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={personImagePreview}
                      alt="Person preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={clearPersonImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a clear photo of yourself, preferably full body or upper body
                </p>
              </div>

              {/* Clothing Image Upload */}
              <div className="space-y-2">
                <Label>Fashion Item</Label>
                {!clothingImagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleClothingImageChange}
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={clothingImagePreview}
                      alt="Clothing preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={clearClothingImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a clear photo of the item (clothing, accessory, shoes, etc.)
                </p>
              </div>
            </div>

            {/* Item Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="itemType">Item Type</Label>
              <select
                id="itemType"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
              >
                <option value="accessories">Accessories (Glasses, Jewelry, Hats, Watches)</option>
                <option value="upper-body">Upper Body (Shirts, Jackets, Blazers)</option>
                <option value="lower-body">Lower Body (Pants, Skirts, Shorts)</option>
                <option value="full-outfit">Full Outfit (Dresses, Suits, Jumpsuits)</option>
                <option value="footwear">Footwear (Shoes, Boots, Sneakers)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Select the type of item for best results. Accessories preserve your facial features.
              </p>
            </div>

            {/* Style Selection */}
            <div className="space-y-2">
              <Label htmlFor="style">Photography Style</Label>
              <select
                id="style"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="realistic">Realistic</option>
                <option value="fashion-photography">Fashion Photography</option>
                <option value="magazine-editorial">Magazine Editorial</option>
                <option value="casual">Casual Style</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!personImage || !clothingImage || isGenerating}
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
                Generate Virtual Try-On (15 credits)
              </>
            )}
          </Button>
          
          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center max-w-md">
              {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="text-green-500 text-sm text-center max-w-md">
              {success}
            </div>
          )}
        </div>

        {/* Generated Image */}
        {generatedImage && (
          <Card>
            <CardHeader>
              <CardTitle>Your Virtual Try-On</CardTitle>
              <CardDescription>See how the clothing looks on you!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden mb-4">
                <img
                  src={generatedImage}
                  alt="Virtual Try-On"
                  className="w-full h-auto"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = generatedImage;
                    link.download = `virtual-tryon-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Image
                </Button>
                <Button variant="outline" onClick={() => setGeneratedImage("")}>
                  Try Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Section */}
        <WardrobeHistory />
      </div>
    </div>
  );
}

