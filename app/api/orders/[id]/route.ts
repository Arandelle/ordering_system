import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Orders";
import { NextRequest, NextResponse } from "next/server";

const allowedTransitions : Record<string, string[]> = {
  pending: ["cancelled"],
  paid: ["preparing"],
  preparing: ["ready"],
  ready: ["dispatched"],
  dispatched: ["completed"],
  completed: [],
  cancelled: [],
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      _id: order._id.toString(),
      createdAt: order.createdAt,
      status: order.status,
      items: order.items,
      paymentInfo: order.paymentInfo,
      total: order.total,
      estimatedTime: order.estimatedTime,
      timeline: order.timeline,
      notes: order.note,
      isReviewed: order.isReviewed,
      reviewedAt: order.reviewedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }  
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {

    await connectDB();

    const {id} = await context.params;
    const body = await request.json();
    const {status: newStatus} = body;

    if(!newStatus){
        return NextResponse.json({
            error: "Status is required!"
        }, {status: 400})
    }

    const order = await Order.findById(id);

    if(!order){
        return NextResponse.json({
            error: "Order Not found!"
        }, {status: 404})
    };


    const allowedStatuses = allowedTransitions[order.status] ?? [];
    if (!allowedStatuses.includes(newStatus)) {
        return NextResponse.json({
            error: `Invalid status transition from ${order?.status} to ${newStatus}`,
            allowedTransitions: allowedStatuses
        }, {status: 400})

    }

    order.status = newStatus;
    order.statusUpdatedAt = new Date();
    await order.save();

    return NextResponse.json({
        _id: order._id.toString(),
        status: order.status
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
