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
import { Mic, Upload, Sparkles, Download, Users, List, Lightbulb } from "lucide-react";
import { TextToolHistory } from "@/components/shared/TextToolHistory";
import { ToolAccessGuard } from "@/components/shared/ToolAccessGuard";

export default function TranscriptionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [language, setLanguage] = useState("");
  const [enableSpeakerDiarization, setEnableSpeakerDiarization] = useState(false);
  const [numSpeakers, setNumSpeakers] = useState(2);
  const [removeFillerWords, setRemoveFillerWords] = useState(true);
  const [fixGrammar, setFixGrammar] = useState(true);
  const [generateSummary, setGenerateSummary] = useState(true);
  const [extractActionItems, setExtractActionItems] = useState(true);
  const [extractKeyTopics, setExtractKeyTopics] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const transcribe = useAction(api.tools.transcription.transcribe);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      alert("Please select an audio file");
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

      // Process transcription
      const result = await transcribe({
        token,
        audioFileId: storageId,
        language: language || undefined,
        enableSpeakerDiarization,
        numSpeakers: enableSpeakerDiarization ? numSpeakers : undefined,
        removeFillerWords,
        fixGrammar,
        generateSummary,
        extractActionItems,
        extractKeyTopics,
      });

      setResults(result);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ToolAccessGuard toolId="transcription">
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Mic className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Professional Transcription Suite</h1>
        </div>
        <p className="text-muted-foreground">
          Transcribe audio/video with speaker diarization, summaries, and intelligent post-processing
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio/Video</CardTitle>
              <CardDescription>Select a file to transcribe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {fileName ? (
                  <div>
                    <Mic className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <p className="font-medium">{fileName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(selectedFile!.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileName("");
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <span className="text-primary underline">Click to upload</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                      <input
                        id="audio-upload"
                        type="file"
                        accept="audio/*,video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      MP3, WAV, M4A, MP4, or other audio/video formats
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="language">Language (optional, auto-detect if empty)</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g., en, es, fr, de"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transcription Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  id="diarization"
                  type="checkbox"
                  checked={enableSpeakerDiarization}
                  onChange={(e) => setEnableSpeakerDiarization(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="diarization">Speaker Diarization (Who said what)</Label>
              </div>

              {enableSpeakerDiarization && (
                <div className="ml-6">
                  <Label htmlFor="speakers">Number of Speakers</Label>
                  <Input
                    id="speakers"
                    type="number"
                    min={2}
                    max={10}
                    value={numSpeakers}
                    onChange={(e) => setNumSpeakers(parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  id="filler"
                  type="checkbox"
                  checked={removeFillerWords}
                  onChange={(e) => setRemoveFillerWords(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="filler">Remove Filler Words (um, uh, like)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="grammar"
                  type="checkbox"
                  checked={fixGrammar}
                  onChange={(e) => setFixGrammar(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="grammar">Fix Grammar & Punctuation</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Post-Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="summary"
                  type="checkbox"
                  checked={generateSummary}
                  onChange={(e) => setGenerateSummary(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="summary">Generate Summary</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="actions"
                  type="checkbox"
                  checked={extractActionItems}
                  onChange={(e) => setExtractActionItems(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="actions">Extract Action Items</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="topics"
                  type="checkbox"
                  checked={extractKeyTopics}
                  onChange={(e) => setExtractKeyTopics(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="topics">Extract Key Topics</Label>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Base credits: <span className="font-medium text-primary">10</span> + 5 per minute
                </p>
              </div>

              <Button 
                onClick={handleTranscribe} 
                disabled={isLoading || !selectedFile} 
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  "Transcribing..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Transcription
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
                    <span>Transcript</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {results.creditsUsed} credits used
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-md max-h-96 overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm">
                      {results.cleanedTranscript || results.transcript}
                    </p>
                  </div>

                  {results.metadata && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{results.metadata.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Words:</span>
                        <span>{results.metadata.wordCount}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-muted-foreground">Language:</span>
                        <span>{results.metadata.language}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download TXT
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Copy Text
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {results.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <List className="h-5 w-5 mr-2" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{results.summary}</p>
                  </CardContent>
                </Card>
              )}

              {results.actionItems && results.actionItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      Action Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.actionItems.map((item: string, i: number) => (
                        <li key={i} className="flex items-start text-sm">
                          <span className="text-primary mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {results.keyTopics && results.keyTopics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Topics Discussed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {results.keyTopics.map((topic: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {results.metadata?.isMock && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-yellow-800">
                      ℹ️ <strong>Mock Mode:</strong> Add OPENAI_API_KEY environment variable for real Whisper API transcription.
                      All post-processing features (summary, action items, topics) are working with AI!
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload an audio or video file to start transcription</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="flex items-center justify-center">
                      <Users className="h-4 w-4 mr-2" />
                      Speaker identification
                    </p>
                    <p className="flex items-center justify-center">
                      <List className="h-4 w-4 mr-2" />
                      Automatic summaries
                    </p>
                    <p className="flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Action item extraction
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Section */}
        <div className="mt-8">
          <TextToolHistory
            toolName="Transcription"
            queryFunction={api.aiJobs.getTranscriptionHistory}
            icon={Mic}
            extractTitle={(job) => 'Audio Transcription'}
            extractPreview={(job) => job.outputData?.transcript?.text?.substring(0, 100) || 'Transcription'}
          />
        </div>
      </div>
    </div>
    </ToolAccessGuard>
  );
}

