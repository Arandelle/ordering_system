"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { useScrollToSection } from "@/hooks/utils/useScrollToSection";
import { Category } from "@/types/category";
import { useMenuCategories } from "@/app/main/components/CategoryCarousel";
import {
  BranchProduct,
  useBranchProductInfinite,
} from "@/hooks/api/useBranchProductInfinite";
import { useBranch } from "@/contexts/BranchContext";
import PromoBanner from "./PromoBanner";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Product } from "@/types/products";
import { useProductsInfinite } from "@/hooks/api/useInfiniteProducts";
import { useDiscountedProducts } from "@/hooks/api/useDiscountedProducts";
import { FetchError } from "@/components/ui/FetchError";
import { trackSearch } from "@/lib/metaPixel";
import { IconButton } from "@/components/ui/buttons";
import { SelectField } from "@/components/ui/FormComponents";

// ─── Types ────────────────────────────────────────────────────────────────────

type MenuProduct = BranchProduct | Product;

interface SubcategoryGroup {
  subcategoryName: string | null;
  items: MenuProduct[];
}

interface CategoryGroup {
  categoryName: string;
  subcategoryGroups: SubcategoryGroup[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasActiveProductDiscount(product: MenuProduct) {
  return Boolean(
    product.activeProductDiscount &&
    product.activeProductDiscount.discountAmount > 0,
  );
}

function sortDiscountedProductsFirst(products: MenuProduct[]) {
  return [...products].sort((left, right) => {
    const leftHasDiscount = hasActiveProductDiscount(left);
    const rightHasDiscount = hasActiveProductDiscount(right);

    if (leftHasDiscount === rightHasDiscount) return 0;
    return leftHasDiscount ? -1 : 1;
  });
}

function groupProducts(products: MenuProduct[]): CategoryGroup[] {
  const categoryMap = new Map<string, Map<string | null, MenuProduct[]>>();

  for (const product of products) {
    const catName = product.category?.name ?? "Uncategorized";
    const subName = product.subcategory?.name ?? null;

    if (!categoryMap.has(catName)) categoryMap.set(catName, new Map());
    const subMap = categoryMap.get(catName)!;
    if (!subMap.has(subName)) subMap.set(subName, []);
    subMap.get(subName)!.push(product);
  }

  return Array.from(categoryMap.entries()).map(([categoryName, subMap]) => ({
    categoryName,
    subcategoryGroups: Array.from(subMap.entries()).map(
      ([subcategoryName, items]) => ({
        subcategoryName,
        items: sortDiscountedProductsFirst(items),
      }),
    ),
  }));
}

// ─── Component ────────────────────────────────────────────────────────────

const MenuSection = () => {
  const { selectedBranch, openBranchSelector } = useBranch();
  const branchId = selectedBranch?._id;

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null,
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showOnlineExclusive, setShowOnlineExclusive] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryInitialized = useRef(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null); // for IntersectionObserver

  // Only pass real categories to the API (exclude pseudo-categories)
  const isRealCategory =
    activeCategory !== "All" &&
    activeCategory !== "__coming_soon__" &&
    activeCategory !== "__online_exclusive__";

  // Always fetch all products (for no-branch browsing)
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isAllLoading,
    isError: isAllError,
    refetch: refetchAll,
    error: allError,
  } = useProductsInfinite({
    limit: 20,
    categoryName: isRealCategory ? activeCategory : undefined,
    subcategoryName: activeSubcategory ?? undefined,
    activeOnly: true,
    isComingSoon: "false",
    enabled: !branchId && !showComingSoon && !showOnlineExclusive,
  });

  const allProducts = infiniteData?.pages.flatMap((p) => p.data) ?? [];

  // Fetch branch products only when branch is selected
  const {
    data: branchInfiniteData,
    fetchNextPage: fetchNextBranchPage,
    hasNextPage: hasBranchNextPage,
    isFetchingNextPage: isFetchingNextBranchPage,
    isLoading: isBranchLoading,
    isError: isBranchError,
    refetch: refetchBranch,
    error: branchError,
  } = useBranchProductInfinite(branchId ?? "", {
    limit: 20,
    categoryName: isRealCategory ? activeCategory : undefined,
    subcategoryName: activeSubcategory ?? undefined,
    isComingSoon: "false",
    enabled: !!branchId && !showComingSoon && !showOnlineExclusive,
  });

  const branchProducts = branchInfiniteData?.pages.flatMap((p) => p.data) ?? [];

  // Fetch coming soon products separately when the Coming Soon view is active
  const {
    data: csInfiniteData,
    isLoading: isCsAllLoading,
  } = useProductsInfinite({
    limit: 50,
    activeOnly: true,
    isComingSoon: "true",
    enabled: !branchId && showComingSoon,
  });
  const {
    data: csBranchData,
    isLoading: isCsBranchLoading,
  } = useBranchProductInfinite(branchId ?? "", {
    limit: 50,
    isComingSoon: "true",
    enabled: !!branchId && showComingSoon,
  });
  const comingSoonProducts = useMemo(() => {
    const pages = branchId
      ? csBranchData?.pages.flatMap((p) => p.data)
      : csInfiniteData?.pages.flatMap((p) => p.data);
    return pages ?? [];
  }, [branchId, csBranchData, csInfiniteData]);

  // Fetch online-exclusive products when the Online Exclusive view is active
  const {
    data: oeInfiniteData,
    isLoading: isOeAllLoading,
  } = useProductsInfinite({
    limit: 50,
    activeOnly: true,
    isOnlineExclusive: "true",
    enabled: !branchId && showOnlineExclusive,
  });
  const {
    data: oeBranchData,
    isLoading: isOeBranchLoading,
  } = useBranchProductInfinite(branchId ?? "", {
    limit: 50,
    isOnlineExclusive: "true",
    enabled: !!branchId && showOnlineExclusive,
  });
  const onlineExclusiveProducts = useMemo(() => {
    const pages = branchId
      ? oeBranchData?.pages.flatMap((p) => p.data)
      : oeInfiniteData?.pages.flatMap((p) => p.data);
    return pages ?? [];
  }, [branchId, oeBranchData, oeInfiniteData]);

  const {
    data: discountedProductsData,
    fetchNextPage: fetchNextDiscountedPage,
    hasNextPage: hasMoreDiscountedProducts,
    isFetchingNextPage: isFetchingNextDiscountedPage,
  } = useDiscountedProducts({
    branchId,
    limit: 8,
    enabled: true,
  });
  const discountedProducts =
    discountedProductsData?.pages.flatMap((page) => page.data) ?? [];

  // Use branch products if available, otherwise fall back to all products
  const dynamicProducts = branchId ? (branchProducts ?? []) : allProducts;
  const isLoading = branchId ? isBranchLoading : isAllLoading;
  const isError = branchId ? isBranchError : isAllError;
  const refetch = branchId ? refetchBranch : refetchAll;
  const error = branchId ? branchError : allError;

  useScrollToSection();

  const {
    data: categories,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useMenuCategories();

  // Hide categories that have no live (non-coming-soon) products
  const visibleCategories = (categories ?? []).filter(
    (cat: Category) => (cat.activeProductCount ?? 0) > 0,
  );

  // Total coming soon count from server — covers all products, not just loaded pages
  const totalComingSoon = (categories ?? []).reduce(
    (sum: number, cat: Category) => sum + (cat.comingSoonCount ?? 0),
    0,
  );

  // Total online-exclusive count from server
  const totalOnlineExclusive = (categories ?? []).reduce(
    (sum: number, cat: Category) => sum + (cat.onlineExclusiveCount ?? 0),
    0,
  ); 

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!entries[0].isIntersecting) return;

      if (branchId) {
        if (hasBranchNextPage && !isFetchingNextBranchPage)
          fetchNextBranchPage();
      } else {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }
    },
    [
      branchId,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      hasBranchNextPage,
      isFetchingNextBranchPage,
      fetchNextBranchPage,
      allProducts,
      branchProducts,
    ],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "200px 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Restore active category from URL query param on initial load
  useEffect(() => {
    if (categoryInitialized.current) return;
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl);
      setExpandedCategories(new Set([categoryFromUrl]));
    }
    categoryInitialized.current = true;
  }, [searchParams]);

  // ── Filter + group ──────────────────────────────────────────────────────────

  // ── Branch-side client filtering (branch products still filtered locally) ──
  const filteredProducts = branchId
    ? dynamicProducts.filter((p) => {
        if (isRealCategory && p.category?.name !== activeCategory)
          return false;
        if (
          activeSubcategory &&
          (p.subcategory?.name ?? null) !== activeSubcategory
        )
          return false;
        return true;
      })
    : dynamicProducts; // already filtered server-side for non-branch

  // Show all products (including coming soon) under their categories
  const groupedItems = groupProducts(filteredProducts);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const scrollToContent = () => {
    if (!contentRef.current) return;
    const top =
      contentRef.current.getBoundingClientRect().top + window.scrollY - 200;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleSelectCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    setActiveSubcategory(null);
    setShowComingSoon(false);
    setShowOnlineExclusive(false);
    scrollToContent();
    trackSearch({ search_string: categoryName });

    // Sync category to URL so refresh/back lands on the same view
    const params = new URLSearchParams(window.location.search);
    if (categoryName === "All" || categoryName === "__coming_soon__" || categoryName === "__online_exclusive__") {
      params.delete("category");
    } else {
      params.set("category", categoryName);
    }
    router.replace(`?${params.toString()}`, { scroll: false });

    if (categoryName === "All") {
      setExpandedCategories(new Set());
    } else if (categoryName === "__coming_soon__") {
      setShowComingSoon(true);
    } else if (categoryName === "__online_exclusive__") {
      setShowOnlineExclusive(true);
    } else {
      setExpandedCategories((prev) => {
        const next = new Set<string>();
        if (!prev.has(categoryName)) next.add(categoryName);
        return next;
      });
    }
  };

  const handleSelectSubcategory = (subcategoryName: string | null) => {
    setActiveSubcategory(subcategoryName);
    scrollToContent();
    if (subcategoryName) {
      trackSearch({ search_string: `${activeCategory} - ${subcategoryName}` });
    }
  };

  const getSubcategoriesForCategory = (categoryName: string): string[] => {
    const subs = new Set<string>();
    // For branch mode, derive from local data; for server mode, from loaded pages
    dynamicProducts
      .filter((p) => p.category?.name === categoryName)
      .forEach((p) => {
        if (p.subcategory?.name) subs.add(p.subcategory.name);
      });
    return Array.from(subs);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  let globalIndex = 0;

  const ProductGrid = ({ items }: { items: MenuProduct[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-4 md:gap-5">
      {items.map((item, indexItem) => {
        const index = globalIndex++;
        return (
          <div
            key={index || indexItem}
            data-index={index}
            id={item._id}
            className="product-card-wrapper h-full transition-all duration-500"
            style={{ transitionDelay: `${(index % 8) * 60}ms` }}
          >
            <ProductCard
              item={item as BranchProduct}
              hasBranch={!!branchId}
              selectedBranch={selectedBranch?._id}
              openBranchSelector={openBranchSelector}
            />
          </div>
        );
      })}
    </div>
  );

  const DiscountedProductsShelf = () => {
    if (discountedProducts.length === 0) return null;

    return (
      <section className="">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">
              Limited-time offers
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Discounted Items
            </h2>
          </div>
        </div>
        <ProductGrid items={discountedProducts} />
        {hasMoreDiscountedProducts && (
          <IconButton
            onClick={() => fetchNextDiscountedPage()}
            disabled={isFetchingNextDiscountedPage}
            variant="outline"
            text={isFetchingNextDiscountedPage ? "Loading..." : "See more"}
            isLoading={isFetchingNextDiscountedPage}
            className="shrink-0 rounded-full border-brand-color-200 text-brand-color-700 hover:bg-brand-color-100"
          />
        )}
      </section>
    );
  };

  const ComingSoonView = () => {
    const csLoading = branchId ? isCsBranchLoading : isCsAllLoading;
    if (csLoading && comingSoonProducts.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="inline-block animate-spin mb-4">
            <div className="h-8 w-8 border-4 border-gray-200 border-t-brand-color-500 rounded-full" />
          </div>
          <h3 className="text-base font-semibold text-black mb-1">
            Loading coming soon items...
          </h3>
        </div>
      );
    }
    if (comingSoonProducts.length === 0) {
      return (
        <div className="text-center py-16">
          <DynamicIcon name="Clock" size={40} className="mx-auto text-blue-300 mb-4" />
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            No coming soon items
          </h3>
          <p className="text-sm text-gray-400">
            There are no coming soon items right now.
          </p>
          <IconButton
            onClick={() => setShowComingSoon(false)}
            variant="primary"
            className="mt-4 rounded-full px-5 py-2"
            text="View Live Menu"
          />
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <DynamicIcon name="Clock" size={20} className="text-blue-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Coming Soon</h2>
            <p className="text-xs text-gray-500">
              These items aren't available yet — check back soon!
            </p>
          </div>
        </div>
        <ProductGrid items={comingSoonProducts} />
      </div>
    );
  };

  const OnlineExclusiveView = () => {
    const oeLoading = branchId ? isOeBranchLoading : isOeAllLoading;
    if (oeLoading && onlineExclusiveProducts.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="inline-block animate-spin mb-4">
            <div className="h-8 w-8 border-4 border-gray-200 border-t-brand-color-500 rounded-full" />
          </div>
          <h3 className="text-base font-semibold text-black mb-1">
            Loading online exclusive items...
          </h3>
        </div>
      );
    }
    if (onlineExclusiveProducts.length === 0) {
      return (
        <div className="text-center py-16">
          <DynamicIcon name="Globe" size={40} className="mx-auto text-violet-300 mb-4" />
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            No online exclusive items
          </h3>
          <p className="text-sm text-gray-400">
            There are no online exclusive items right now.
          </p>
          <IconButton
            onClick={() => setShowOnlineExclusive(false)}
            variant="primary"
            className="mt-4 rounded-full px-5 py-2"
            text="View Live Menu"
          />
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <DynamicIcon name="Globe" size={20} className="text-violet-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Online Exclusive</h2>
            <p className="text-xs text-gray-500">
              These items are only available when ordering online!
            </p>
          </div>
        </div>
        <ProductGrid items={onlineExclusiveProducts} />
      </div>
    );
  };

  const GroupedContent = () => (
    <>
      {showComingSoon ? (
        <ComingSoonView />
      ) : showOnlineExclusive ? (
        <OnlineExclusiveView />
      ) : groupedItems.length > 0 || discountedProducts.length > 0 ? (
        <div className="space-y-12">
          {activeCategory === "All" && <DiscountedProductsShelf />}

          {groupedItems.map(({ categoryName, subcategoryGroups }) => (
            <div key={categoryName}>
              {activeCategory === "All" && (
                <div className="mb-7">
                  <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
                    {categoryName}
                  </h2>
                  <div className="w-8 h-0.5 bg-brand-color-500 mt-3 rounded-full" />
                </div>
              )}

              <div className="space-y-9">
                {subcategoryGroups.map(({ subcategoryName, items }) => (
                  <div key={subcategoryName ?? "__none__"}>
                    {subcategoryName && (
                      <div className="flex items-center gap-3 mb-5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 shrink-0">
                          {subcategoryName}
                        </h3>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}
                    <ProductGrid items={items} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ── Infinite scroll sentinel ─────────────────────────────── */}
          <div ref={sentinelRef} className="py-4 flex justify-center">
            {(isFetchingNextPage || isFetchingNextBranchPage) && (
              <div className="flex flex-col items-center gap-2">
                <div className="inline-block animate-spin">
                  <div className="h-6 w-6 border-4 border-gray-200 border-t-brand-color-500 rounded-full" />
                </div>
                <h3>Finding best product for you..</h3>
              </div>
            )}
            {branchId && !hasBranchNextPage && branchProducts.length > 0 && (
              <p className="text-xs text-gray-400">You've seen everything!</p>
            )}
            {!branchId && !hasNextPage && allProducts.length > 0 && (
              <p className="text-xs text-gray-400">You've seen everything!</p>
            )}
          </div>
        </div>
      ) : isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin mb-4">
            <div className="h-8 w-8 border-4 border-gray-200 border-t-brand-color-500 rounded-full" />
          </div>
          <h3 className="text-base font-semibold text-black mb-1">
            Loading products...
          </h3>
        </div>
      ) : isError ? (
        <FetchError
          onRetry={refetch}
          error={error}
          title="Failed to load products"
          description="Our menu couldn't be fetched right now. Please try again."
        />
      ) : (
        <FetchError
          onRetry={refetch}
          error={{ message: "No products found", name: "Product not found" }}
          title="Try a different category"
          description="Our menu couldn't be fetched right now. Please try again."
        />
      )}
    </>
  );

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <section id="menu-section" className="bg-white scroll-mt-24">
      <PromoBanner type="single" />
      {/* ══════════════════════════════════════════════
          MOBILE — horizontal pill bar + content
      ══════════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Sticky pill bar */}
        <div className="sticky top-18 z-30 bg-white border-b border-gray-100 pt-8 pb-2">
          {/* Category pills + Coming Soon toggle */}
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 items-center">
            <SelectField
              value={activeCategory}
              onChange={(e) => handleSelectCategory(e.target.value)}
              disabled={isCategoriesPending || isCategoriesError}
              options={[
                {
                  label: "Choose Category",
                  value: "__placeholder",
                  disabled: true,
                },
                isCategoriesPending
                  ? { label: "Loading Categories...", value: "__loading" }
                  : isCategoriesError
                    ? { label: "Failed to load categories", value: "__error" }
                    : { label: "All Categories", value: "All" },

                ...(totalComingSoon > 0
                  ? [{ label: "Coming Soon", value: "__coming_soon__" }]
                  : []),

                ...(totalOnlineExclusive > 0
                  ? [{ label: "Online Exclusive", value: "__online_exclusive__" }]
                  : []),

                ...visibleCategories.map((cat: Category) => ({
                  label: cat.name,
                  value: cat.name,
                })),
              ]}
            />
          </div>

          {/* Subcategory pills (only when a real category is selected) */}
          {activeCategory !== "All" && activeCategory !== "__coming_soon__" && activeCategory !== "__online_exclusive__" &&
            (() => {
              const subs = getSubcategoriesForCategory(activeCategory);
              if (subs.length === 0) return null;
              return (
                <div className="flex gap-2 overflow-x-auto scrollbar-thin pt-4">
                  <IconButton
                    onClick={() => handleSelectSubcategory(null)}
                    variant="secondary"
                    className={`text-black text-nowrap px-3 rounded-full text-xs font-semibold ${activeSubcategory === null ? "bg-gray-900 text-white" : ""}`}
                    text="All"
                  />
                  {subs.map((sub) => (
                    <IconButton
                      key={sub}
                      onClick={() => handleSelectSubcategory(sub)}
                      variant="secondary"
                      className={`text-black text-nowrap px-3 rounded-full text-xs font-semibold ${activeSubcategory === sub ? "bg-gray-900 text-white" : ""}`}
                      text={sub}
                    />
                  ))}
                </div>
              );
            })()}
        </div>

        {/* Mobile product content */}
        <div className="px-4 py-6">
          <GroupedContent />
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP — sticky sidebar + content
      ══════════════════════════════════════════════ */}
      <div className="hidden lg:flex max-w-360 mx-auto gap-8 py-8 relative mt-12">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 sticky top-52 self-start max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
          <div className="space-y-2 pr-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pb-3">
              Browse Menu
            </p>
            {/* All */}
            <IconButton
              onClick={() => handleSelectCategory("All")}
              variant={activeCategory === "All" && !showComingSoon && !showOnlineExclusive ? "primary" : "ghost"}
              text="All Categories"
              className="w-full rounded-xl p-3 justify-start"
            />

            {/* Coming Soon toggle */}
            {totalComingSoon > 0 && (
              <IconButton
                onClick={() => {
                  if (showComingSoon) {
                    handleSelectCategory("All");
                  } else {
                    setActiveCategory("__coming_soon__");
                    setActiveSubcategory(null);
                    setShowComingSoon(true);
                    scrollToContent();
                  }
                }}
                className={`w-full justify-start p-3 rounded-xl ${
                  showComingSoon
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                    : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                }`}
                icon={{ name: "Clock" }}
                text={`Coming Soon (${totalComingSoon})`}
              />
            )}

            {/* Online Exclusive toggle */}
            {totalOnlineExclusive > 0 && (
              <IconButton
                onClick={() => {
                  if (showOnlineExclusive) {
                    handleSelectCategory("All");
                  } else {
                    setActiveCategory("__online_exclusive__");
                    setActiveSubcategory(null);
                    setShowOnlineExclusive(true);
                    scrollToContent();
                  }
                }}
                className={`w-full justify-start p-3 rounded-xl ${
                  showOnlineExclusive
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                    : "text-green-600 bg-green-50 hover:bg-green-100"
                }`}
                icon={{ name: "Globe" }}
                text={`Online Exclusive (${totalOnlineExclusive})`}
              />
            )}

            {/* Skeletons */}
            {isCategoriesPending &&
              [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}

            {/* Error */}
            {isCategoriesError && !isCategoriesPending && (
              <div className="px-3 py-2 text-xs text-red-500">
                Failed to load.{" "}
                <IconButton
                  onClick={() => refetchCategories()}
                  variant="underline"
                  text="Retry"
                />
              </div>
            )}

            {/* Categories */}
            {!isCategoriesPending &&
              !isCategoriesError &&
              visibleCategories.map((cat: Category) => {
                const isActive = activeCategory === cat.name;
                const isExpanded = expandedCategories.has(cat.name);
                const subcategories = getSubcategoriesForCategory(cat.name);
                const hasSubcategories = subcategories.length > 0;

                return (
                  <div key={cat._id}>
                    <div>
                      <IconButton
                        onClick={() => handleSelectCategory(cat.name)}
                        variant={isActive ? "primary" : "ghost"}
                        className="w-full p-3 justify-start rounded-xl"
                        icon={{
                          name: hasSubcategories ? "ChevronDown" : null,
                          className: isExpanded
                            ? "rotate-180"
                            : isActive
                              ? "text-white/70"
                              : "",
                        }}
                        text={cat.name}
                      />
                    </div>

                    {/* Subcategory list */}
                    {hasSubcategories && isExpanded && (
                      <div className="ml-3 my-2 border-l-2 border-gray-100 pl-3 space-y-2">
                        <IconButton
                          onClick={() => handleSelectSubcategory(null)}
                          variant="ghost"
                          text="All"
                          className={`w-full justify-start py-1.5 px-3 rounded-lg ${activeSubcategory === null && "bg-brand-color-500/10 text-brand-color-500"}`}
                        />
                        {subcategories.map((sub) => (
                          <IconButton
                            key={sub}
                            onClick={() => handleSelectSubcategory(sub)}
                            variant="ghost"
                            text={sub}
                            className={`w-full justify-start py-1.5 px-3 rounded-lg ${activeSubcategory === sub && "bg-brand-color-500/10 text-brand-color-500"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </aside>

        {/* Content */}
        <div ref={contentRef} className="flex-1 min-w-0">
          <GroupedContent />
        </div>
      </div>

      {/** Used to style the scroll bar on mobile */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 9999px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #d1d5db;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }
      `}</style>
    </section>
  );
};

export default MenuSection;
