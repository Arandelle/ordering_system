"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BranchProduct } from "@/hooks/api/useBranchProductInfinite";
import { STOCK_STATUSES } from "@/types/inventory_types";
import ProductDetailModal from "./ProductDetailsModal";
import { ITEM_TYPES } from "@/types/products";
import { formatCurrency } from "@/helper/formatter/";
import { useProductReviews } from "@/hooks/api/customers/useProductReviews";
import { IconButton } from "@/components/ui/buttons";
import { AppImage } from "@/components/AppImage";
import {
  getProductBadges,
  ProductBadgeRibbon,
} from "../../helper/getProductBadges";

interface ProductCardProps {
  item: BranchProduct;
  hasBranch?: boolean;
  selectedBranch?: string;
  openBranchSelector: () => void;
}
// ── Helpers (pure, no need to live inside component) ──────────────────────────

// Discount Label
const getProductDiscountLabel = (
  discount: BranchProduct["activeProductDiscount"],
): string | null => {
  if (!discount || discount.discountAmount <= 0) return null;

  if (discount.discountType === "percentage") {
    return `${discount.discountValue}% OFF`;
  }

  return `${formatCurrency(discount.discountAmount)} OFF`;
};

// Simple slugify helper
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ─────────────────────────────────────────────────────────────────────────────

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  hasBranch,
  selectedBranch,
  openBranchSelector,
}) => {
  // Fetch product review stats with minimal data (limit=1 — we only need averageRating + totalReviews)
  const { data: reviewData } = useProductReviews(item._id, { limit: 1 });
  const averageRating = reviewData?.averageRating ?? 0;
  const totalReviews = reviewData?.totalReviews ?? 0;
  const hasReviews = totalReviews > 0 && averageRating > 0;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The id is the source of truth for matching; the slug is just for a readable URL
  const productSlug = `${item._id}-${slugify(item.name)}`;

  // ── Derived state: product type (needed before openDetail) ─────────────────
  const isNonSolo =
    item.productType !== ITEM_TYPES.SOLO && item.productType != null;

  // Combo/set products open in a dedicated page; solo products use the modal
  const openDetail = () => {
    if (isNonSolo) {
      router.push(`/products/${item._id}`);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("product", productSlug);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  // Modal is open only for solo products when the URL's product param matches this item's id
  const showDetail = !isNonSolo && searchParams.get("product") === productSlug;

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("product");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // ── Derived state (remaining) ──────────────────────────────────────────────
  // Stock info is only meaningful when a branch is selected
  const quantity = hasBranch ? (item.quantity ?? 0) : null;
  const status = hasBranch ? (item.status ?? "") : "";
  const isOutOfStock = Boolean(
    hasBranch &&
    (status === STOCK_STATUSES.OUT_OF_STOCK || (quantity ?? 1) <= 0),
  );
  const isComingSoon = item.isComingSoon === true;
  const badges = getProductBadges({
    isPopular: item.isPopular,
    isComingSoon,
    status: hasBranch ? status : "",
    quantity,
    goLiveDate: item.goLiveDate,
    createdAt: item.createdAt,
  });
  const activeProductDiscount = item.activeProductDiscount;
  const hasProductDiscount =
    Boolean(activeProductDiscount) && activeProductDiscount!.discountAmount > 0;
  const displayPrice = hasProductDiscount
    ? activeProductDiscount!.discountedPrice
    : item.price;
  const productDiscountLabel = getProductDiscountLabel(activeProductDiscount);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative h-full">
      <div
        role={isOutOfStock || isComingSoon ? undefined : "button"}
        tabIndex={isOutOfStock || isComingSoon ? undefined : 0}
        onClick={() => {
          if (!isOutOfStock && !isComingSoon) openDetail();
        }}
        onKeyDown={(e) => {
          if (
            (e.key === "Enter" || e.key === " ") &&
            !isOutOfStock &&
            !isComingSoon
          ) {
            e.preventDefault();
            openDetail();
          }
        }}
        className={`group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-color-500 hover:shadow-md ${
          isOutOfStock || isComingSoon ? "opacity-70" : "cursor-pointer"
        }`}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-white relative flex items-center justify-center">
          <AppImage src={item.image.url} alt={item.name} />

          {(isOutOfStock || isComingSoon) && (
            <div className="absolute inset-0 bg-black/10 z-10" />
          )}

          {/* Product badges — ribbon style, flush left */}
          {badges.length > 0 && (
            <div className="absolute left-0 top-0 z-20 flex flex-col gap-2">
              {badges.map((badge) => (
                <ProductBadgeRibbon key={badge.label} badge={badge} />
              ))}
            </div>
          )}

          {hasProductDiscount && productDiscountLabel && (
            <div className="absolute bottom-3 left-3 z-10 flex flex-col items-start gap-1">
              <span className="rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                {productDiscountLabel}
              </span>
            </div>
          )}
        </div>

        {/** Content */}
        <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-gray-900 md:text-base">
            {item.name}
          </h3>

          {item.description && (
            <p className="line-clamp-3 text-xs leading-5 text-gray-500">
              {item.description}
            </p>
          )}

          {/* Dynamic product rating from reviews */}
          {hasReviews && (
            <div>
              <div className="group/review absolute top-1 left-1">
                <IconButton
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/products/${item._id}/reviews`);
                  }}
                  title={`View ${totalReviews} reviews for ${item.name}`}
                  aria-label={`View ${totalReviews} reviews for ${item.name}`}
                  icon={{
                    name: "Star",
                    className:
                      "fill-yellow-500 text-yellow-500 group-hover/review:fill-brand-color-500 group-hover/review:text-brand-color-500",
                  }}
                  variant="ghost"
                  text={String(averageRating)}
                  className="text-[11px] rounded-full"
                />
              </div>
            </div>
          )}
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <div className="min-w-0">
              <span className="block text-base font-semibold leading-none text-slate-900 md:text-lg">
                {formatCurrency(displayPrice)}
              </span>

              {hasProductDiscount &&
                item.price != null &&
                activeProductDiscount && (
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[11px] text-gray-400 line-through">
                      {formatCurrency(item.price)}
                    </span>
                    <span className="text-[11px] font-semibold text-green-600">
                      Save{" "}
                      {formatCurrency(activeProductDiscount.discountAmount)}
                    </span>
                  </div>
                )}
            </div>
            <IconButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDetail();
              }}
              disabled={isOutOfStock || isComingSoon}
              aria-label={
                isComingSoon
                  ? `${item.name} — coming soon`
                  : `Add ${item.name} to cart`
              }
              icon={{ name: isComingSoon ? "Clock" : "ShoppingBag", size: 16 }}
              className="rounded-full"
            />
          </div>
        </div>
      </div>

      {showDetail && (
        <ProductDetailModal
          item={item}
          reviews={{ totalReviews, averageRating }}
          selectedBranch={selectedBranch}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ProductCard;
