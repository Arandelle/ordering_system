import { requireAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { ArchivedUser } from "@/models/ArchivedUser";
import { NextRequest, NextResponse } from "next/server";
import { getValidObjectId } from "@/helper/getValidObjectIds";
import { getAPIError } from "@/lib/getApiError";

/**
 * GET /api/admin/customers/archived/[id]
 * Returns a single archived customer record by its document ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    await requireAdmin(request);

    const { id } = await params;

    if (!getValidObjectId(id)) {
      return getAPIError("Invalid archived customer ID", 400);
    }

    const archived = await ArchivedUser.findById(id, { authAccounts: 0 }).lean();
    if (!archived) {
      return getAPIError("Archived customer not found", 404);
    }

    return NextResponse.json({ data: archived }, { status: 200 });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to fetch archived customer",
    });
  }
}
