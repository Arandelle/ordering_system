import {
  getSalesData,
  getTopProducts,
  resolveDashboardFilters,
  type DashboardRange,
} from "@/services/admin/dashboard.service";
import { requireAdmin } from "@/lib/getAuth";
import { NextRequest, NextResponse } from "next/server";
import { canAccess } from "@/lib/roleBasedAccessCtrl";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!canAccess(admin.role, "dashboard.read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const range = (req.nextUrl.searchParams.get("range") ??
      "week") as DashboardRange;
    const requestedBranchId = req.nextUrl.searchParams.get("branchId");
    const filters = resolveDashboardFilters(admin, requestedBranchId);

    const [salesData, topProducts] = await Promise.all([
      getSalesData(range, filters),
      getTopProducts(range, filters),
    ]);

    return NextResponse.json({ salesData, topProducts });
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
