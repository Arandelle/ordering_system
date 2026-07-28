import { connectDB } from "@/lib/mongodb";
import { getAPIError } from "@/lib/getApiError";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { auth } from "@/lib/auth";

/**
 * POST /api/customer/account/restore
 *
 * Restores a soft-deleted customer account within the 30-day retention period.
 *
 * Since the customer cannot log in (blocked by auth hook), this endpoint:
 * 1. Finds the user by email and verifies the account is soft-deleted
 * 2. Temporarily unsets isDeleted to allow Better Auth sign-in
 * 3. Verifies credentials via signInEmail (password check + session creation)
 * 4. On success: clears all deletion fields — account fully restored
 * 5. On failure: re-sets isDeleted — no change to account state
 *
 * This endpoint does NOT require authentication (the user is locked out).
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return getAPIError("Email and password are required", 400);
    }

    // Find the user by email
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).lean();

    if (!user) {
      return getAPIError("No account found with this email", 404);
    }

    if (!user.isDeleted || !user.scheduledDeletionAt) {
      return getAPIError("This account is not scheduled for deletion", 400);
    }

    // Check if retention period has expired
    if (new Date() > user.scheduledDeletionAt) {
      return getAPIError(
        "The retention period has expired. This account cannot be restored.",
        410
      );
    }

    const userId = user._id.toString();

    // Temporarily allow sign-in by unsetting isDeleted
    await User.findByIdAndUpdate(userId, { isDeleted: false });

    try {
      // Verify credentials and create a session via Better Auth
      await auth.api.signInEmail({
        body: { email: email.trim().toLowerCase(), password },
      });

      // Sign-in succeeded — credentials are valid
      // Fully restore the account
      await User.findByIdAndUpdate(userId, {
        isDeleted: false,
        deletedAt: null,
        scheduledDeletionAt: null,
        deletionReason: null,
      });

      return NextResponse.json({
        success: true,
        message: "Account restored successfully. You are now signed in.",
      });
    } catch {
      // Sign-in failed — re-set isDeleted to keep the account soft-deleted
      await User.findByIdAndUpdate(userId, { isDeleted: true });

      return getAPIError(
        "Invalid password. Please check your credentials and try again.",
        401
      );
    }
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to restore account",
    });
  }
}
