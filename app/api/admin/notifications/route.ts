/**
 * GET /api/admin/notifications
 *
 * Returns paginated notifications visible to the authenticated staff member.
 * Branch-scoped admins only see their branch's notifications plus global ones.
 */

import { connectDB } from "@/lib/mongodb";
import "@/lib/registerModels";
import { requireAdmin } from "@/lib/getAuth";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import { NextRequest } from "next/server";
import { listNotifications } from "@/services/notification.service";
import { NotificationType } from "@/types/notification";
import { getAPIError, getForbiddenError } from "@/lib/getApiError";
import { parsePagination } from "@/utils/query-helpers";
import { withRateLimit } from "@/lib/rateLimit";

const VALID_TYPES: string[] = ["order", "reservation", "low_stock", "system"];

async function _GET(request: NextRequest) {
  try {
    await connectDB();
    const staff = await requireAdmin(request);

    if (!canAccess(staff.role, "notifications.read")) {
      return getForbiddenError();
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePagination(searchParams, { defaultLimit: 20, maxLimit: 50 });

    const type = searchParams.get("type") as NotificationType | null;
    if (type && !VALID_TYPES.includes(type)) {
      return getAPIError(
        `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
        400,
      );
    }

    // Branch scoping: admin is locked to their branch,
    // superadmin/cashier use the branch selector (client passes branchId)
    const branchId =
      staff.role === "superadmin" || staff.role === "cashier"
        ? searchParams.get("branchId") ?? undefined
        : staff.branch?.toString();

    const result = await listNotifications({
      userId: staff._id.toString(),
      branchId,
      type: type ?? undefined,
      page,
      limit,
    });

    return Response.json(result);
  } catch (error: unknown) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to fetch notifications",
    });
  }
}

export const GET = withRateLimit(_GET, "api");
