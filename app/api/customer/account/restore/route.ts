import { connectDB } from "@/lib/mongodb";
import { getAPIError } from "@/lib/getApiError";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { auth } from "@/lib/auth";
import { withRateLimit } from "@/lib/rateLimit";

/**
 * POST /api/customer/account/restore
 *
 * Restores a soft-deleted customer account within the 30-day retention period.
 * Supports both email/password and Google sign-in providers.
 *
 * Since the customer cannot log in (blocked by auth hooks), this endpoint:
 * 1. Finds the user by email and verifies the account is soft-deleted
 * 2. Temporarily unsets isDeleted to allow Better Auth sign-in
 *
 * For "email" provider (default):
 *   - Verifies credentials via signInEmail (password check + session creation)
 *   - On success: clears all deletion fields — account fully restored
 *   - On failure: re-sets isDeleted — no change to account state
 *
 * For "google" provider:
 *   - Prepares the account by unsetting isDeleted
 *   - Returns success — frontend initiates Google sign-in redirect
 *   - The auth after-hook finalizes the restore on successful Google callback
 *   - If Google sign-in is never completed, the cleanup service handles the
 *     incomplete restore when scheduledDeletionAt expires
 *
 * This endpoint does NOT require authentication (the user is locked out).
 */
async function _POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, provider = "email" } = await request.json();

    if (!email) {
      return getAPIError("Email is required", 400);
    }

    if (provider === "email" && !password) {
      return getAPIError("Password is required for email sign-in", 400);
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
        410,
      );
    }

    const userId = user._id.toString();

    // ── Google provider: prepare account for Google sign-in ──
    // Temporarily unset isDeleted so the auth after-hook can allow Google sign-in.
    // The after-hook detects restore-in-progress (isDeleted=false + deletion fields
    // still present) and finalizes the restore on successful callback.
    if (provider === "google") {
      await User.findByIdAndUpdate(userId, { isDeleted: false });

      return NextResponse.json({
        success: true,
        provider: "google",
        message: "Account prepared for Google sign-in. Please complete sign-in to restore your account.",
      });
    }

    // ── Email provider: verify password and restore immediately ──
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
        401,
      );
    }
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to restore account",
    });
  }
}

export const POST = withRateLimit(_POST, "write");
