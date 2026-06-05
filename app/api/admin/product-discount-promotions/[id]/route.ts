import { requireAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { getProductDiscountSnapshots } from "@/lib/product-promotions/product-promotion.products";
import {
  normalizeProductDiscountPromotionPayload,
  type ProductDiscountPromotionPayload,
  validateProductDiscountPromotionConfig,
} from "@/lib/product-promotions/product-promotion.validation";
import "@/lib/registerModels";
import { ProductDiscountPromotion } from "@/models/ProductDiscountPromotion";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

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

    const existing = await ProductDiscountPromotion.findById(id)
      .select({ redemptionCount: 1, createdBy: 1 })
      .lean<{ redemptionCount?: number }>();

    if (!existing) {
      return NextResponse.json(
        { error: "Product discount promotion not found." },
        { status: 404 },
      );
    }

    const body = (await request.json()) as ProductDiscountPromotionPayload;
    const products = await getProductDiscountSnapshots(body.productIds);
    const normalizedConfig = normalizeProductDiscountPromotionPayload(
      body,
      products,
      existing.redemptionCount ?? 0,
    );
    const validationError =
      validateProductDiscountPromotionConfig(normalizedConfig);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const promotion = await ProductDiscountPromotion.findByIdAndUpdate(
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
            : "Failed to update product discount promotion.",
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

    const promotion = await ProductDiscountPromotion.findByIdAndDelete(
      id,
    ).lean();

    if (!promotion) {
      return NextResponse.json(
        { error: "Product discount promotion not found." },
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
            : "Failed to delete product discount promotion.",
      },
      { status: 500 },
    );
  }
}
