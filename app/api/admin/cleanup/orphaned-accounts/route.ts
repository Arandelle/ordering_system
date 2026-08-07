import { requireAdmin } from "@/lib/getAuth";
import { getAPIError } from "@/lib/getApiError";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rateLimit";
import { runAccountCleanup } from "@/services/customer/account-cleanup.service";

/**
 * POST /api/admin/cleanup/orphaned-accounts
 *
 * Manually triggers the account cleanup process:
 * 1. Removes orphaned Account/Session records (user was deleted without cleanup)
 * 2. Hard-deletes soft-deleted users past their 30-day retention period
 *
 * Requires admin authentication.
 */
async function _POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const result = await runAccountCleanup();

    return NextResponse.json(
      {
        message: "Cleanup completed",
        ...result,
      },
      { status: 200 },
    );
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to run account cleanup",
    });
  }
}

// Destructive admin operation — limit to 30 req/min per IP
export const POST = withRateLimit(_POST, "write");
