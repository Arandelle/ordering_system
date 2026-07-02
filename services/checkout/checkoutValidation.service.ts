import { getPromoCardConfig } from "@/lib/promoCardConfig";
import { getStoreStatus } from "@/lib/storeStatus";
import { Settings } from "@/models/Setting";
import { Order } from "@/models/Orders";
import { FULFILLMENT_TYPE, ORDER_STATUSES } from "@/types/orderConstants";
import { PAYMENT_STATUSES } from "@/types/paymentConstants";
import { CreateOrderPayload } from "@/types/OrderTypes";
import { ClientSession } from "mongoose";
import { getPaidPromoCardBenefit } from "../promoCardBenefits";
import { validateFulfillmentPayload } from "./checkoutFulfillment.service";
import { Branch } from "@/models/Branch";

export async function assertStoreIsOpen(session: ClientSession): Promise<void> {
  const settings = await Settings.findOne().session(session);
  if (!settings) throw new Error("Store settings not found.");

  const storeStatus = getStoreStatus(settings.operatingHours);
  if (!storeStatus.isOpen) throw new Error(storeStatus.message);
}

/**
 * Guard: check that a branch can accept new orders based on capacity.
 * Pickup orders only check the manual isBusy override — no rider-based counting.
 * Delivery orders are subject to full capacity counting.
 */
export async function assertBranchCanAcceptOrders(
  branchId: string,
  fulfillmentType: string | undefined,
  session: ClientSession,
): Promise<void> {
  const branch = await Branch.findById(branchId).session(session);
  if (!branch) throw new Error("Branch not found.");

  // Admin manual override — hard block regardless of fulfillment type
  if (branch.isBusy) {
    throw new Error(
      "We're currently experiencing high demand. Please try again shortly.",
    );
  }

  // Pickup: only isBusy matters — no rider-based capacity counting
  if (fulfillmentType === FULFILLMENT_TYPE.PICKUP) return;

  // Determine the effective limit: branch-specific > global fallback > no limit
  const settings = await Settings.findOne().session(session);
  const maxActiveOrders =
    branch.maxActiveOrders ?? settings?.globalMaxActiveOrders ?? null;
  const isSharedCapacity = settings?.isGlobalCapacityShared === true;

  // No limit configured — allow all orders
  if (maxActiveOrders === null) return;

  // Count confirmed active orders (excluding pending_payment which may expire unpaid)
  const activeStatuses = [
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.PREPARING,
    ORDER_STATUSES.DISPATCH,
  ];

  // Only count orders with confirmed payment so unconfirmed Maya
  // checkouts don't artificially block capacity.
  // Maya orders require both PAYMENT_SUCCESS and a real paymentId.
  const activeOrderCount = await Order.countDocuments({
    ...(isSharedCapacity ? {} : { branchId }),
    status: { $in: activeStatuses },
    $or: [
      { "paymentInfo.paymentMethod": "cod" },
      {
        "paymentInfo.paymentStatus": PAYMENT_STATUSES.PAYMENT_SUCCESS,
        "paymentInfo.paymentId": { $exists: true, $ne: null },
      },
    ],
  }).session(session);

  if (activeOrderCount >= maxActiveOrders) {
    throw new Error(
      "We're currently experiencing high demand. Please try again shortly. You may try pickup instead.",
    );
  }
}

export function assertValidPayload(body: CreateOrderPayload): void {
  const { branchId, firstName, lastName, customerPhone, items } = body;

  if (!branchId) throw new Error("Branch is required.");
  if (!firstName || !lastName || !customerPhone)
    throw new Error("Customer details are required.");
  if (!items || !Array.isArray(items) || items.length === 0)
    throw new Error("Cart is empty.");
  validateFulfillmentPayload(body);
}

export async function assertCanUsePromoCardDiscount(
  customerId: string | null,
  session: ClientSession,
): Promise<{ discountRate: number; discountCode: string }> {
  const promoCardConfig = await getPromoCardConfig();
  if (!promoCardConfig.enabled) {
    throw new Error(
      "Promo card is currently unavailable pending final marketing review.",
    );
  }

  if (!customerId) {
    throw new Error("Login is required to use the promo card discount.");
  }

  const paidPromoCard = await getPaidPromoCardBenefit(customerId, session);

  if (!paidPromoCard) {
    throw new Error("A paid promo card is required to use this discount.");
  }

  return {
    discountRate: paidPromoCard.discountRate,
    discountCode: paidPromoCard.discountCode,
  };
}
