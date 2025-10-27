"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Scissors, ChevronDown } from "lucide-react";
import { getAuthToken } from "@/lib/auth-client";

export function BackgroundRemovalHistory() {
  const token = getAuthToken();
  const [offset, setOffset] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    outputType: string;
    date: string;
  } | null>(null);

  const history = useQuery(
    api.aiJobs.getBackgroundRemovalHistory,
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
                Your Background Removal History
              </CardTitle>
              <CardDescription>
                {history.total} {history.total === 1 ? "image" : "images"} processed
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
                  if (item.outputImageUrl) {
                    setSelectedImage({
                      url: item.outputImageUrl,
                      outputType: item.outputType || "cutout",
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
          outputType={selectedImage.outputType}
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
    if (item.outputImageUrl) {
      const link = document.createElement("a");
      link.href = item.outputImageUrl;
      link.download = `background-removed-${item._id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Get display name for output type
  const outputTypeName = (() => {
    const type = item.outputType || "cutout";
    switch (type) {
      case "cutout":
        return "Transparent";
      case "solid":
        return "Solid BG";
      case "blur":
        return "Blurred";
      default:
        return type;
    }
  })();

  const previewUrl = item.outputImageUrl;

  return (
    <div
      className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-105 bg-checkered"
      onClick={onClick}
    >
      {/* Image */}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Background removed result"
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
          <Scissors className="h-12 w-12 text-gray-400" />
        </div>
      )}

      {/* Badge */}
      <div className="absolute top-2 left-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
          <Scissors className="h-3 w-3" />
          {outputTypeName}
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

interface ImageModalProps {
  imageUrl: string;
  outputType: string;
  date: string;
  onClose: () => void;
}

function ImageModal({ imageUrl, outputType, date, onClose }: ImageModalProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `background-removed-${Date.now()}.png`;
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
          <div>
            <h3 className="font-semibold">Background Removed - {outputType}</h3>
            <p className="text-sm text-muted-foreground">{date}</p>
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
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] bg-checkered">
          <img
            src={imageUrl}
            alt="Full size result"
            className="max-w-full h-auto mx-auto"
          />
        </div>
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

