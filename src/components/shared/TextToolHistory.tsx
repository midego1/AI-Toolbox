"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChevronDown, Copy, Check } from "lucide-react";
import { getAuthToken } from "@/lib/auth-client";

interface TextToolHistoryProps {
  toolName: string;
  queryFunction: any;
  icon: React.ComponentType<{ className?: string }>;
  extractPreview: (job: any) => string;
  extractTitle: (job: any) => string;
}

export function TextToolHistory({ toolName, queryFunction, icon: Icon, extractPreview, extractTitle }: TextToolHistoryProps) {
  const token = getAuthToken();
  const [offset, setOffset] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const history = useQuery(
    queryFunction,
    token ? { token, limit: 10, offset } : "skip"
  );

  if (!token) {
    return null;
  }

  if (!history || history.items.length === 0) {
    return null; // Don't show section if no history
  }

  const handleLoadMore = () => {
    setOffset(offset + 10);
  };

  const handleCopy = async (text: string, jobId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(jobId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Your {toolName} History
              </CardTitle>
              <CardDescription>
                {history.total} {history.total === 1 ? "item" : "items"} in your history
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* List */}
          <div className="space-y-3">
            {history.items.map((job: any) => {
              const title = extractTitle(job);
              const preview = extractPreview(job);
              const formattedDate = new Date(job.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={job._id}
                  className="group border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <h4 className="font-medium text-sm truncate">{title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {preview}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{job.creditsUsed} credits</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(preview, job._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedId === job._id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {history.hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="min-w-[200px]"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          toolName={toolName}
          extractTitle={extractTitle}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
}

interface JobDetailModalProps {
  job: any;
  toolName: string;
  extractTitle: (job: any) => string;
  onClose: () => void;
}

function JobDetailModal({ job, toolName, extractTitle, onClose }: JobDetailModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formattedDate = new Date(job.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-semibold">{extractTitle(job)}</h3>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* Input */}
          {job.inputData && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Input</h4>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <pre className="whitespace-pre-wrap font-sans">
                  {JSON.stringify(job.inputData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Output */}
          {job.outputData && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Output</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(JSON.stringify(job.outputData, null, 2), "output")}
                >
                  {copiedSection === "output" ? (
                    <>
                      <Check className="h-3 w-3 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <pre className="whitespace-pre-wrap font-sans">
                  {JSON.stringify(job.outputData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>Credits Used: {job.creditsUsed}</p>
            <p>Job ID: {job._id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}



