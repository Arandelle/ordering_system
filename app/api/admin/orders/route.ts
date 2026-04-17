/**
 * GET /api/orders
 *
 * Fetch all orders with smart sorting using STATUS_PRIORITY
 * Uses orderConstants.ts for consistent behavior with frontend
 */

import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/getAuth";
import { STAFF_ROLES } from "@/types/staff";
import { queryOrders } from "@/lib/orders/orderService";
import { parseRequestQuery } from "@/lib/query-helpers";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const admin = await requireAdmin(request);
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
      maxLimit: 20,
      defaultSort: { status: 1, createdAt: -1 },
    });

    const filter: Record<string, any> = { ...match };

    if (admin.role !== STAFF_ROLES.SUPERADMIN) {
      if (!admin.branch)
        return NextResponse.json(
          { error: "No branch assigned" },
          { status: 403 },
        );
      filter.branchId = admin.branch;
    }

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
