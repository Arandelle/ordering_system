import { requireAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ArchivedUser } from "@/models/ArchivedUser";
import { buildPaginationMeta, parseRequestQuery } from "@/utils/query-helpers";
import { getAPIError } from "@/lib/getApiError";

/**
 * GET /api/admin/customers/archived
 * Returns paginated list of permanently deleted (archived) customer accounts.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await requireAdmin(request);

    const { page, limit, skip, match } = parseRequestQuery(request, {
      searchFields: ["firstName", "lastName", "email", "phone"],
      defaultLimit: 10,
      maxLimit: 50,
    });

    const [data, total] = await Promise.all([
      ArchivedUser.find(match, { authAccounts: 0 })
        .sort({ archivedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ArchivedUser.countDocuments(match),
    ]);

    return NextResponse.json(
      {
        data,
        pagination: buildPaginationMeta(total, page, limit),
      },
      { status: 200 },
    );
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to fetch archived customers",
    });
  }
}
