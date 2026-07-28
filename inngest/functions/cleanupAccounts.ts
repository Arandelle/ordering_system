import { inngest } from "../client";
import { runAccountCleanup } from "@/services/customer/account-cleanup.service";

/**
 * Daily account cleanup — runs at 3 AM Manila time.
 *
 * 1. Removes orphaned Account/Session records (user was manually deleted)
 * 2. Hard-deletes soft-deleted users past their 30-day retention period
 *    (moves them to the ArchivedUser collection)
 */
export const cleanupAccounts = inngest.createFunction(
  {
    id: "cleanup-accounts-daily",
    triggers: [{ cron: "TZ=Asia/Manila 0 3 * * *" }],
  },
  async ({ step }) => {
    const result = await step.run("run-account-cleanup", async () => {
      const cleanupResult = await runAccountCleanup();

      if (cleanupResult.errors.length > 0) {
        console.error(
          "[cleanup-accounts] Errors during cleanup:",
          cleanupResult.errors
        );
      }

      console.log("[cleanup-accounts] Completed:", {
        orphanedAccountsDeleted: cleanupResult.orphanedAccountsDeleted,
        orphanedSessionsDeleted: cleanupResult.orphanedSessionsDeleted,
        expiredUsersHardDeleted: cleanupResult.expiredUsersHardDeleted,
        errorCount: cleanupResult.errors.length,
      });

      return cleanupResult;
    });

    return result;
  }
);
