import { requireSuperAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { getValidObjectId } from "@/helper/getValidObjectIds";
import { getAPIError } from "@/lib/getApiError";

/**
 * PATCH /api/products/[id]/modifier-groups/[groupId]/items/reorder
 * Reorder items within a modifier group on a product.
 *
 * Items don't have _id (_id: false), so we identify them by their
 * `product` ObjectId reference (unique within a group — the selection
 * modal prevents duplicate products in the same group).
 *
 * Body: { items: [{ product: "objectId", position: 1 }, ...] }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> },
) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const { id: productId, groupId } = await params;
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return getAPIError("Items array is required and must not be empty", 400);
    }

    // Validate productId and groupId
    if (!getValidObjectId(productId)) {
      return getAPIError("Invalid product ID", 400);
    }
    if (!getValidObjectId(groupId)) {
      return getAPIError("Invalid group ID", 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return getAPIError("Product not found", 404);
    }

    const group = product.modifierGroups.find(
      (g: any) => g._id.toString() === groupId,
    );
    if (!group) {
      return getAPIError("Modifier group not found", 404);
    }

    // Validate each item: product ObjectId must be valid, position must be positive integer
    const validatedItems = items.map(
      ({
        product: itemProductId,
        position,
      }: {
        product: string;
        position: number;
      }) => {
        if (!getValidObjectId(itemProductId)) {
          return getAPIError(`Invalid item product ID: ${itemProductId}`, 400);
        }
        if (!Number.isInteger(position) || position < 1) {
          return getAPIError(
            `Invalid position for item ${itemProductId}: ${position}`,
            400,
          );
        }
        return { product: itemProductId, position };
      },
    );

    // Check for duplicate positions
    const positions = validatedItems.map((i: any) => i.position);
    if (new Set(positions).size !== positions.length) {
      return getAPIError("Duplicate positions detected", 400);
    }

    // Reorder: build new items array sorted by desired position, update position fields
    const sortedUpdates = validatedItems.sort(
      (a: any, b: any) => a.position - b.position,
    );
    const newItems = sortedUpdates.map((update: any) => {
      const existingItem = group.items.find(
        (item: any) => item.product.toString() === update.product,
      );
      if (!existingItem) {
        return getAPIError(
          `Item with product ${update.product} not found in group`,
          404,
        );
      }
      return { ...existingItem.toObject(), position: update.position };
    });

    group.items = newItems;
    await product.save();

    return NextResponse.json({
      success: "Modifier items reordered successfully!",
    });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to reoder modifier items",
    });
  }
}
