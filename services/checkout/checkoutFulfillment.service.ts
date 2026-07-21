import { FULFILLMENT_TYPE, FulfillmentType } from "@/types/orderConstants";
import {
  CITY_RESTRICTION_MESSAGE,
  isCityAllowedForDelivery,
  isWithinMetroManilaDeliveryArea,
  OUTSIDE_DELIVERY_AREA_MESSAGE,
} from "../../lib/deliveryArea";
import { calculateDeliveryFeeFromCoordinates } from "../../lib/deliveryFee";
import type { CreateOrderPayload } from "../../types/OrderTypes";
import { isBranchCoordinates } from "../branch/branch.service";


type FulfillmentPayload = {
  fulfillmentType?: FulfillmentType;
  shippingAddress?: CreateOrderPayload["shippingAddress"];
  reservation?: CreateOrderPayload["reservation"];
};

type BranchWithCoordinates = {
  location?: {
    coordinates?: unknown;
  };
};


export function normalizeFulfillmentType(
  fulfillmentType?: FulfillmentType,
): FulfillmentType {
  if (
    fulfillmentType &&
    fulfillmentType !== FULFILLMENT_TYPE.DELIVERY &&
    fulfillmentType !== FULFILLMENT_TYPE.PICKUP &&
    fulfillmentType !== FULFILLMENT_TYPE.DINE_IN
  ) {
    throw new Error("Invalid fulfillment type.");
  }

  if (fulfillmentType === FULFILLMENT_TYPE.PICKUP) return "pickup";
  if (fulfillmentType === FULFILLMENT_TYPE.DINE_IN) return "dine_in";
  return "delivery";
}

/** Validates that reservation fields are present and valid for dine-in orders */
function validateReservationPayload(
  reservation?: CreateOrderPayload["reservation"],
): void {
  if (!reservation) {
    throw new Error("Reservation details are required for dine-in orders.");
  }

  if (!reservation.scheduledAt) {
    throw new Error("Reservation date and time is required.");
  }

  const scheduledDate = new Date(reservation.scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    throw new Error("Invalid reservation date.");
  }

  if (scheduledDate <= new Date()) {
    throw new Error("Reservation must be scheduled for a future date and time.");
  }

  if (!reservation.partySize || reservation.partySize < 1) {
    throw new Error("At least 1 guest is required.");
  }

  if (reservation.partySize > 50) {
    throw new Error("Maximum 50 guests per reservation.");
  }
}

// Validates fulfillment-specific checkout requirements before pricing/persisting.
export function validateFulfillmentPayload({
  fulfillmentType,
  shippingAddress,
  reservation,
}: FulfillmentPayload): void {
  const normalizedFulfillmentType = normalizeFulfillmentType(fulfillmentType);

  if (normalizedFulfillmentType === FULFILLMENT_TYPE.PICKUP) return;

  if (normalizedFulfillmentType === FULFILLMENT_TYPE.DINE_IN) {
    validateReservationPayload(reservation);
    return;
  }

  const coordinates = shippingAddress?.coordinates;

  if (!shippingAddress) throw new Error("Shipping address is required.");
  if (!shippingAddress.line1 || !shippingAddress.line2) {
    throw new Error("Complete shipping address is required.");
  }
  if (!shippingAddress.city || !shippingAddress.province) {
    throw new Error("City and province are required.");
  }
  if (!shippingAddress.zipCode) throw new Error("Postal code is required.");
  if (!coordinates) throw new Error("Pin your delivery location on the map.");
  if (!isWithinMetroManilaDeliveryArea(coordinates)) {
    throw new Error(OUTSIDE_DELIVERY_AREA_MESSAGE);
  }

  if (!isCityAllowedForDelivery(shippingAddress)) {
    throw new Error(CITY_RESTRICTION_MESSAGE);
  }
}

// Resolves server-authoritative fulfillment pricing: validates the delivery
// address and computes the raw delivery fee + distance. Free delivery
// eligibility is NOT resolved here because the item subtotal is unknown at
// this point in the checkout flow — it is computed separately in the checkout
// routes after cart resolution.
export function resolveCheckoutFulfillment({
  fulfillmentType,
  branch,
  shippingAddress,
  reservation,
}: FulfillmentPayload & { branch: BranchWithCoordinates }) {
  const normalizedFulfillmentType = normalizeFulfillmentType(fulfillmentType);

  if (normalizedFulfillmentType === FULFILLMENT_TYPE.PICKUP) {
    return {
      fulfillmentType: normalizedFulfillmentType,
      shippingAddress: undefined,
      deliveryFee: 0,
      distanceKm: 0,
      billableKm: 0,
    };
  }

  // Dine-in: no delivery fee, no shipping address — just validate reservation
  if (normalizedFulfillmentType === FULFILLMENT_TYPE.DINE_IN) {
    validateReservationPayload(reservation);
    return {
      fulfillmentType: normalizedFulfillmentType,
      shippingAddress: undefined,
      deliveryFee: 0,
      distanceKm: 0,
      billableKm: 0,
    };
  }

  validateFulfillmentPayload({
    fulfillmentType: normalizedFulfillmentType,
    shippingAddress,
  });

  const branchCoordinates = branch.location?.coordinates;
  const deliveryCoordinates = shippingAddress?.coordinates;

  if (!isBranchCoordinates(branchCoordinates) || !deliveryCoordinates) {
    throw new Error("Delivery fee cannot be calculated for this order.");
  }

  return {
    fulfillmentType: normalizedFulfillmentType,
    shippingAddress,
    ...calculateDeliveryFeeFromCoordinates(branchCoordinates, deliveryCoordinates),
  };
}
