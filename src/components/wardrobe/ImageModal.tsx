"use client";

import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageModalProps {
  imageUrl: string;
  itemType: string;
  date: string;
  onClose: () => void;
}

export function ImageModal({ imageUrl, itemType, date, onClose }: ImageModalProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `wardrobe-${Date.now()}.png`;
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
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-8 w-8" />
        </button>

        {/* Image */}
        <div className="bg-white rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Virtual try-on result"
            className="w-full h-auto max-h-[80vh] object-contain"
          />

          {/* Info bar */}
          <div className="p-4 bg-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {itemType.replace("-", " ")}
              </p>
              <p className="text-xs text-gray-500">{date}</p>
            </div>
            <Button onClick={handleDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}



