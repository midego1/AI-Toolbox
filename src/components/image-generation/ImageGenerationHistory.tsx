"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Image as ImageIcon, ChevronDown } from "lucide-react";
import { getAuthToken } from "@/lib/auth-client";

export function ImageGenerationHistory() {
  const token = getAuthToken();
  const [offset, setOffset] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    prompt: string;
    date: string;
  } | null>(null);

  const history = useQuery(
    api.aiJobs.getImageGenerationHistory,
    token ? { token, limit: 12, offset } : "skip"
  );

  if (!token) {
    return null;
  }

  if (!history || history.items.length === 0) {
    return null; // Don't show section if no history
  }

  const handleLoadMore = () => {
    setOffset(offset + 12);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Your Image Generation History
              </CardTitle>
              <CardDescription>
                {history.total} {history.total === 1 ? "image" : "images"} generated
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {history.items.map((item) => (
              <HistoryCard
                key={item._id}
                item={item}
                onClick={() => {
                  if (item.imageUrl) {
                    setSelectedImage({
                      url: item.imageUrl,
                      prompt: item.prompt,
                      date: new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }),
                    });
                  }
                }}
              />
            ))}
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

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          prompt={selectedImage.prompt}
          date={selectedImage.date}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}

interface HistoryCardProps {
  item: any;
  onClick: () => void;
}

function HistoryCard({ item, onClick }: HistoryCardProps) {
  const createdDate = new Date(item.createdAt);
  const formattedDate = createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.imageUrl) {
      const link = document.createElement("a");
      link.href = item.imageUrl;
      link.download = `generated-image-${item._id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const previewUrl = item.imageUrl;

  return (
    <div
      className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-105"
      onClick={onClick}
    >
      {/* Image */}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Generated image"
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}

      {/* Prompt Badge */}
      <div className="absolute top-2 left-2 right-2">
        <span className="inline-block px-2 py-1 bg-black/60 text-white text-xs rounded backdrop-blur-sm line-clamp-2">
          {item.prompt.substring(0, 60)}...
        </span>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleDownload}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <div className="text-center">
          <p className="text-xs text-white font-medium">{formattedDate}</p>
          <p className="text-xs text-white/80">{item.creditsUsed} credits</p>
        </div>
      </div>
    </div>
  );
}

interface ImageModalProps {
  imageUrl: string;
  prompt: string;
  date: string;
  onClose: () => void;
}

function ImageModal({ imageUrl, prompt, date, onClose }: ImageModalProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="font-semibold mb-1">Generated Image</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{prompt}</p>
            <p className="text-xs text-muted-foreground mt-1">{date}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-100px)] bg-gray-50">
          <img
            src={imageUrl}
            alt="Full size generated image"
            className="max-w-full h-auto mx-auto rounded"
          />
        </div>
      </div>
    </div>
  );
}




