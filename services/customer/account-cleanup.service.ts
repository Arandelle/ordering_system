/**
 * ACCOUNT CLEANUP SERVICE
 *
 * Handles three cleanup tasks:
 * 1. Remove orphaned Account records (userId points to a non-existent user)
 * 2. Remove orphaned Session records (UserId points to a non-existent user)
 * 3. Hard-delete soft-deleted users past their retention period (move to ArchivedUser)
 *
 * Called by:
 * - Inngest cron job (daily at 3 AM Manila time)
 * - Admin API endpoint for manual trigger
 */

import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ArchivedUser } from "@/models/ArchivedUser";
import { Order } from "@/models/Orders";
import { Review } from "@/models/Review";
import Account from "@/models/Account";
import { Session } from "@/models/Session";
import mongoose from "mongoose";

/** Native MongoDB collections — bypass Mongoose type casting for delete ops */
function nativeAccountCollection() {
  return mongoose.connection.db!.collection("account");
}
function nativeSessionCollection() {
  return mongoose.connection.db!.collection("session");
}

export interface CleanupResult {
  orphanedAccountsDeleted: number;
  orphanedSessionsDeleted: number;
  expiredUsersHardDeleted: number;
  errors: string[];
}

/**
 * Remove Account and Session records whose userId no longer exists
 * in the user collection. This happens when a user is manually deleted
 * from MongoDB without going through the soft-delete flow.
 */
async function cleanupOrphanedAuthRecords(): Promise<{
  accountsDeleted: number;
  sessionsDeleted: number;
  errors: string[];
}> {
  const errors: string[] = [];

  // Get all valid user IDs from the user collection
  // Use String() to normalize both ObjectId and string types to plain strings
  const validUserIds = new Set(
    (await User.find({}, { _id: 1 }).lean()).map((u) => String(u._id))
  );

  console.log(`[cleanup] Found ${validUserIds.size} users in the user collection`);

  // Find and delete orphaned Account records
  let accountsDeleted = 0;
  try {
    const allAccounts = await Account.find({}).lean();
    console.log(`[cleanup] Found ${allAccounts.length} total accounts`);

    const orphanedAccounts = allAccounts
      .filter((acc) => !validUserIds.has(String(acc.userId)));

    console.log(`[cleanup] Found ${orphanedAccounts.length} orphaned accounts`);

    if (orphanedAccounts.length > 0) {
      const orphanedAccountIds = orphanedAccounts.map((acc) => acc._id);
      // Use native driver to avoid Mongoose casting _id from ObjectId to String
      const result = await nativeAccountCollection().deleteMany({
        _id: { $in: orphanedAccountIds },
      });
      accountsDeleted = result.deletedCount ?? 0;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Failed to clean orphaned accounts: ${message}`);
  }

  // Find and delete orphaned Session records
  let sessionsDeleted = 0;
  try {
    const allSessions = await Session.find({}).lean();
    console.log(`[cleanup] Found ${allSessions.length} total sessions`);

    const orphanedSessions = allSessions
      .filter((s) => !validUserIds.has(String(s.UserId)));

    console.log(`[cleanup] Found ${orphanedSessions.length} orphaned sessions`);

    if (orphanedSessions.length > 0) {
      const orphanedSessionIds = orphanedSessions.map((s) => s._id);
      // Use native driver to avoid Mongoose casting _id from ObjectId to String
      const result = await nativeSessionCollection().deleteMany({
        _id: { $in: orphanedSessionIds },
      });
      sessionsDeleted = result.deletedCount ?? 0;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Failed to clean orphaned sessions: ${message}`);
  }

  return { accountsDeleted, sessionsDeleted, errors };
}

/**
 * Hard-delete soft-deleted users whose retention period has expired.
 * Moves the full user snapshot to ArchivedUser, then removes from
 * the active user collection along with their auth records.
 */
async function hardDeleteExpiredUsers(): Promise<{
  deleted: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let deleted = 0;

  try {
    const now = new Date();

    // Find users past their scheduled deletion date.
    // Includes incomplete Google restores: isDeleted was temporarily set to false
    // by the restore endpoint, but the user never completed Google sign-in,
    // so deletedAt and scheduledDeletionAt are still present.
    const expiredUsers = await User.find({
      scheduledDeletionAt: { $lte: now },
      $or: [
        { isDeleted: true },
        { isDeleted: false, deletedAt: { $ne: null } },
      ],
    }).lean();

    for (const user of expiredUsers) {
      try {
        const userId = user._id.toString();

        // Check if already archived (idempotent — skip if exists)
        const alreadyArchived = await ArchivedUser.findOne({
          originalUserId: user._id,
        }).lean();
        if (alreadyArchived) {
          // Already archived but user doc still exists — just remove it
          await User.deleteOne({ _id: user._id });
          await nativeAccountCollection().deleteMany({ userId: user._id });
          await nativeSessionCollection().deleteMany({ UserId: userId });
          deleted++;
          continue;
        }

        // Gather stats before archiving
        const [totalOrders, totalReviews] = await Promise.all([
          Order.countDocuments({ customerId: user._id }),
          Review.countDocuments({ customerId: user._id }),
        ]);

        const orderTotalResult = await Order.aggregate([
          { $match: { customerId: user._id, status: "completed" } },
          {
            $group: {
              _id: null,
              total: { $sum: "$total.totalAmount" },
            },
          },
        ]);
        const totalSpent = orderTotalResult[0]?.total ?? 0;

        // Fetch auth accounts for archival
        const authAccounts = await Account.find({ userId }).lean();

        // Create archive entry
        await ArchivedUser.create({
          originalUserId: user._id,
          email: (user as Record<string, unknown>).email,
          name: (user as Record<string, unknown>).name,
          firstName: (user as Record<string, unknown>).firstName,
          lastName: (user as Record<string, unknown>).lastName,
          phone: (user as Record<string, unknown>).phone,
          image: (user as Record<string, unknown>).image,
          publicId: (user as Record<string, unknown>).publicId,
          emailVerified: (user as Record<string, unknown>).emailVerified,
          termsAcceptedAt: user.termsAcceptedAt,
          shippingAddress: user.shippingAddress,
          authAccounts: authAccounts.map((acc) => ({
            _id: acc._id,
            accountId: acc.accountId,
            providerId: acc.providerId,
            password: acc.password,
            createdAt: acc.createdAt,
            updatedAt: acc.updatedAt,
          })),
          deletedAt: user.deletedAt,
          scheduledDeletionAt: user.scheduledDeletionAt,
          deletionReason: user.deletionReason,
          stats: { totalOrders, totalSpent, totalReviews },
        });

        // Remove from active collections
        await Promise.all([
          User.deleteOne({ _id: user._id }),
          nativeAccountCollection().deleteMany({ userId: user._id }),
          nativeSessionCollection().deleteMany({ UserId: userId }),
        ]);

        deleted++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(
          `Failed to hard-delete user ${(user as Record<string, unknown>).email}: ${message}`
        );
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Failed to query expired users: ${message}`);
  }

  return { deleted, errors };
}

/**
 * Run all cleanup tasks and return a summary.
 * Safe to call from cron or admin API — idempotent and error-tolerant.
 */
export async function runAccountCleanup(): Promise<CleanupResult> {
  await connectDB();

  const [orphanResult, hardDeleteResult] = await Promise.all([
    cleanupOrphanedAuthRecords(),
    hardDeleteExpiredUsers(),
  ]);

  return {
    orphanedAccountsDeleted: orphanResult.accountsDeleted,
    orphanedSessionsDeleted: orphanResult.sessionsDeleted,
    expiredUsersHardDeleted: hardDeleteResult.deleted,
    errors: [...orphanResult.errors, ...hardDeleteResult.errors],
  };
}
