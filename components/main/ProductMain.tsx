"use client";

import {
  useIntersectionAnimation,
  useIntersectionAnimationList,
} from "@/hooks/useIntersectionAnimation";
import { useProducts } from "@/hooks/useProducts";
import { useSubdomainPath } from "@/hooks/useSubdomainUrl";
import Image from "next/image";
import { useState, useEffect } from "react";

const ProductMain = () => {
  const { data: menuData = [] } = useProducts();

  const menuList = menuData
    .filter(
      (item) => item.isSignature
    )
    .slice(0, 4);

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

  // Products carousel - show 2 items on mobile
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

  
  // Keep observing so header animate in and out on scroll
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

  const headerAnimationStyle = `transform transition-all duration-700  ${isHeaderVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`;

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

  return (
    <section
      id="products-main-section"
      className="pt-20 bg-white gap-8 flex flex-col"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Products Section with Carousel */}
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
                      className="w-full bg-[#ef4501] text-white py-3 font-bold hover:bg-[#b83200] transition-colors"
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
                        className="w-full bg-[#ef4501] text-white py-2 text-sm font-bold hover:bg-[#b83200] transition-colors"
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
                        ? "bg-[#ef4501] w-8"
                        : "bg-gray-300"
                    }`}
                    aria-label={`Go to product page ${idx + 1}`}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductMain;
