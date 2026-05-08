import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Orders";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import {
  ORDER_ACTION_CONFIG,
  OrderStatus,
  STATUS_PRIORITY,
} from "@/types/orderConstants";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 },
      );
    }

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 },
      );
    }

    const formattedOrder = {
      _id: order._id,
      customerId: order.customerId?.toString() ?? null,
      createdAt: order.createdAt,
      status: order.status,
      items: order.items,
      total: order.total,
      paymentInfo: order.paymentInfo,
      estimatedTime: order.estimatedTime,
      isReviewed: order.isReviewed,
      actionConfig: ORDER_ACTION_CONFIG[order.status as OrderStatus],
      priority: STATUS_PRIORITY[order.status as OrderStatus],
    };

    return NextResponse.json({ data: formattedOrder });
  } catch (error) {
    console.error("GET guest order error:", error);

    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}