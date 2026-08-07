import { FULFILLMENT_TYPE } from "@/types/orderConstants";

/**
 * Returns a human-readable label for a payment method,
 * taking fulfillment type into account for COD orders.
 *
 * - maya → "Online Payment"
 * - cod + delivery → "Cash on Delivery"
 * - cod + pickup → "Cash on Pickup"
 * - cod + dine_in → "Pay at Branch"
 */

export function getPaymentMethodLabel(
  paymentMethod: "maya" | "cod" | undefined,
  fulfillementType?: string,
): string {
  if (paymentMethod === "maya") return "Online Payment";

  if (paymentMethod === "cod") {
    if (fulfillementType === FULFILLMENT_TYPE.PICKUP) return "Cash on Pickup";
    if (fulfillementType === FULFILLMENT_TYPE.DINE_IN) return "Pay at Branch";
    return "Cash on Delivery";
  }

  return paymentMethod ?? "N/A";
}
