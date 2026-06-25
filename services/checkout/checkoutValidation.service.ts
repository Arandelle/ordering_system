import { getPromoCardConfig } from "@/lib/promoCardConfig";
import { getStoreStatus } from "@/lib/storeStatus";
import { Settings } from "@/models/Setting";
import { CreateOrderPayload } from "@/types/OrderTypes";
import { ClientSession } from "mongoose";
import { getPaidPromoCardBenefit } from "../promoCardBenefits";
import { validateFulfillmentPayload } from "./checkoutFulfillment.service";
import { fetchBranch } from "../branch/branch.service";

export async function assertStoreIsOpen(session: ClientSession): Promise<void> {
  const settings = await Settings.findOne().session(session);
  if (!settings) throw new Error("Store settings not found.");

  const storeStatus = getStoreStatus(settings.operatingHours);
  if (!storeStatus.isOpen) throw new Error(storeStatus.message);
}

/**
 * Assert that a branch exists and is available for ordering.
 * Delegated to fetchBranch which checks isActive && !openingSoon.
 */
export async function assertBranchCanAcceptOrders(
  branchId: string,
  session: ClientSession,
): Promise<void> {
  await fetchBranch(branchId, session);
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
