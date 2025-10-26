"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Copy, Download, Image as ImageIcon } from "lucide-react";

export default function OCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setExtractedText("");
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    // Simulate API call - replace with actual OCR service
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setExtractedText(
      "This is sample extracted text from your image.\n\nIn production, this would be the actual text extracted from your document using AI-powered OCR.\n\nThe text would maintain formatting and structure as much as possible."
    );
    setIsProcessing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setExtractedText("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">OCR - Text Extraction</h1>
        </div>
        <p className="text-muted-foreground">
          Extract text from images and documents with high accuracy
        </p>
      </div>

      <div className="grid gap-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image or Document</CardTitle>
            <CardDescription>
              Supports JPG, PNG, PDF • Max size: 10MB • Cost: 2 credits per image
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or PDF (MAX. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-muted rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <ImageIcon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleReset}>
                    Remove
                  </Button>
                </div>

                {previewUrl && (
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-h-96 object-contain bg-muted"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extract Button */}
        {selectedFile && !extractedText && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleExtract}
              disabled={isProcessing}
              className="min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                "Extract Text (2 credits)"
              )}
            </Button>
          </div>
        )}

        {/* Extracted Text */}
        {extractedText && (
          <Card>
            <CardHeader>
              <CardTitle>Extracted Text</CardTitle>
              <CardDescription>
                Text successfully extracted from your image
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full min-h-[200px] rounded-md border border-input bg-muted/50 px-4 py-3 text-sm whitespace-pre-wrap mb-4">
                {extractedText}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download as TXT
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Process Another Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
