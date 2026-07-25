/**
 * PATCH /api/admin/notifications/read-all
 *
 * Marks all unread notifications as read for the authenticated staff member.
 * Respects branch scoping — only affects notifications visible to this user.
 */

import { connectDB } from "@/lib/mongodb";
import "@/lib/registerModels";
import { requireAdmin } from "@/lib/getAuth";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import { NextRequest } from "next/server";
import { markAllAsRead } from "@/services/notification.service";
import { getAPIError, getForbiddenError } from "@/lib/getApiError";

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const staff = await requireAdmin(request);

    if (!canAccess(staff.role, "notifications.read")) {
      return getForbiddenError();
    }

    // Branch scoping: admin is locked to their branch,
    // superadmin/cashier use the branch selector (client passes branchId)
    const { searchParams } = new URL(request.url);
    const branchId =
      staff.role === "superadmin" || staff.role === "cashier"
        ? searchParams.get("branchId") ?? undefined
        : staff.branch?.toString();

    const modifiedCount = await markAllAsRead(
      staff._id.toString(),
      branchId,
    );

    return Response.json({ success: true, markedCount: modifiedCount });
  } catch (error: unknown) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to mark all as read",
    });
  }
}
