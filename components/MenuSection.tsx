"use client";

import { categories, menuData } from "@/data/menuData";
import { MenuItem } from "@/types/MenuTypes";
import { Search, SlidersHorizontal, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";

const MenuSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "default" | "price-low" | "price-high" | "name"
  >("default");

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  const headerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // convert menuData object into flattened array
  const allItems: MenuItem[] = Object.entries(menuData).flatMap(
    ([category, items]) =>
      items.map((item) => ({
        ...item,
        category,
      })),
  );

  const filteredItems = allItems
    .filter((item) => {
      // Category filter
      if (activeCategory === "All") return true;
      if (activeCategory === "Best Sellers") return item.isBestSeller;
      return item.category === activeCategory;
    })
    .filter((item) => {
      // Search filter
      if (!searchQuery) return true;
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  /** Animate header and filters when component mounts or becomes visible */
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    if (headerRef.current) observer.observe(headerRef.current);
    if (filtersRef.current) observer.observe(filtersRef.current);

    return () => observer.disconnect();
  }, []);

  /** Observe product cards individually */
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "50px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(
            entry.target.getAttribute("data-index") || "0",
          );
          setVisibleItems((prev) => new Set([...prev, index]));
        }
      });
    }, observerOptions);

    const cards = document.querySelectorAll(".product-card-wrapper");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredItems]); // Re-run when filtered items change

  const handleChangeCategory = (category: string) => {
    setActiveCategory(category);
    setVisibleItems(new Set()); // Reset visible items when category changes
  };

  return (
    <section id="menu-section" className="py-4 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/** Section Header */}
        <div
          ref={headerRef}
          className="text-center mb-12 opacity-0 transition-all duration-700"
        >
          <p className="text-[#e13e00] font-semibold text-xl uppercase tracking-widest">
            Our Menu
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Mga Paboritong Putahe
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From our signature Chicken Inasal to mouthwatering BBQ, every dish
            is grilled with love and tradition.
          </p>
        </div>

        {/** Filters bar */}
        <div
          ref={filtersRef}
          className="flex flex-col items-start lg:flex-row gap-4 mb-8 opacity-0 transition-all duration-700 delay-100"
        >
          {/** Category Pills */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleChangeCategory(category.title)}
                className={`px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.title
                    ? "bg-[#e13e00] text-white shadow-lg shadow-[#e13e00]/30"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>

          {/** Search and sort */}
          <div className="flex gap-3 lg:ml-auto">
            {/** Search */}
            <div className="relative flex-1 lg:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              />
              <input
                type="text"
                placeholder="Search Menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-gray-600 w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border=[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/** Sort dropdown */}
            <div className="relative text-gray-600">
              <select
                name=""
                id=""
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#e13e00] focus:ring-2 focus:ring-[#e13e00]/20 outline-none transition-all cursor-pointer"
              >
                <option value="default">Sort By: </option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
              <SlidersHorizontal
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/** Results count*/}
        <div className="text-gray-500 text-sm">
          Showing {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "item" : "items"}
          {activeCategory !== "All" && ` in ${activeCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/** Product Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                data-index={index}
                className={`product-card-wrapper h-full transition-all duration-500 ${
                  visibleItems.has(index)
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${(index % 12) * 50}ms` }}
              >
                <ProductCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-300 mb-4">
              <Search size={25} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No product found
            </h3>
            <p className="text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
};

export default MenuSection;
