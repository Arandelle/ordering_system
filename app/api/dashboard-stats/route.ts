import {
  getDashboardStats,
  resolveDashboardFilters,
} from "@/services/admin/dashboard.service";
import { requireAdmin } from "@/lib/getAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const requestedBranchId = req.nextUrl.searchParams.get("branchId");
    const filters = resolveDashboardFilters(admin, requestedBranchId);

    const stats = await getDashboardStats(filters);

    return NextResponse.json(stats);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch dashboard data";
    const status =
      message === "Unauthorized!"
        ? 401
        : message === "No branch assigned"
          ? 403
          : message === "Invalid branch id"
            ? 400
            : 500;

    return NextResponse.json(
      { error: status === 500 ? "Failed to fetch dashboard data" : message },
      { status },
    );
  }
}
