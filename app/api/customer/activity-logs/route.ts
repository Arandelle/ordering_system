/**
 * CUSTOMER ACTIVITY LOGS API
 *
 * GET /api/customer/activity-logs
 *
 * Returns the authenticated customer's own activity logs
 * (order creation, cancellation, etc.).
 */

import { connectDB } from "@/lib/mongodb";
import { requireBetterAuth } from "@/lib/getAuth";
import { ActivityLog } from "@/models/ActivityLog";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const customer = await requireBetterAuth(request);

    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)),
    );
    const skip = (page - 1) * limit;

    // Only return logs where this customer is the actor
    const filter: Record<string, unknown> = {
      "actor.customerId": customer._id,
    };

    // Optional category filter
    const category = searchParams.get("category");
    if (category) {
      filter.category = category;
    }

    // Optional order filter
    const orderId = searchParams.get("orderId");
    if (orderId) {
      filter["target.entityId"] = orderId;
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

    const enrichedLogs = logs.map((log) => ({
      ...log,
      _id: log._id.toString(),
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
    console.error("GET /api/customer/activity-logs error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch logs",
      },
      { status: 500 },
    );
  }
}
