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
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await requireAdmin(request);

    const data = await ProductDiscountPromotion.find({})
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch product discount promotions.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const admin = await requireAdmin(request);

    const body = (await request.json()) as ProductDiscountPromotionPayload;
    const products = await getProductDiscountSnapshots(body.productIds);
    const normalizedConfig = normalizeProductDiscountPromotionPayload(
      body,
      products,
    );
    const validationError =
      validateProductDiscountPromotionConfig(normalizedConfig);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const [promotion] = await ProductDiscountPromotion.create([
      {
        ...normalizedConfig,
        createdBy: admin._id,
      },
    ]);

    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create product discount promotion.",
      },
      { status: 500 },
    );
  }
}
  