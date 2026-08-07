/**
 * GET /api/admin/notifications/unread-count
 *
 * Returns the count of unread notifications for the authenticated staff member.
 * Lightweight endpoint used by the header badge for polling.
 */

import { connectDB } from "@/lib/mongodb";
import "@/lib/registerModels";
import { requireAdmin } from "@/lib/getAuth";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import { NextRequest, NextResponse } from "next/server";
import { getUnreadCount } from "@/services/notification.service";
import { getAPIError, getForbiddenError } from "@/lib/getApiError";
import { STAFF_ROLES } from "@/types/staff";
import { withRateLimit } from "@/lib/rateLimit";

async function _GET(request: NextRequest) {
  try {
    await connectDB();
    const staff = await requireAdmin(request);

    if (!canAccess(staff.role, "notifications.read")) {
      return getForbiddenError();
    }

    const userId = staff._id.toString();

    // Branch scoping: admin is locked to their branch,
    // superadmin/cashier use the branch selector (client passes branchId)
    const { searchParams } = new URL(request.url);
    const branchId =
      staff.role === STAFF_ROLES.SUPERADMIN || staff.role === STAFF_ROLES.CASHIER
        ? searchParams.get("branchId") ?? undefined
        : staff.branch?.toString();

    const count = await getUnreadCount(userId, branchId);

    return NextResponse.json({ unreadCount: count });
  } catch (error: unknown) {
    console.error("GET /api/admin/notifications/unread-count error:", error);
    return getAPIError(error, 500, {fallbackMessage: "Failed to fetch unread count"});
  }
}

export const GET = withRateLimit(_GET, "api");
