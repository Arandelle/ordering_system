import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { requireBetterAuth } from "@/lib/getAuth";
import { queryOrders } from "@/lib/orders/orderService";
import { parseRequestQuery } from "@/lib/query-helpers";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const customer = await requireBetterAuth();

    const { page, limit, skip, sort, match } = parseRequestQuery(request, {
      exactFields: ["status"],
      searchFields: [
        "paymentInfo.customerName",
        "paymentInfo.customerEmail",
        "paymentInfo.customerPhone",
        "status",
        "paymentInfo.referenceNumber",
      ],
      defaultLimit: 20,
      maxLimit: 50,
      defaultSort: { status: 1, createdAt: -1 },
    });

    const filter: Record<string, any> = { ...match, customerId: customer?._id };

    // ============================================
    // QUERY PARAMETERS
    // ============================================

    const result = await queryOrders({
      filter,
      page,
      limit,
      skip,
      sort,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "Unauthorized!") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
