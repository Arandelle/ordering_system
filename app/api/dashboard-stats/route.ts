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
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats",
      },
      { status: 500 },
    );
  }
}
