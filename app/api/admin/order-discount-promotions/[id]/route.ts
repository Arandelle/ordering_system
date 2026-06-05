import { requireAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import {
  normalizeOrderDiscountPromotionPayload,
  type OrderDiscountPromotionPayload,
  validateOrderDiscountPromotionConfig,
} from "@/lib/order-promotions/order-promotion.validation";
import { OrderDiscountPromotion } from "@/models/OrderDiscountPromotion";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import "@/lib/registerModels";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    await requireAdmin(request);

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid promotion id." },
        { status: 400 },
      );
    }

    const existing = await OrderDiscountPromotion.findById(id)
      .select({ redemptionCount: 1 })
      .lean<{ redemptionCount?: number }>();

    if (!existing) {
      return NextResponse.json(
        { error: "Order discount promotion not found." },
        { status: 404 },
      );
    }

    const body = (await request.json()) as OrderDiscountPromotionPayload;
    const normalizedConfig = normalizeOrderDiscountPromotionPayload(
      body,
      existing.redemptionCount ?? 0,
    );
    const validationError =
      validateOrderDiscountPromotionConfig(normalizedConfig);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const promotion = await OrderDiscountPromotion.findByIdAndUpdate(
      id,
      { $set: normalizedConfig },
      { new: true, runValidators: true },
    ).lean();

    return NextResponse.json({ promotion }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update order discount promotion.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    await requireAdmin(request);

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid promotion id." },
        { status: 400 },
      );
    }

    const promotion = await OrderDiscountPromotion.findByIdAndDelete(id).lean();

    if (!promotion) {
      return NextResponse.json(
        { error: "Order discount promotion not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete order discount promotion.",
      },
      { status: 500 },
    );
  }
}
