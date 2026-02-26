"use client";

import {
  useIntersectionAnimation,
  useIntersectionAnimationList,
} from "@/hooks/useIntersectionAnimation";
import { useProducts } from "@/hooks/useProducts";
import { useSubdomainPath } from "@/hooks/useSubdomainUrl";
import { useState, useEffect } from "react";

// ── Skeleton card ────────────────────────────────────────────────────────────
const ProductCardSkeleton = () => (
  <div className="bg-white border border-gray-200 animate-pulse">
    <div className="aspect-square bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="space-y-1.5">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="h-10 bg-gray-200 rounded mt-4" />
    </div>
  </div>
);

// ── Error state ──────────────────────────────────────────────────────────────
const ProductsError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <svg
        className="w-8 h-8 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Failed to load products
    </h3>
    <p className="text-sm text-gray-500 mb-6 max-w-xs">
      We couldn't fetch our signature products right now. Please check your
      connection and try again.
    </p>
    <button
      onClick={onRetry}
      className="bg-brand-color-500 text-white px-6 py-2.5 text-sm font-bold hover:bg-brand-color-600 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const ProductMain = () => {
  const { data: menuData = [], isLoading, isError, refetch } = useProducts();

  const menuList = menuData.filter((item) => item.isSignature).slice(0, 4);

  const orderUrl = useSubdomainPath("/menu", "food");

  // Carousel state for products
  const [productIndex, setProductIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Products carousel — show 2 items on mobile
  const visibleProducts = isMobile
    ? menuList.slice(productIndex, productIndex + 2)
    : menuList;

  const nextProducts = () => {
    if (productIndex + 2 < menuList.length) {
      setProductIndex(productIndex + 2);
    }
  };

  const prevProducts = () => {
    if (productIndex > 0) {
      setProductIndex(productIndex - 2);
    }
  };

  // Intersection animations
  const { ref: headerRef, isVisible: isHeaderVisible } =
    useIntersectionAnimation({ threshold: 0.2, triggerOnce: false });

  const { itemRefs: cardRefs, visibleItems: visibleCards } =
    useIntersectionAnimationList<HTMLElement>(menuList.length, {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
      triggerOnce: false,
    });

  const { itemRefs: mobileCardRef, visibleItems: mobileVisibleCards } =
    useIntersectionAnimationList<HTMLElement>(visibleProducts.length, {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
      triggerOnce: false,
    });

  const headerAnimationStyle = `transform transition-all duration-700 ${
    isHeaderVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
  }`;

  const cardAnimationStyle = (
    index: number,
    type: "mobileVisibleCards" | "visibleCards" = "visibleCards",
  ) => {
    const visibilityMap =
      type === "mobileVisibleCards" ? mobileVisibleCards : visibleCards;

    return `transform transition-all duration-700 ${
      visibilityMap[index]
        ? "translate-y-0 opacity-100"
        : "translate-y-10 opacity-0"
    }`;
  };

  // Number of skeleton cards to render while loading
  const SKELETON_COUNT = 4;

  return (
    <section
      id="products-main-section"
      className="py-20 bg-white gap-8 flex flex-col"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-16 ${headerAnimationStyle}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            OUR SIGNATURE PRODUCTS
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our best-selling Filipino BBQ dishes, prepared fresh daily
            with premium ingredients and authentic recipes.
          </p>
        </div>

        {/* ── Error state ── */}
        {isError && !isLoading && <ProductsError onRetry={refetch} />}

        {/* ── Loading skeletons ── */}
        {isLoading && (
          <>
            {/* Desktop */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex gap-4 overflow-hidden">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[calc(50%-8px)]">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Products ── */}
        {!isLoading && !isError && (
          <div className="relative">
            {/* Desktop & Tablet: Grid */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuList.map((product, index) => (
                <div
                  key={product._id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className={`bg-white border border-gray-200 ${cardAnimationStyle(index)}`}
                  style={{
                    transitionDelay: visibleCards[index]
                      ? `${index * 100}ms`
                      : "0ms",
                  }}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex text-center">
                      <a
                        href={orderUrl}
                        className="w-full bg-brand-color-500 text-white py-3 font-bold hover:bg-brand-color-600 transition-colors"
                      >
                        Order Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: Carousel with 2 items */}
            <div className="md:hidden relative">
              <div className="flex gap-4 overflow-hidden">
                {visibleProducts.map((product, index) => (
                  <div
                    key={product._id}
                    ref={(el) => {
                      mobileCardRef.current[index] = el;
                    }}
                    className={`bg-white border border-gray-200 shrink-0 w-[calc(50%-8px)] ${cardAnimationStyle(index, "mobileVisibleCards")}`}
                    style={{
                      transitionDelay: mobileVisibleCards[index]
                        ? `${index * 100}ms`
                        : "0ms",
                    }}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image.url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-gray-900 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex text-center">
                        <a
                          href={orderUrl}
                          className="w-full bg-brand-color-500 text-white py-2 text-sm font-bold hover:bg-brand-color-600 transition-colors"
                        >
                          Order Now
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {productIndex > 0 && (
                <button
                  onClick={prevProducts}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                  aria-label="Previous products"
                >
                  <svg
                    className="w-6 h-6 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

              {productIndex + 2 < menuList.length && (
                <button
                  onClick={nextProducts}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                  aria-label="Next products"
                >
                  <svg
                    className="w-6 h-6 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.ceil(menuList.length / 2) }).map(
                  (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setProductIndex(idx * 2)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        productIndex === idx * 2
                          ? "bg-brand-color-500 w-8"
                          : "bg-gray-300"
                      }`}
                      aria-label={`Go to product page ${idx + 1}`}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductMain;
