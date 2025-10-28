"use client";

import { useState, useRef } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { getAuthToken } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Copy, Download, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { TextToolHistory } from "@/components/shared/TextToolHistory";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";

export default function OCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get auth token
  const token = getAuthToken();

  // Convex mutations and actions
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const performOCR = useAction(api.tools.ocr.performOCR);

  // Get current user for credits display
  const user = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");

  const handleFileSelect = (file: File) => {
    setError("");
    setSuccess("");

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file (PNG, JPG, JPEG)");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setExtractedText("");
    setCreditsUsed(0);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile || !token) return;

    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Get upload URL from Convex
      const uploadUrl = await generateUploadUrl({ token });

      // Step 2: Upload file to Convex storage
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await uploadResult.json();

      // Step 3: Perform OCR using Convex action
      const result = await performOCR({
        token,
        fileId: storageId as Id<"_storage">,
      });

      // Step 4: Display results
      setExtractedText(result.extractedText);
      setCreditsUsed(result.creditsUsed);
      setSuccess(`Text extracted successfully! Used ${result.creditsUsed} credits.`);

    } catch (err: any) {
      console.error("OCR error:", err);
      setError(err.message || "Failed to extract text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setSuccess("Text copied to clipboard!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to copy text");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-result-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccess("File downloaded!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setExtractedText("");
    setError("");
    setSuccess("");
    setCreditsUsed(0);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <ToolAccessGuard toolId="ocr">
      <div className="container mx-auto p-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">OCR - Text Extraction</h1>
          </div>
          {user && (
            <div className="text-sm text-muted-foreground">
              Available Credits: <span className="font-semibold text-foreground">{user.creditsBalance}</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground">
          Extract text from images and documents using AI-powered OCR
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {success && (
        <Card className="mb-6 border-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Supports JPG, PNG, JPEG • Max size: 10MB • Cost: 5 credits per image
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all
                  ${isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-muted-foreground/25 bg-muted/50 hover:bg-muted/80'
                  }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`h-10 w-10 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or JPEG (MAX. 10MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileInputChange}
                />
              </div>
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
                  <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                    Remove
                  </Button>
                </div>

                {previewUrl && (
                  <div className="border rounded-lg overflow-hidden bg-muted">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-h-96 object-contain"
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
              disabled={isProcessing || !token}
              className="min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Extracting Text...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Extract Text (5 credits)
                </>
              )}
            </Button>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Processing your image... This may take a few moments.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Text */}
        {extractedText && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Extracted Text</CardTitle>
                  <CardDescription>
                    Text successfully extracted from your image
                  </CardDescription>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Credits used: </span>
                  <span className="font-semibold text-foreground">{creditsUsed}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full min-h-[200px] max-h-[400px] overflow-y-auto rounded-md border border-input bg-muted/50 px-4 py-3 text-sm whitespace-pre-wrap mb-4 font-mono">
                {extractedText}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
                <Button variant="outline" onClick={handleDownload}>
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

        {/* Info Card */}
        {!selectedFile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  1
                </div>
                <p>Upload an image containing text (documents, screenshots, photos, etc.)</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  2
                </div>
                <p>Our AI analyzes the image and extracts all readable text</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  3
                </div>
                <p>Copy the extracted text or download it as a TXT file</p>
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs">
                  <strong>Pro Tip:</strong> For best results, use clear, well-lit images with high contrast between text and background.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Section */}
        <div className="mt-8">
          <TextToolHistory
            toolName="OCR"
            queryFunction={api.aiJobs.getOCRHistory}
            icon={FileText}
            extractTitle={(job) => "Text Extraction"}
            extractPreview={(job) => job.outputData?.extractedText || "OCR completed"}
          />
        </div>
      </div>
    </div>
    </ToolAccessGuard>
  );
}
