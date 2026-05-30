import { requireBetterAuth } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { Inventory } from "@/models/Inventory";
import { Order } from "@/models/Orders";
import { refundCustomerVoucher } from "@/services/promoCardBenefits";
import {
  canTransitionTo,
  getTimelineField,
  ORDER_STATUSES,
  OrderStatus,
} from "@/types/orderConstants";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  let session: mongoose.ClientSession | null = null;

  try {
    const { id } = await context.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 },
      );
    }

    const customer = await requireBetterAuth(request);

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ownership check — guest orders have no customerId
    if (
      order.customerId &&
      (!customer || order.customerId.toString() !== customer._id.toString())
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ============================================
    // VALIDATE STATUS TRANSITION
    // ============================================

    const currentStatus = order.status as OrderStatus;
    // Check if transition is valid
    if (!canTransitionTo(currentStatus, ORDER_STATUSES.CANCELLED, "customer")) {
      return NextResponse.json(
        {
          error: `Cannot cancel order with status "${order.status}"`,
          currentStatus: order.status,
        },
        { status: 400 },
      );
    }

    session = await mongoose.startSession();
    session.startTransaction();

    // Auto-update timeline when status changes
    const timelineField = getTimelineField(ORDER_STATUSES.CANCELLED);

    const updateResult = await Order.updateOne(
      { _id: id, status: currentStatus },
      {
        $set: {
          status: ORDER_STATUSES.CANCELLED,
          ...(timelineField && { [`timeline.${timelineField}`]: new Date() }),
        },
      },
      { session },
    );

    if (updateResult.matchedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        { error: "Order status changed. Please refresh and try again." },
        { status: 409 },
      );
    }

    // Release inventory reservations - $pull is idempotent, safe to retry
    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId, branchId: order.branchId },
        { $pull: { reservations: { orderId: order._id } } },
        { session },
      );
    }

    await refundCustomerVoucher(
      order.customerId,
      order.total?.voucherDiscountAmount ?? 0,
      session,
    );

    await session.commitTransaction();
    session.endSession();
    session = null;

    return NextResponse.json({
      message: "Order cancelled successfully!",
      _id: order._id.toString(),
      status: ORDER_STATUSES.CANCELLED,
    });
  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel order.",
      },
      { status: 500 },
    );
  }
}
