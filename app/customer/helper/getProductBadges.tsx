import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";
import { STOCK_STATUSES } from "@/types/inventory_types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProductBadge {
  label: string;
  bg: string;
  icon: string;
}

export interface ProductBadgeOptions {
  isPopular?: boolean;
  isComingSoon?: boolean;
  status?: string;
  quantity?: number | null;
  goLiveDate?: string | null;
  createdAt?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

/** Ribbon clip-path — flat left edge, pennant notch on the right */
const RIBBON_CLIP = {
  clipPath: "polygon(0 0, 100% 0, 97% 50%, 100% 100%, 0 100%)",
};

/** Number of days a product is considered "new" after going live */
const NEW_BADGE_MS = 15 * 24 * 60 * 60 * 1000;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the product is within the NEW badge window.
 * Uses goLiveDate if set (scheduled launch), otherwise falls back to createdAt.
 * Coming soon products are never "new" — they haven't launched yet.
 */
export const isNewProduct = (
  goLiveDate: string | null | undefined,
  createdAt: string | undefined,
  isComingSoon: boolean,
): boolean => {
  if (isComingSoon) return false;
  const referenceDate = goLiveDate || createdAt;
  if (!referenceDate) return false;
  const refTime = new Date(referenceDate).getTime();
  if (isNaN(refTime)) return false;
  const ageMs = Date.now() - refTime;
  return ageMs >= 0 && ageMs <= NEW_BADGE_MS;
};

/**
 * Returns all applicable badges for a product, ordered by priority.
 * "NEW" can coexist with a status badge; status badges are mutually exclusive.
 *
 * Status badges are derived from the raw stock `status` string + `quantity`,
 * so callers don't need to pre-compute isOutOfStock / isLowStock booleans.
 */
export const getProductBadges = (opts: ProductBadgeOptions): ProductBadge[] => {
  const {
    isPopular = false,
    isComingSoon = false,
    status = "",
    quantity = null,
    goLiveDate,
    createdAt,
  } = opts;

  const badges: ProductBadge[] = [];
  const isNew = isNewProduct(goLiveDate, createdAt, isComingSoon);

  // "NEW" can coexist with any status badge
  if (isNew) {
    badges.push({ label: "NEW!", bg: "bg-brand-color-500", icon: "Flame" });
  }

  // Status badges — mutually exclusive, ordered by priority
  if (isComingSoon) {
    badges.push({ label: "Coming Soon", bg: "bg-blue-500", icon: "Clock" });
  } else if (
    status === STOCK_STATUSES.OUT_OF_STOCK ||
    (quantity != null && quantity <= 0)
  ) {
    badges.push({ label: "Out of stock", bg: "bg-red-500", icon: "Ban" });
  } else if (status === STOCK_STATUSES.LOW_STOCK) {
    badges.push({
      label: `${quantity} left`,
      bg: "bg-amber-500",
      icon: "ChevronsDown",
    });
  } else if (isPopular) {
    badges.push({
      label: "Best Seller",
      bg: "bg-brand-color-500",
      icon: "TrendingUp",
    });
  }

  return badges;
};

// ── Components ───────────────────────────────────────────────────────────────

export const ProductBadgeRibbon = ({ badge }: { badge: ProductBadge }) => (
  <div
    style={RIBBON_CLIP}
    className={cn(
      `flex items-center gap-1.5 pl-3 pr-5 py-1.5 text-[11px] font-bold text-white`,
      badge.bg,
    )}
  >
    <DynamicIcon name={badge.icon} size={12} />
    <span>{badge.label}</span>
  </div>
);
