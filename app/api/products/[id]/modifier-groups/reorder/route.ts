import { getAPIError } from "@/lib/getApiError";
import { requireSuperAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { reorderSubDocuments } from "@/lib/reorder";
import { Product } from "@/models/Product";
import { isValidNonEmptyArray } from "@/utils/assertNonEmptyArray";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/products/[id]/modifier-groups/reorder
 * Reorder modifier groups within a product.
 * Body: { groups: [{ id, position }] }
 * "id" is the sub-document _id of the modifier group.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const { id: productId } = await params;
    const { groups } = await request.json();

    if (!isValidNonEmptyArray) {
      return getAPIError("Groups array is required and must not be empty", 400);
    }

    await reorderSubDocuments(
      Product,
      productId,
      "modifierGroups",
      groups,
      "Modifier groups",
    );

    return NextResponse.json({
      success: "Modifier groups reordered successfully!",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to reorder modifier groups";
    const status =
      message.includes("required") ||
      message.includes("Invalid") ||
      message.includes("not found")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
