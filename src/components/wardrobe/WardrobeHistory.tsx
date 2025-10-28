"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Shirt, ChevronDown } from "lucide-react";
import { getAuthToken } from "@/lib/auth-client";
import { ImageModal } from "./ImageModal";

export function WardrobeHistory() {
  const token = getAuthToken();
  const [offset, setOffset] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    itemType: string;
    date: string;
  } | null>(null);

  const history = useQuery(
    api.aiJobs.getWardrobeHistory,
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
                Your Try-On History
              </CardTitle>
              <CardDescription>
                {history.total} {history.total === 1 ? "item" : "items"} in your wardrobe
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
                      itemType: item.itemType,
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

      {/* Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          itemType={selectedImage.itemType}
          date={selectedImage.date}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}

interface HistoryCardProps {
  item: {
    _id: string;
    itemType: string;
    style: string;
    outputImageUrl: string | null;
    createdAt: number;
    creditsUsed: number;
  };
  onClick: () => void;
}

function HistoryCard({ item, onClick }: HistoryCardProps) {
  const createdDate = new Date(item.createdAt);
  const formattedDate = createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.outputImageUrl) {
      const link = document.createElement("a");
      link.href = item.outputImageUrl;
      link.download = `wardrobe-${item._id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Get display name for item type
  const itemTypeName = item.itemType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div
      className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-105"
      onClick={onClick}
    >
      {/* Image */}
      {item.outputImageUrl ? (
        <img
          src={item.outputImageUrl}
          alt="Try-on result"
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
          <Shirt className="h-12 w-12 text-gray-400" />
        </div>
      )}

      {/* Badge */}
      <div className="absolute top-2 left-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
          <Shirt className="h-3 w-3" />
          {itemTypeName}
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
          <p className="text-xs text-white/80">{item.style}</p>
        </div>
      </div>
    </div>
  );
}






