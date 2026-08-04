import { getDistanceMeters } from "./deliveryArea";
import { roundMoney } from "./money";

type Coordinates = {
  lat: number;
  lng: number;
};

export type BranchGeoJsonCoordinates = [number, number];

export type DeliveryFeeEstimate = {
  distanceKm: number; // distance from branch to delivery location, in km
  billableKm: number; // rounded up distance used for billing
  deliveryFee: number; // calculated delivery fee based on billable distance
};

export type EffectiveDeliveryFee = DeliveryFeeEstimate & {
  freeDeliveryEligible: boolean; // whether free delivery applies based on subtotal and distance
  effectiveDeliveryFee: number;  // actual fee charged (0 if free delivery, otherwise the calculated fee)
  freeDeliveryReason?: string;   // why free delivery does not apply (if not eligible)
};

/**
 * Free delivery configuration from global settings.
 * Pass this to resolveEffectiveDeliveryFee / isFreeDeliveryEligible
 * instead of relying on env vars.
 */
export type FreeDeliveryConfig = {
  freeDeliveryEnabled: boolean;
  freeDeliveryMinimumPurchase: number;
  freeDeliveryMaxDistanceKm: number;
};

/**
 * Branch-level delivery context for area-based free delivery.
 * Barangay code match bypasses minimum purchase and distance checks entirely.
 * deliveryRadiusKm overrides the global max distance when set.
 */
export type BranchDeliveryContext = {
  barangayCode: string;
  deliveryRadiusKm: number | null;
};

/**
 * Customer delivery context for area-based free delivery.
 */
export type CustomerDeliveryContext = {
  barangayCode?: string;
};

const BASE_DELIVERY_FARE = 65;
const FIRST_TIER_KM = 5;
const FIRST_TIER_RATE = 10;
const EXCESS_TIER_RATE = 8;

// Legacy defaults — used when no FreeDeliveryConfig is passed (backward compat).
// These will be replaced by Settings values from the database.
export const FREE_DELIVERY_MINIMUM_PURCHASE = 549;
export const FREE_DELIVERY_MAX_DISTANCE_KM = 5;
export const FREE_DELIVERY_ENABLED =
  process.env.NEXT_PUBLIC_FREE_DELIVERY_ENABLED !== "false";

/** Resolves the active free delivery config — DB settings override env defaults. */
const resolveConfig = (config?: FreeDeliveryConfig) => ({
  enabled: config?.freeDeliveryEnabled ?? FREE_DELIVERY_ENABLED,
  minimumPurchase: config?.freeDeliveryMinimumPurchase ?? FREE_DELIVERY_MINIMUM_PURCHASE,
  maxDistanceKm: config?.freeDeliveryMaxDistanceKm ?? FREE_DELIVERY_MAX_DISTANCE_KM,
});

/**
 * Barangay code match — the customer is in the same barangay as the branch.
 * PSGC codes are unique identifiers so exact comparison is sufficient.
 * This is the strongest signal: free delivery with no minimum purchase or distance check.
 */
const isBarangayMatch = (
  branch?: BranchDeliveryContext,
  customer?: CustomerDeliveryContext,
): boolean => {
  if (!branch?.barangayCode || !customer?.barangayCode) return false;
  return branch.barangayCode === customer.barangayCode;
};

// how far is the delivery location from the branch, in km? Used for delivery fee calculation and estimation.
export const getBranchToDeliveryDistanceKm = (
  branchCoordinates: BranchGeoJsonCoordinates,
  deliveryCoordinates: Coordinates,
) => {
  const [branchLng, branchLat] = branchCoordinates;
  const distanceMeters = getDistanceMeters(
    { lat: branchLat, lng: branchLng },
    deliveryCoordinates,
  );

  return distanceMeters / 1000; // convert to km
};

export const calculateDeliveryFee = (
  distanceKm: number,
): DeliveryFeeEstimate => {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new Error("Distance must be a valid non-negative number.");
  }

  const billableKm = Math.round(distanceKm); // round to nearest whole km for billing; e.g. 5.2km becomes 5km, 5.5km becomes 6km
  const firstTierKm = Math.min(billableKm, FIRST_TIER_KM);
  const excessKm = Math.max(billableKm - FIRST_TIER_KM, 0);

  // Delivery fee is base fare + distance charge, with rates depending on whether the distance falls within the first tier or exceeds it.
  const deliveryFee = roundMoney(
    BASE_DELIVERY_FARE +
      firstTierKm * FIRST_TIER_RATE +
      excessKm * EXCESS_TIER_RATE,
  );

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    billableKm,
    deliveryFee,
  };
};

// Determines the effective delivery fee, applying free delivery when:
// 1. Barangay match (branch brgy === customer brgy) → free, no minimum, no distance check
// 2. Branch deliveryRadiusKm set AND within radius → needs minimum purchase
// 3. Fallback: global max distance + minimum purchase
export const resolveEffectiveDeliveryFee = (
  distanceKm: number,
  itemSubtotalAmount: number,
  config?: FreeDeliveryConfig,
  branch?: BranchDeliveryContext,
  customer?: CustomerDeliveryContext,
): EffectiveDeliveryFee => {
  const estimate = calculateDeliveryFee(distanceKm);
  const { enabled, minimumPurchase, maxDistanceKm } = resolveConfig(config);

  // When free delivery is disabled globally, no free delivery anywhere.
  if (!enabled) {
    return {
      ...estimate,
      freeDeliveryEligible: false,
      effectiveDeliveryFee: estimate.deliveryFee,
      freeDeliveryReason: undefined,
    };
  }

  // Barangay match — free delivery, no minimum purchase or distance check.
  if (isBarangayMatch(branch, customer)) {
    return {
      ...estimate,
      freeDeliveryEligible: true,
      effectiveDeliveryFee: 0,
      freeDeliveryReason: undefined,
    };
  }

  // Determine the effective max distance — branch override or global.
  const effectiveMaxDistanceKm = branch?.deliveryRadiusKm ?? maxDistanceKm;

  const exceedsMaxDistance = distanceKm > effectiveMaxDistanceKm;
  const meetsMinimumPurchase = itemSubtotalAmount >= minimumPurchase;
  const freeDeliveryEligible = meetsMinimumPurchase && !exceedsMaxDistance;

  const effectiveDeliveryFee = freeDeliveryEligible ? 0 : estimate.deliveryFee;

  let freeDeliveryReason: string | undefined;
  if (!freeDeliveryEligible && isDeliveryFeeScenario(distanceKm, itemSubtotalAmount)) {
    if (exceedsMaxDistance) {
      freeDeliveryReason = `Free delivery is only available within ${effectiveMaxDistanceKm} km.`;
    } else {
      const amountNeeded = roundMoney(minimumPurchase - itemSubtotalAmount);
      freeDeliveryReason = `Add ₱${amountNeeded.toFixed(2)} more to get free delivery within ${effectiveMaxDistanceKm} km.`;
    }
  }

  return {
    ...estimate,
    freeDeliveryEligible,
    effectiveDeliveryFee,
    freeDeliveryReason,
  };
};

// Whether free delivery messaging is relevant — only for delivery scenarios with a positive distance.
const isDeliveryFeeScenario = (distanceKm: number, itemSubtotalAmount: number) =>
  distanceKm > 0 && itemSubtotalAmount > 0;

// Checks whether free delivery applies for a delivery order.
// Priority: barangay match (instant free) → branch radius → global distance + minimum.
export function isFreeDeliveryEligible(
  fulfillmentType: string,
  distanceKm: number,
  itemSubtotalAmount: number,
  config?: FreeDeliveryConfig,
  branch?: BranchDeliveryContext,
  customer?: CustomerDeliveryContext,
): boolean {
  const { enabled, minimumPurchase, maxDistanceKm } = resolveConfig(config);
  if (!enabled) return false;
  if (fulfillmentType !== FULFILLMENT_TYPE.DELIVERY) return false;

  // Barangay match — free delivery, no minimum purchase or distance check.
  if (isBarangayMatch(branch, customer)) return true;

  // Branch radius override or global max distance.
  const effectiveMaxDistanceKm = branch?.deliveryRadiusKm ?? maxDistanceKm;
  if (distanceKm > effectiveMaxDistanceKm) return false;
  if (itemSubtotalAmount < minimumPurchase) return false;
  return true;
}

// FULFILLMENT_TYPE imported here for isFreeDeliveryEligible comparison.
import { FULFILLMENT_TYPE } from "@/types/orderConstants";

// Convenience function to calculate delivery fee estimate directly from branch and delivery coordinates.
export const calculateDeliveryFeeFromCoordinates = (
  branchCoordinates: BranchGeoJsonCoordinates,
  deliveryCoordinates: Coordinates,
) => {
  const distanceKm = getBranchToDeliveryDistanceKm(
    branchCoordinates,
    deliveryCoordinates,
  );
  return calculateDeliveryFee(distanceKm);
};

// Convenience: resolve effective delivery fee (with free delivery logic) from coordinates + subtotal.
export const resolveEffectiveDeliveryFeeFromCoordinates = (
  branchCoordinates: BranchGeoJsonCoordinates,
  deliveryCoordinates: Coordinates,
  itemSubtotalAmount: number,
  config?: FreeDeliveryConfig,
  branch?: BranchDeliveryContext,
  customer?: CustomerDeliveryContext,
) => {
  const distanceKm = getBranchToDeliveryDistanceKm(
    branchCoordinates,
    deliveryCoordinates,
  );
  return resolveEffectiveDeliveryFee(distanceKm, itemSubtotalAmount, config, branch, customer);
};
