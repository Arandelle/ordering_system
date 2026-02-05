import { useEffect, useRef, useState } from "react";

interface UseIntersectionAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/** 
  Hook for animating a single element whene it enters the viewport
  Perfect for  headers, sections, or single elements
*/

export const useIntersectionAnimation = (
  options: UseIntersectionAnimationOptions = {},
) => {
  const { threshold = 0.2, rootMargin = "0px", triggerOnce = true } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: elementRef, isVisible };
};

/**
 * Hook for animating multiple items (like cards in a grid)
 * Returns refs array and visibility state for each item
 */

export const useIntersectionAnimationList = <T = HTMLElement>(
  itemCount: number,
  options: UseIntersectionAnimationOptions = {},
) => {
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -50px 0px",
    triggerOnce = true,
  } = options;

  const [visibleItems, setVisibleItems] = useState<{ [key: number]: boolean }>(
    {},
  );

  const itemRefs = useRef<(T | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((item, index) => {
      if (!item) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => ({
              ...prev,
              [index]: true,
            }));

            if (triggerOnce) {
              observer.disconnect();
            }
          } else if (!triggerOnce) {
            setVisibleItems((prev) => ({
              ...prev,
              [index]: false,
            }));
          }
        },
        {
          threshold,
          rootMargin,
        },
      );

      observer.observe(item as unknown as Element);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [itemCount, threshold, rootMargin, triggerOnce]);

  return { itemRefs, visibleItems };
};
