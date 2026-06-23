/**
 * ADMIN ACTIVITY LOGS API
 *
 * GET /api/admin/activity-logs
 *
 * Returns paginated activity logs with filtering options.
 * Superadmin/cashier can view all logs; regular admins see only their branch.
 */

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/getAuth";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import { ActivityLog } from "@/models/ActivityLog";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const staff = await requireAdmin(request);

    if (!canAccess(staff.role, "orders.read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)),
    );
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};

    // Branch scoping: superadmin/cashier can filter by branch or see all
    // Regular admins only see their branch
    if (
      staff.role === "superadmin" ||
      staff.role === "cashier"
    ) {
      const branchId = searchParams.get("branchId");
      if (branchId && mongoose.Types.ObjectId.isValid(branchId)) {
        filter.branchId = new mongoose.Types.ObjectId(branchId);
      }
    } else {
      // Regular admin: only their assigned branch
      if (staff.branch) {
        filter.branchId = new mongoose.Types.ObjectId(staff.branch);
      }
    }

    // Optional filters
    const actorType = searchParams.get("actorType");
    if (actorType && ["customer", "staff", "system", "webhook"].includes(actorType)) {
      filter["actor.actorType"] = actorType;
    }

    const category = searchParams.get("category");
    if (category) {
      filter.category = category;
    }

    const action = searchParams.get("action");
    if (action) {
      filter.action = { $regex: action, $options: "i" };
    }

    const customerId = searchParams.get("customerId");
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      filter["actor.customerId"] = new mongoose.Types.ObjectId(customerId);
    }

    const staffId = searchParams.get("staffId");
    if (staffId && mongoose.Types.ObjectId.isValid(staffId)) {
      filter["actor.staffId"] = new mongoose.Types.ObjectId(staffId);
    }

    const orderId = searchParams.get("orderId");
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      filter["target.entityId"] = new mongoose.Types.ObjectId(orderId);
    }

    // Date range
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        (filter.createdAt as Record<string, unknown>).$gte = new Date(dateFrom);
      }
      if (dateTo) {
        (filter.createdAt as Record<string, unknown>).$lte = new Date(dateTo);
      }
    }

    // Execute query
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    // Populate actor references
    const customerIds = logs
      .map((l) => l.actor?.customerId)
      .filter((id): id is mongoose.Types.ObjectId => !!id);
    const staffIds = logs
      .map((l) => l.actor?.staffId)
      .filter((id): id is mongoose.Types.ObjectId => !!id);
    const branchIds = logs
      .map((l) => l.branchId)
      .filter((id): id is mongoose.Types.ObjectId => !!id);

    const [customers, staffMembers, branches] = await Promise.all([
      customerIds.length > 0
        ? import("@/models/User").then(({ User }) =>
            User.find({ _id: { $in: customerIds } }).lean(),
          )
        : Promise.resolve([]),
      staffIds.length > 0
        ? import("@/models/Staff").then(({ default: StaffModel }) =>
            StaffModel.find({ _id: { $in: staffIds } }).lean(),
          )
        : Promise.resolve([]),
      branchIds.length > 0
        ? import("@/models/Branch").then(({ Branch }) =>
            Branch.find({ _id: { $in: branchIds } }).lean(),
          )
        : Promise.resolve([]),
    ]);

    const customerMap = new Map(
      customers.map((c: { _id: mongoose.Types.ObjectId; [key: string]: unknown }) => [c._id.toString(), c]),
    );
    const staffMap = new Map(
      staffMembers.map((s: { _id: mongoose.Types.ObjectId; [key: string]: unknown }) => [s._id.toString(), s]),
    );
    const branchMap = new Map(
      branches.map((b: { _id: mongoose.Types.ObjectId; [key: string]: unknown }) => [b._id.toString(), b]),
    );

    const enrichedLogs = logs.map((log) => ({
      ...log,
      _id: log._id.toString(),
      actor: {
        ...log.actor,
        customerId: log.actor?.customerId?.toString(),
        staffId: log.actor?.staffId?.toString(),
        customerName: log.actor?.customerId
          ? (() => {
              const c = customerMap.get(log.actor.customerId.toString());
              return c ? (c as any).name : undefined;
            })()
          : undefined,
        staffName: log.actor?.staffId
          ? (() => {
              const s = staffMap.get(log.actor.staffId.toString());
              return s
                ? `${(s as any).firstName} ${(s as any).lastName}`
                : undefined;
            })()
          : undefined,
      },
      branchId: log.branchId?.toString(),
      branchName: log.branchId
        ? (branchMap.get(log.branchId.toString()) as any)?.name
        : undefined,
      target: {
        ...log.target,
        entityId: log.target.entityId.toString(),
      },
    }));

    return NextResponse.json({
      logs: enrichedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/activity-logs error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch logs",
      },
      { status: 500 },
    );
  }
}
