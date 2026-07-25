/**
 * PATCH /api/admin/notifications/[id]/read
 *
 * Marks a single notification as read by the authenticated staff member.
 * Idempotent — calling it on an already-read notification is a no-op.
 */

import { connectDB } from "@/lib/mongodb";
import "@/lib/registerModels";
import { requireAdmin } from "@/lib/getAuth";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import { NextRequest } from "next/server";
import { markAsRead } from "@/services/notification.service";
import {
  getAPIError,
  getForbiddenError,
  getInvalidIdError,
} from "@/lib/getApiError";
import { getValidObjectId } from "@/helper/getValidObjectIds";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const staff = await requireAdmin(request);

    if (!canAccess(staff.role, "notifications.read")) {
      return getForbiddenError();
    }

    const { id } = await params;

    if (!getValidObjectId(id)) {
      return getInvalidIdError("notification ID");
    }

    await markAsRead(id, staff._id.toString());

    return Response.json({ success: true });
  } catch (error: unknown) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to mark notification as read",
    });
  }
}
