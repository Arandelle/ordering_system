"use client";

import { AppImage } from "@/components/AppImage";
import { IconButton } from "@/components/ui/buttons";
import { useState, useEffect, useCallback } from "react";

const images = [
  "/promos/Slider Banner 1.png",
  "/promos/Slider Banner 2.png",
  "/images/BANNER 2.png",
  "/images/BANNER 3.png",
];

export default function CarouselBanner() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const DURATION = 4000;

  const goTo = (idx: number) =>
    setCurrent((idx + images.length) % images.length);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    setProgress(0);
    const start = performance.now();
    let raf: any;
    const tick = (now: number) => {
      const p = Math.min((now - start) / DURATION, 1);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else next();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current, next]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div
        role="region"
        aria-label="Image Carousel"
        className="relative w-full overflow-hidden bg-brand-color-500"
        style={{ aspectRatio: "16/9", maxHeight: "70vh" }}
      >
        {/* Images */}
        {images.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 w-full h-full transition-opacity duration-700"
          >
            <AppImage
              src={src}
              alt={`Slide ${i + 1}`}
              style={{ opacity: i === current ? 1 : 0 }}
              className=" object-fill"
            />
          </div>
        ))}
        {/* Prev / Next */}
        <IconButton
          onClick={() => goTo(current - 1)}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
          icon={{ name: "ChevronLeft" }}
        />
        <IconButton
          onClick={() => goTo(current + 1)}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
          icon={{ name: "ChevronRight" }}
        />

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {images.map((_, i) => (
            <IconButton
              key={i}
              onClick={() => goTo(i)}
              style={{ width: i === current ? 28 : 12 }}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
              className="relative p-0  h-3 rounded-full overflow-hidden"
              variant="secondary"
              children={
                i === current && (
                  <div
                    className="absolute inset-y-0 left-0 bg-brand-color-600 rounded-full"
                    style={{ width: `${progress * 100}%` }}
                  />
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
