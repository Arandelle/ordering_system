import { requireAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { PromoCardPurchase } from "@/models/PromoCardPurchase";
import { NextRequest, NextResponse } from "next/server";
import "@/lib/registerModels";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await requireAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit") || 10)),
    );
    const skip = (page - 1) * limit;

    const [data, total, paidCount, pendingCount, paidRevenueResult] =
      await Promise.all([
        PromoCardPurchase.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        PromoCardPurchase.countDocuments({}),
        PromoCardPurchase.countDocuments({ status: "paid" }),
        PromoCardPurchase.countDocuments({ status: "pending" }),
        PromoCardPurchase.aggregate<{ total: number }>([
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$purchasePrice" } } },
        ]),
      ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        data,
        stats: {
          total,
          paid: paidCount,
          pending: pendingCount,
          paidRevenue: paidRevenueResult[0]?.total ?? 0,
        },
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch promo card purchases.",
      },
      { status: 500 },
    );
  }
}
