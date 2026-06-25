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
    fulfillmentType !== FULFILLMENT_TYPE.PICKUP
  ) {
    throw new Error("Invalid fulfillment type.");
  }

  return fulfillmentType === FULFILLMENT_TYPE.PICKUP ? "pickup" : "delivery";
}

// Validates fulfillment-specific checkout requirements before pricing/persisting.
export function validateFulfillmentPayload({
  fulfillmentType,
  shippingAddress,
}: FulfillmentPayload): void {
  const normalizedFulfillmentType = normalizeFulfillmentType(fulfillmentType);

  if (normalizedFulfillmentType === FULFILLMENT_TYPE.PICKUP) return;

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

// Resolves final server-authoritative fulfillment pricing for checkout.
export function resolveCheckoutFulfillment({
  fulfillmentType,
  branch,
  shippingAddress,
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
