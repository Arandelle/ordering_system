import { getDistanceMeters } from "./deliveryArea";
import { roundMoney } from "./promotions/promotion.calculation";

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

const BASE_DELIVERY_FARE = 49;
const FIRST_TIER_KM = 5;
const FIRST_TIER_RATE = 6;
const EXCESS_TIER_RATE = 5;

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
