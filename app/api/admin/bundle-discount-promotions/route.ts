import { requireAdmin } from "@/lib/getAuth";
import { getBundleDiscountSnapshots } from "@/lib/bundle-promotions/bundle-promotion.products";
import {
  normalizeBundleDiscountPromotionPayload,
  type BundleDiscountPromotionPayload,
  validateBundleDiscountPromotionConfig,
} from "@/lib/bundle-promotions/bundle-promotion.validation";
import { connectDB } from "@/lib/mongodb";
import { BundleDiscountPromotion } from "@/models/BundleDiscountPromotion";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await requireAdmin(request);

    const data = await BundleDiscountPromotion.find({})
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        data,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch list of bundle discount promotion",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const admin = await requireAdmin(request);

    const body = (await request.json()) as BundleDiscountPromotionPayload;
    const products = await getBundleDiscountSnapshots(
      body.productIds,
      body.productQuantities,
    );
    const normalizedConfig = normalizeBundleDiscountPromotionPayload(
      body,
      products,
    );
    const validationError =
      validateBundleDiscountPromotionConfig(normalizedConfig);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const [promotion] = await BundleDiscountPromotion.create([
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
            : "Failed to create bundle discount promotion",
      },
      { status: 500 },
    );
  }
}
