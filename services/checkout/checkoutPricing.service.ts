import { ClientSession } from "mongoose";
import { Branch } from "@/models/Branch";
import { CreateOrderPayload } from "@/types/OrderTypes";
import { calculateDeliveryFeeFromCoordinates } from "@/lib/deliveryFee";
import {
  AppliedProductDiscountPromotion,
  ProductDiscountResolution,
} from "@/lib/product-promotions/product-promotion.application";
import {
  calculatePromoCardDiscount,
  calculatePromoCardTotal,
  PROMO_CARD,
} from "@/lib/promoCard";
import { AppliedOrderDiscountPromotion } from "@/lib/order-promotions/order-promotion.application";
import { fetchBranch, isBranchCoordinates } from "../branch/branch.service";
import {
  addMoney,
  clampMoneyMin,
  multiplyMoney,
  subtractMoney,
} from "@/lib/money";

// -------------- TYPES ---------------------------
export interface TaxBreakdown {
  vatableSales: number;
  vatAmount: number;
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  productDiscountAmount: number;
  productDiscountPromotions: AppliedProductDiscountPromotion[];
  orderDiscountAmount: number;
  orderDiscountPromotionId?: string;
  orderDiscountPromotionName?: string;
  voucherDiscountAmount: number;
  discountCode?: string;

  deliveryFeeAmount: number;
  deliveryDistanceKm?: number;
  deliveryBillableKm?: number;
}

// ------------------ CONSTANT -------------------------------
export const TAX_RATE = 0.12;

// server-side validation to ensure coordinates are in expected format before calculating delivery fee
export function resolveDeliveryFee(
  branch: Awaited<ReturnType<typeof fetchBranch>>,
  shippingAddress: CreateOrderPayload["shippingAddress"],
) {
  const branchCoordinates = branch.location?.coordinates;
  const deliveryCoordinates = shippingAddress?.coordinates;

  if (!isBranchCoordinates(branchCoordinates) || !deliveryCoordinates) {
    throw new Error("Delivery fee cannot be calculated for this order.");
  }

  return calculateDeliveryFeeFromCoordinates(
    branchCoordinates,
    deliveryCoordinates,
  );
}

// ---------------------------------------------------------------------------
// Tax calculation
// ---------------------------------------------------------------------------

export function computeTax(
  subtotalAmount: number,
  productDiscountResolution: ProductDiscountResolution,
  applyPromoCardDiscount = false,
  discountRate: number = PROMO_CARD.discountRate,
  discountCode: string = PROMO_CARD.sku,
  voucherDiscountAmount = 0,
  orderDiscountPromotion: AppliedOrderDiscountPromotion | null = null,
  deliveryFeeAmount = 0,
  deliveryDistanceKm = 0,
  deliveryBillableKm = 0,
): TaxBreakdown {
  const productDiscountAmount = productDiscountResolution.productDiscountAmount;
  const productDiscountedSubtotal =
    productDiscountResolution.discountedSubtotalAmount;
  const promoCardDiscountAmount = applyPromoCardDiscount
    ? calculatePromoCardDiscount(productDiscountedSubtotal, discountRate)
    : 0;
  const promoTotalAmount = applyPromoCardDiscount
    ? calculatePromoCardTotal(productDiscountedSubtotal, discountRate)
    : productDiscountedSubtotal;
  const orderDiscountAmount = orderDiscountPromotion?.discountAmount ?? 0;
  const discountAmount = addMoney(
    addMoney(productDiscountAmount, promoCardDiscountAmount),
    orderDiscountAmount,
  );
  const totalAmount = clampMoneyMin(
    addMoney(
      subtractMoney(
        subtractMoney(promoTotalAmount, orderDiscountAmount),
        voucherDiscountAmount,
      ),
      deliveryFeeAmount,
    ),
  );
  // VAT-inclusive: totalAmount = vatableSales + vatAmount, where vatAmount = vatableSales * 0.12
  // So vatableSales = totalAmount / 1.12, using centavo arithmetic to avoid float drift
  const vatableSales = multiplyMoney(totalAmount, 1 / (1 + TAX_RATE));
  const vatAmount = subtractMoney(totalAmount, vatableSales);

  return {
    vatableSales,
    vatAmount,
    totalAmount,
    subtotalAmount,
    discountAmount,
    productDiscountAmount,
    productDiscountPromotions: productDiscountResolution.appliedPromotions,
    orderDiscountAmount,
    ...(orderDiscountPromotion && {
      orderDiscountPromotionId: orderDiscountPromotion.promotionId.toString(),
      orderDiscountPromotionName: orderDiscountPromotion.name,
    }),
    voucherDiscountAmount,
    ...(promoCardDiscountAmount > 0 && { discountCode }),
    deliveryFeeAmount,
    deliveryDistanceKm,
    deliveryBillableKm,
  };
}
