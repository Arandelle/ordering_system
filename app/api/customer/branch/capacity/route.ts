import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Orders";
import { Branch } from "@/models/Branch";
import { Settings } from "@/models/Setting";
import { FULFILLMENT_TYPE, ORDER_STATUSES } from "@/types/orderConstants";
import { PAYMENT_STATUSES } from "@/types/paymentConstants";
import { NextRequest, NextResponse } from "next/server";
import "@/lib/registerModels";

const ACTIVE_STATUSES = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.PREPARING,
  ORDER_STATUSES.DISPATCH,
  ORDER_STATUSES.READY_FOR_PICKUP,
];

/**
 * GET /api/customer/branch/capacity?branchId=...&fulfillmentType=...
 *
 * Returns whether a branch can currently accept new orders.
 * Pickup orders are only blocked by the manual isBusy override —
 * no capacity counting since pickup doesn't share riders.
 * Delivery orders are subject to full capacity counting.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const fulfillmentType = searchParams.get("fulfillmentType");

    if (!branchId) {
      return NextResponse.json(
        { error: "Missing branchId query parameter" },
        { status: 400 },
      );
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    // Admin manual override — hard block regardless of fulfillment type
    if (branch.isBusy) {
      return NextResponse.json({
        canAcceptOrders: false,
        reason: "high_demand",
        message:
          "We're currently experiencing high demand. Please try again shortly.",
      });
    }

    // Pickup: only isBusy matters — no rider-based capacity counting
    if (fulfillmentType === FULFILLMENT_TYPE.PICKUP) {
      return NextResponse.json({ canAcceptOrders: true });
    }

    // Delivery (or unspecified): full capacity check

    // Resolve the effective limit: branch-specific > global fallback > no limit
    const settings = await Settings.findOne();
    const maxActiveOrders =
      branch.maxActiveOrders ?? settings?.globalMaxActiveOrders ?? null;
    const isSharedCapacity = settings?.isGlobalCapacityShared === true;

    // No limit configured — always allow
    if (maxActiveOrders === null) {
      return NextResponse.json({ canAcceptOrders: true });
    }

    // Only count orders with confirmed payment so unconfirmed Maya
    // checkouts (user never paid) don't artificially block capacity.
    // COD orders are always counted — payment happens on delivery.
    // Maya orders require both PAYMENT_SUCCESS and a real paymentId
    // (set only by the webhook after actual payment confirmation).
    const activeOrderCount = await Order.countDocuments({
      ...(isSharedCapacity ? {} : { branchId }),
      status: { $in: ACTIVE_STATUSES },
      $or: [
        { "paymentInfo.paymentMethod": "cod" },
        {
          "paymentInfo.paymentStatus": PAYMENT_STATUSES.PAYMENT_SUCCESS,
          "paymentInfo.paymentId": { $exists: true, $ne: null },
        },
      ],
    });

    const canAccept = activeOrderCount < maxActiveOrders;

    return NextResponse.json({
      canAcceptOrders: canAccept,
      maxActiveOrders,
      activeOrderCount,
      ...(canAccept
        ? {}
        : {
            reason: "high_demand",
            message:
              "We're currently experiencing high demand. Please try again shortly. You may try pickup instead.",
          }),
    });
  } catch (error) {
    console.error("GET /api/customer/branch/capacity error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check branch capacity",
      },
      { status: 500 },
    );
  }
}
