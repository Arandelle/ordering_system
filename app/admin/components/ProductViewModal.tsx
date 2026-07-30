"use client";

import { useProduct } from "@/hooks/api/useProducts";
import { AppImage } from "@/components/AppImage";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Product } from "@/types/products";
import { cn } from "@/lib/utils";
import { FetchError } from "@/components/ui/FetchError";
import { formatCurrency, formatDate } from "@/helper/formatter";

interface ProductViewModalProps {
  productId: string;
}

/**
 * Read-only product detail content. Fetches the product by ID and renders
 * a full detail view. Used inside the @modal intercepting route (wrapped in Modal)
 * and as a standalone page for direct URL access.
 */
export default function ProductViewModal({ productId }: ProductViewModalProps) {
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <DynamicIcon
          name="Loader2"
          size={32}
          className="animate-spin text-brand-color-500"
        />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="py-10">
        <FetchError
          error={
            error instanceof Error ? error : new Error("Product not found")
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  return <ProductDetailContent product={product} />;
}

/** Pure presentational component — renders all product details. */
function ProductDetailContent({ product }: { product: Product }) {
  const statusLabel = product.isActive === false ? "Inactive" : "Active";
  const statusColor =
    product.isActive === false
      ? "bg-red-100 text-red-600"
      : "bg-green-100 text-green-600";

  return (
    <div className="space-y-8">
      {/* Image + quick stats */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 h-64 rounded-xl overflow-hidden bg-slate-50 shrink-0">
          <AppImage
            src={product.image?.url || ""}
            alt={product.name}
          />
        </div>

        <div className="flex-1 space-y-4">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                "text-xs font-bold px-2.5 py-1 rounded-full uppercase",
                statusColor,
              )}
            >
              {statusLabel}
            </span>
            {product.isComingSoon && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 uppercase">
                Coming Soon
              </span>
            )}
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 uppercase">
              {product.productType || "No Type"}
            </span>
            {product.isPopular && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 uppercase flex items-center gap-1">
                <DynamicIcon name="Flame" size={12} />
                Popular
              </span>
            )}
            {product.isSignature && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-600 uppercase flex items-center gap-1">
                <DynamicIcon name="Award" size={12} />
                Signature
              </span>
            )}
          </div>

          {/* Key details grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem
              label="Price"
              value={
                product.price !== null
                  ? formatCurrency(product.price)
                  : "Varies"
              }
            />
            <DetailItem
              label="Pax"
              value={product.paxCount ? `${product.paxCount} pax` : "—"}
            />
            <DetailItem
              label="Category"
              value={product.category?.name ?? "—"}
            />
            <DetailItem
              label="Subcategory"
              value={product.subcategory?.name ?? "None"}
            />
          </div>

          {/* Go-live date for coming-soon products */}
          {product.isComingSoon && product.goLiveDate && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <DynamicIcon name="Calendar" size={14} />
              <span>Go-live: {formatDate(product.goLiveDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info & Description */}
      {(product.info || product.description) && (
        <div className="space-y-3">
          {product.info && product.info !== "Product info is not available" && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Info
              </h4>
              <p className="text-sm text-slate-700">{product.info}</p>
            </div>
          )}
          {product.description &&
            product.description !== "Product description is not available" && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
        </div>
      )}

      {/* Active discount */}
      {product.activeProductDiscount && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            Active Discount
          </h4>
          <p className="text-sm font-medium text-emerald-800">
            {product.activeProductDiscount.name}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            {product.activeProductDiscount.label} —{" "}
            <span className="font-semibold">
              ₱{product.activeProductDiscount.discountedPrice.toFixed(2)}
            </span>{" "}
            <span className="line-through text-emerald-400">
              ₱{product.activeProductDiscount.originalPrice.toFixed(2)}
            </span>
          </p>
        </div>
      )}

      {/* Modifier groups */}
      {product.modifierGroups?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Modifier Groups ({product.modifierGroups.length})
          </h4>
          <div className="space-y-2">
            {product.modifierGroups
              .slice()
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((group) => (
                <div
                  key={group._id ?? group.name}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {group.name}
                      </span>
                      {group.isMain && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-color-100 text-brand-color-600 uppercase">
                          Main
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {group.required ? "Required" : "Optional"} ·{" "}
                      {group.minSelect}–{group.maxSelect} select
                    </span>
                  </div>
                  {group.items.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item, idx) => {
                        const productName =
                          typeof item.product === "object" && item.product
                            ? item.product.name
                            : (item.snapshotName ?? "Unknown");
                        const itemPrice =
                          typeof item.product === "object" && item.product
                            ? item.product.price
                            : item.price;

                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-xs bg-slate-50 border border-slate-100 rounded-md px-2 py-1"
                          >
                            <span className="text-slate-700">
                              {item.label ?? productName}
                            </span>
                            {itemPrice != null && (
                              <span className="text-slate-400">
                                +₱{itemPrice.toFixed(2)}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Small label + value pair used in the detail grid */
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}
