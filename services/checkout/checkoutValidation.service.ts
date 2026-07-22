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
import { toPHDate } from "@/utils/toPHDate";

/**
 * Guard:  check that a branch has not reached its reservation capacity
 * for the requested date/time slot. Only applies to dine-in orders.
 *
 * Checks two limits (branch-specific > global fallback> no limit):
 * - maxReservationsPerDay: total reservations on the same date
 * - maxReservationsPerHour : reservationsin the same hour slot
 *
 *  Counted statuses : pending, confirmed, preparing (anything not terminal).
 *  Cancelled/completed/failed/expired orders are excluded.
 *
 * @param branchId
 * @param reservation
 * @param session
 * @returns
 */

export async function assertReservationLimits(
  branchId: string,
  reservation: CreateOrderPayload["reservation"] | undefined,
  session: ClientSession,
): Promise<void> {
  if (!reservation?.scheduledAt) return;

  const branch = await Branch.findById(branchId).session(session);
  if (!branch) throw new Error("Branch not found.");

  const settings = await Settings.findOne().session(session);

  const maxPerDay =
    branch.maxReservationsPerDay ??
    settings?.globalMaxReservationsPerDay ??
    null;
  const maxPerHour =
    branch.maxReservationsPerHour ??
    settings?.globalMaxReservationsPerHour ??
    null;

  // No limits configured — allow all reservations
  if (maxPerDay === null && maxPerHour === null) return;

  const scheduledAt = new Date(reservation.scheduledAt);

  // Reservation statuses that count toward capacity (active, non-terminal)
  const activeReservationStatuses = [
    ORDER_STATUSES.PENDING_PAYMENT,
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PREPARING,
    ORDER_STATUSES.READY_FOR_PICKUP,
  ];


  // Build the PH-local day boundaries in UTC using IANA timezone.
  // toPHDate converts the stored UTC date to PH-local components,
  // working correctly on both local dev machines and UTC servers (Vercel).
  const phLocal = toPHDate(scheduledAt);
  const localYear = phLocal.getFullYear();
  const localMonth = phLocal.getMonth();
  const localDay = phLocal.getDate();
  const localHour = phLocal.getHours();

  // Start/end of the PH day in UTC
  // PH is UTC+8, so midnight PH = 4pm UTC previous day
  const phOffsetMs = 8 * 60 * 60 * 1000;
  const dayStartUTC = new Date(
    Date.UTC(localYear, localMonth, localDay) - phOffsetMs,
  );
  const dayEndUTC = new Date(
    Date.UTC(localYear, localMonth, localDay + 1) - phOffsetMs,
  );

  const baseQuery = {
    branchId,
    fulfillmentType: FULFILLMENT_TYPE.DINE_IN,
    "reservation.scheduledAt": { $gte: dayStartUTC, $lt: dayEndUTC },
    status: { $in: activeReservationStatuses },
  };

  // Daily limit check
  if (maxPerDay !== null) {
    const dailyCount = await Order.countDocuments(baseQuery, { session });
    if (dailyCount >= maxPerDay) {
      const dateStr = scheduledAt.toLocaleDateString("en-PH", {
        dateStyle: "medium",
        timeZone: "Asia/Manila",
      });
      throw new Error(
        `This branch has reached its reservation limit for ${dateStr} (${maxPerDay} reservations/day). Please try a different date.`,
      );
    }
  }

  // Hourly limit check — count reservations in the same PH hour slot
  if (maxPerHour !== null) {
    const hourStartUTC = new Date(
      Date.UTC(localYear, localMonth, localDay, localHour) - phOffsetMs,
    );
    const hourEndUTC = new Date(hourStartUTC.getTime() + 60 * 60 * 1000);

    const hourlyCount = await Order.countDocuments(
      {
        ...baseQuery,
        "reservation.scheduledAt": { $gte: hourStartUTC, $lt: hourEndUTC },
      },
      { session },
    );

    if (hourlyCount >= maxPerHour) {
      const timeStr = scheduledAt.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Manila",
      });
      throw new Error(
        `The ${timeStr} time slot is fully booked at this branch (${maxPerHour} reservations/hour). Please try a different time.`,
      );
    }
  }
}

export async function assertStoreIsOpen(session: ClientSession): Promise<void> {
  const settings = await Settings.findOne().session(session);
  if (!settings) throw new Error("Store settings not found.");

  const storeStatus = getStoreStatus(settings.operatingHours);
  if (!storeStatus.isOpen)
    throw new Error(`${storeStatus.title}: ${storeStatus.body}`);
}

/**
 * Guard: check that a branch can accept new orders based on capacity.
 * Pickup and dine-in orders only check the manual isBusy override — no rider-based counting.
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

  // Pickup and dine-in: only isBusy matters — no rider-based capacity counting
  if (
    fulfillmentType === FULFILLMENT_TYPE.PICKUP ||
    fulfillmentType === FULFILLMENT_TYPE.DINE_IN
  )
    return;

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

export async function assertValidPayload(
  body: CreateOrderPayload,
  session?: ClientSession,
): Promise<void> {
  const { branchId, firstName, lastName, customerPhone, items } = body;

  if (!branchId) throw new Error("Branch is required.");
  if (!firstName || !lastName || !customerPhone)
    throw new Error("Customer details are required.");
  if (!items || !Array.isArray(items) || items.length === 0)
    throw new Error("Cart is empty.");
  await validateFulfillmentPayload(body, session);
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
