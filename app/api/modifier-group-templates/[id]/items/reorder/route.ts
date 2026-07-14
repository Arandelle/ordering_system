import { getAPIError } from "@/lib/getApiError";
import { requireSuperAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { ModifierGroupTemplate } from "@/models/ModifierGroupTemplate";
import { assertNonEmptyArray } from "@/utils/assertNonEmptyArray";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/modifier-group-templates/[id]/items/reorder
 * Reorder items within a modifier group template.
 * Body: { items: [{ id, position }] }
 * Since items in ModifierTemplateItemSchema have `_id: false`,
 * "id" is the array index (as a string) rather than a sub-document _id.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const { id: templateId } = await params;
    const { items } = await request.json();

    assertNonEmptyArray<{ id: string; position: number }>(
      items,
      "Items array is required and must not be empty",
    );

    // Template items use _id: false, so we reorder by index-based positions
    const template = await ModifierGroupTemplate.findById(templateId);
    if (!template) {
      return getAPIError("Template not found", 404);
    }

    // Validate: each item must have a valid index and position
    const validatedItems = items.map(
      ({ id: indexStr, position }: { id: string; position: number }) => {
        const index = Number(indexStr);
        if (
          !Number.isInteger(index) ||
          index < 0 ||
          index >= template.items.length
        ) {
          throw new Error(`Invalid item index: ${indexStr}`);
        }
        if (!Number.isInteger(position) || position < 1) {
          throw new Error(
            `Invalid position for item at index ${indexStr}: ${position}`,
          );
        }
        return { index, position };
      },
    );

    // Check for duplicate positions
    const positions = validatedItems.map((i) => i.position);
    if (new Set(positions).size !== positions.length) {
      throw new Error("Duplicate positions detected");
    }

    // Reorder the items array and update positions atomically
    const reordered = [...template.items];
    // Sort validatedItems by their desired position to build the new array
    const sortedUpdates = validatedItems.sort(
      (a, b) => a.position - b.position,
    );
    const newItems = sortedUpdates.map((update) => {
      const item = reordered[update.index];
      return { ...item.toObject(), position: update.position };
    });

    template.items = newItems;
    await template.save();

    return NextResponse.json({
      success: "Template items reordered successfully!",
    });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to reorder modifier products",
    });
  }
}
