"use client";

import { useEffect, useState } from "react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

export const OrderItemImage = ({
  image,
  name = "Order item",
}: {
  image?: string;
  name?: string;
}) => {
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setHasError(false);
  }, [image]);

  if (!image || hasError) {
    return (
      <div
        role="img"
        aria-label={`${name} image not available`}
        className="w-full h-full flex flex-col items-center justify-center bg-orange-50"
      >
        <DynamicIcon
          name="Flame"
          size={20}
          className="text-orange-200"
          aria-hidden="true"
        />
        <p className="text-xs text-gray-500">No image found</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!imageLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <DynamicIcon name="ShoppingBag" size={32} className="text-gray-300" />
            <p className="text-gray-300 text-xs">Loading image...</p>
          </div>
        </div>
      )}
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover"
        onLoad={() => setImageLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
};
