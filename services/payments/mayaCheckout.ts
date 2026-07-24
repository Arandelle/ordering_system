// ---------------------------------------------------------------------------
// Maya checkout
// ---------------------------------------------------------------------------

import { CreateOrderPayload } from "@/types/OrderTypes";
import { MayaModifierLineItem } from "../checkout/checkoutInventory.service";
import { ResolvedCartItem } from "../checkout/checkoutInventory.service";
import { TaxBreakdown } from "../checkout/checkoutPricing.service";
import { getMayaCheckoutUrl, getMayaQrUrl } from "@/lib/mayaConfig";
import { getAuthHeader, getMayaQrAuthHeader } from "@/lib/getAuthHeader";
import { addMoney } from "@/lib/money";

/** Union type covering both parent product items and modifier upgrade items */
type MayaLineItem = ResolvedCartItem["mayaItem"] | MayaModifierLineItem;

export function buildMayaPayload(
  body: CreateOrderPayload,
  mayaItems: MayaLineItem[],
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
  // Use nominal amount (1) when rawDeliveryFee is 0 so Maya still renders the line.
  const freeDeliveryItems = freeDeliveryApplied
    ? [
        {
          name: "Delivery Fee (FREE)",
          quantity: 1,
          code: "DELIVERY_FEE_FREE",
          description: rawDeliveryFee
            ? `Free delivery — originally ₱${rawDeliveryFee}`
            : "Free delivery",
          amount: { value: rawDeliveryFee || 1 },
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

// ---------------------------------------------------------------------------
// QR PH — direct QR code payment (skips the full payment method list)
// ---------------------------------------------------------------------------

/**
 * Builds a minimal payload for the Maya QR PH API.
 * Unlike the Checkout API, QR PH only needs totalAmount, redirectUrl, and referenceNumber.
 */
export function buildMayaQrPayload(
  totalAmount: number,
  referenceNumber: string,
) {
  return {
    totalAmount: {
      value: totalAmount.toFixed(2),
      currency: "PHP",
    },
    redirectUrl: {
      success: `${process.env.NEXT_PUBLIC_URL}/payment/success?referenceNumber=${referenceNumber}`,
      failure: `${process.env.NEXT_PUBLIC_URL}/payment/failed?referenceNumber=${referenceNumber}`,
      cancel: `${process.env.NEXT_PUBLIC_URL}/payment/cancel?referenceNumber=${referenceNumber}`,
    },
    requestReferenceNumber: referenceNumber,
  };
}

/**
 * Calls the Maya QR PH API to generate a QR code payment.
 * Returns paymentId (used as checkoutId), redirectUrl (Maya's QR page), and qrCodeBody (raw QR data).
 */
export async function createMayaQrPayment(
  payload: ReturnType<typeof buildMayaQrPayload>,
) {
  if (!process.env.MAYA_PUBLIC_KEY) throw new Error("Maya key not configured");

  const response = await fetch(getMayaQrUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: getMayaQrAuthHeader(), // QR PH uses "Pay with Maya" app keys
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  console.log("[Maya QR PH] URL:", getMayaQrUrl());
  console.log("[Maya QR PH] Status:", response.status);
  console.log("[Maya QR PH] Response:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    const detail = data.message ?? data.error ?? JSON.stringify(data);
    throw new Error(`Maya QR payment failed (${response.status}): ${detail}`);
  }

  return data as {
    paymentId: string;
    redirectUrl: string;
    qrCodeBody: string;
  };
}
