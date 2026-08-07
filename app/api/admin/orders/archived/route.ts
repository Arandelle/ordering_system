/**
 * GET /api/admin/orders/archived
 *
 * Returns paginated list of soft-deleted (archived) orders.
 * Only superadmin can access this endpoint.
 */

import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/getAuth";
import { STAFF_ROLES } from "@/types/staff";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import { Order } from "@/models/Orders";
import { buildPaginationMeta, parseRequestQuery } from "@/utils/query-helpers";
import {
  getAPIError,
  getForbiddenError,
  getInternalServerError,
} from "@/lib/getApiError";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const admin = await requireAdmin(request);
    if (!canAccess(admin.role, "orders.delete")) {
      return getForbiddenError();
    }

    const { page, limit, skip, match } = parseRequestQuery(request, {
      searchFields: [
        "paymentInfo.firstName",
        "paymentInfo.lastName",
        "paymentInfo.customerEmail",
        "paymentInfo.referenceNumber",
        "branchSnapshot.name",
      ],
      defaultLimit: 20,
      maxLimit: 50,
    });

    // Only return soft-deleted orders, scoped to admin's branch (unless superadmin)
    const filter: Record<string, any> = {
      ...match,
      isDeleted: true,
    };

    if (admin.role !== STAFF_ROLES.SUPERADMIN) {
      if (!admin.branch) return getForbiddenError("No branch assigned");
      filter.branchId = admin.branch;
    }

    const [data, total] = await Promise.all([
      Order.find(filter)
        .select(
          "paymentInfo.firstName paymentInfo.lastName paymentInfo.referenceNumber paymentInfo.paymentMethod branchSnapshot.name status total.totalAmount fulfillmentType createdAt deletedAt",
        )
        .sort({ deletedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      data,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error("GET /api/admin/orders/archived error:", error);
    return getInternalServerError("Failed to fetch arachived orders");
  }
}
