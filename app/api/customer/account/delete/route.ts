import { connectDB } from "@/lib/mongodb";
import { requireBetterAuth } from "@/lib/getAuth";
import { getAPIError } from "@/lib/getApiError";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { Cart } from "@/models/Cart";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const RETENTION_DAYS = 30;

/**
 * POST /api/customer/account/delete
 *
 * Soft-deletes the authenticated customer's account.
 * - Flags the user with isDeleted + scheduledDeletionAt (30 days from now)
 * - Clears the customer's cart
 * - Revokes all active sessions
 *
 * Orders, reviews, and activity logs are preserved — they already
 * snapshot customer info and remain intact for historical records.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const customer = await requireBetterAuth(request);
    if (!customer) return getAPIError("Unauthorized", 401);

    // Check if already deleted
    if (customer.isDeleted) {
      return getAPIError("Account is already scheduled for deletion", 400);
    }

    const { reason } = await request.json().catch(() => ({ reason: null }));

    const now = new Date();
    const scheduledDeletionAt = new Date(
      now.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000
    );

    // Soft-delete the user account
    await User.findByIdAndUpdate(customer._id, {
      isDeleted: true,
      deletedAt: now,
      scheduledDeletionAt,
      deletionReason: reason || null,
    });

    // Clear the customer's cart
    await Cart.findOneAndDelete({ customerId: customer._id });

    // Revoke all active sessions for this user
    const requestHeaders = await headers();
    try {
      await auth.api.revokeOtherSessions({
        headers: requestHeaders,
      });
    } catch {
      // Non-critical — sessions will expire naturally
    }

    // Sign out the current session
    try {
      await auth.api.signOut({
        headers: requestHeaders,
      });
    } catch {
      // Non-critical — session will expire naturally
    }

    return NextResponse.json({
      success: true,
      scheduledDeletionAt: scheduledDeletionAt.toISOString(),
      retentionDays: RETENTION_DAYS,
    });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to delete account",
    });
  }
}
