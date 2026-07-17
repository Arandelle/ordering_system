import { getReportsData } from "@/services/admin/reports.service";
import {
  resolveDashboardFilters,
  parseDashboardPeriod,
} from "@/services/admin/dashboard.service";
import { requireAdmin } from "@/lib/getAuth";
import { NextRequest, NextResponse } from "next/server";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import { getAPIError } from "@/lib/getApiError";

/**
 * GET /api/admin/reports
 * Returns all report data: key metrics, trend, category sales, peak hours.
 * Supports the same period/branch query params as the dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!canAccess(admin.role, "reports.read")) {
      return getAPIError("Forbidden", 403);
    }

    const requestedBranchId = req.nextUrl.searchParams.get("branchId");
    const filters = resolveDashboardFilters(admin, requestedBranchId);
    const period = parseDashboardPeriod(req.nextUrl.searchParams);

    const data = await getReportsData(period, filters);

    return NextResponse.json(data);
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to fetch reports data",
    });
  }
}
