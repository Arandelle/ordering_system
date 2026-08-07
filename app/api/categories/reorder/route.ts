import { getAPIError } from "@/lib/getApiError";
import { requireSuperAdmin } from "@/lib/getAuth";
import { handleReorderRequest } from "@/lib/reorder";
import { withRateLimit } from "@/lib/rateLimit";
import { Category } from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";

async function _PATCH(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    const { categories } = await request.json();
    const result = await handleReorderRequest(
      Category,
      categories,
      "Categories",
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to reorder categories",
    });
  }
}

export const PATCH = withRateLimit(_PATCH, "write");
