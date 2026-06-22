import {
  FULFILLMENT_TYPE,
  type FulfillmentType,
} from "../../../types/orderConstants";

type CheckoutActionModeInput = {
  pathname: string;
  fulfillmentType: FulfillmentType;
};

const CHECKOUT_DETAILS_PATH = "/checkout/details";
const CHECKOUT_SHIPPING_PATH = "/checkout/shipping";

// Keeps checkout CTA routing explicit: pickup has no shipping form to review.
export function getCheckoutActionMode({
  pathname,
  fulfillmentType,
}: CheckoutActionModeInput): "next" | "submit" {
  if (pathname === CHECKOUT_SHIPPING_PATH) return "submit";

  if (
    pathname === CHECKOUT_DETAILS_PATH &&
    fulfillmentType === FULFILLMENT_TYPE.PICKUP
  ) {
    return "submit";
  }

  return "next";
}
