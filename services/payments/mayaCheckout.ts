// ---------------------------------------------------------------------------
// Maya checkout
// ---------------------------------------------------------------------------

import { CreateOrderPayload } from "@/types/OrderTypes";
import { ResolvedCartItem } from "../checkout/checkoutInventory.service";
import { TaxBreakdown } from "../checkout/checkoutPricing.service";
import { getMayaCheckoutUrl } from "@/lib/mayaConfig";
import { getAuthHeader } from "@/lib/getAuthHeader";
import { addMoney } from "@/lib/money";

export function buildMayaPayload(
  body: CreateOrderPayload,
  mayaItems: ResolvedCartItem["mayaItem"][],
  tax: TaxBreakdown,
  referenceNumber: string,
) {
  const { firstName, lastName, customerEmail, customerPhone, shippingAddress } =
    body;
  const { line1, line2, city, province, zipCode } = shippingAddress ?? {};
  const {
    vatableSales,
    vatAmount,
    totalAmount,
    discountAmount,
    voucherDiscountAmount,
    deliveryFeeAmount,
    freeDeliveryApplied,
    rawDeliveryFee,
  } = tax;

  // When free delivery applies, show the original fee as a line item at 0
  // so the receipt says "Delivery Fee (FREE)". PayMaya rejects negative totalAmount
  // values, so the savings are communicated via the line item description only.
  const freeDeliveryItems = freeDeliveryApplied && rawDeliveryFee
    ? [
        {
          name: "Delivery Fee (FREE)",
          quantity: 1,
          code: "DELIVERY_FEE_FREE",
          description: `Free delivery — originally ₱${rawDeliveryFee}`,
          amount: { value: rawDeliveryFee },
          totalAmount: {
            value: 0,
            currency: "PHP",
          },
        },
      ]
    : [];

  const regularDeliveryItem =
    !freeDeliveryApplied && deliveryFeeAmount > 0
      ? [
          {
            name: "Delivery Fee",
            quantity: 1,
            code: "DELIVERY_FEE",
            description: "Distance-based delivery fee",
            amount: { value: deliveryFeeAmount },
            totalAmount: {
              value: deliveryFeeAmount,
              currency: "PHP",
            },
          },
        ]
      : [];

  const paymentItems = [...mayaItems, ...freeDeliveryItems, ...regularDeliveryItem];

  return {
    totalAmount: {
      value: totalAmount,
      currency: "PHP",
      details: {
        discount: addMoney(discountAmount, voucherDiscountAmount),
        vatAmount,
        vatableSales,
      },
    },
    items: paymentItems,
    buyer: {
      firstName,
      lastName,
      contact: { email: customerEmail, phone: customerPhone },
      ...(shippingAddress && {
        shippingAddress: {
          line1,
          line2,
          city,
          state: province,
          zipCode,
          countryCode: "PH",
        },
      }),
    },
    redirectUrl: {
      success: `${process.env.NEXT_PUBLIC_URL}/payment/success?referenceNumber=${referenceNumber}`,
      failure: `${process.env.NEXT_PUBLIC_URL}/payment/failed?referenceNumber=${referenceNumber}`,
      cancel: `${process.env.NEXT_PUBLIC_URL}/payment/cancel?referenceNumber=${referenceNumber}`,
    },
    requestReferenceNumber: referenceNumber,
  };
}

export async function createMayaCheckout(
  payload: ReturnType<typeof buildMayaPayload>,
) {
  if (!process.env.MAYA_PUBLIC_KEY) throw new Error("Maya key not configured");

  const response = await fetch(getMayaCheckoutUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? "Maya checkout failed");

  return data as { checkoutId: string; redirectUrl: string };
}
