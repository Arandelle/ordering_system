import { getAPIError } from "@/lib/getApiError";
import { requireSuperAdmin } from "@/lib/getAuth";
import { handleReorderRequest } from "@/lib/reorder";
import { withRateLimit } from "@/lib/rateLimit";
import { SubCategory } from "@/models/SubCategory";
import { NextRequest, NextResponse } from "next/server";

async function _PATCH(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    const { subcategories } = await request.json();
    const result = await handleReorderRequest(
      SubCategory,
      subcategories,
      "Subcategories",
    );
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failded to reorder subcategories",
    });
  }
}

export const PATCH = withRateLimit(_PATCH, "write");
