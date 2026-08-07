import "@/lib/registerModels";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { ModifierGroupTemplate } from "@/models/ModifierGroupTemplate";
import { Product } from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/getAuth";
import { getValidObjectId } from "@/helper/getValidObjectIds";
import {
  getForbiddenError,
  getInternalServerError,
  getInvalidIdError,
  getNotFoundError,
} from "@/lib/getApiError";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import { withRateLimit } from "@/lib/rateLimit";

/**
 * POST /api/modifier-group-templates/[id]/propagate
 *
 * Syncs the latest template data to ALL products that reference this template
 * via `modifierGroups.templateId`. Only template-controlled fields are updated;
 * product-specific fields (_id, isMain, linkedToGroupId, position) are preserved.
 *
 * This is an opt-in, admin-initiated action — local overrides (custom prices,
 * labels, removed items) will be replaced with the current template data.
 */

async function _POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const superadmin = await requireSuperAdmin(request);

    if (!canAccess(superadmin.role, "modifier-groups.update")) {
      return getForbiddenError();
    }

    const { id } = await context.params;

    if (!getValidObjectId(id)) {
      return getInvalidIdError();
    }

    const templateId = new mongoose.Types.ObjectId(id);

    // Fetch the current template
    const template = await ModifierGroupTemplate.findById(templateId);
    if (!template) {
      return getNotFoundError("Template not found");
    }

    // Find all products that reference this template
    const products = await Product.find({
      "modifierGroups.templateId": templateId,
    });

    if (products.length === 0) {
      return NextResponse.json(
        {
          data: {
            updatedCount: 0,
            failedCount: 0,
            message: "No products reference this template",
          },
        },
        { status: 200 },
      );
    }

    // Build the template items array (same shape as ModifierItemSchema)
    const templateItems = template.items.map(
      (
        item: {
          product: mongoose.Types.ObjectId;
          label?: string | null;
          price?: number | null;
          snapshotName?: string | null;
          snapshotPrice?: number | null;
          position?: number;
        },
        idx: number,
      ) => ({
        product: item.product,
        label: item.label ?? null,
        price: item.price ?? null,
        snapshotName: item.snapshotName ?? null,
        snapshotPrice: item.snapshotPrice ?? null,
        position: item.position ?? idx + 1,
      }),
    );

    const templateMaxQty =
      template.maxQty ?? Math.max(template.minSelect, template.maxSelect);

    let updatedCount = 0;
    let failedCount = 0;
    const failedProductIds: string[] = [];

    // Update each product's matching modifier groups
    for (const product of products) {
      try {
        let changed = false;

        for (const group of product.modifierGroups) {
          if (group.templateId?.toString() !== id) continue;

          // Overwrite template-controlled fields; preserve product-specific fields
          group.name = template.name;
          group.required = template.required;
          group.minSelect = template.minSelect;
          group.maxSelect = template.maxSelect;
          group.maxQty = templateMaxQty;
          group.items = templateItems.map(
            (item: (typeof templateItems)[number]) => ({ ...item }),
          );
          changed = true;
        }

        if (changed) {
          await product.save();
          updatedCount++;
        }
      } catch {
        failedCount++;
        failedProductIds.push(product._id.toString());
      }
    }

    return NextResponse.json(
      {
        data: {
          updatedCount,
          failedCount,
          failedProductIds,
          message:
            failedCount > 0
              ? `Synced ${updatedCount} product(s), ${failedCount} failed`
              : `Successfully synced ${updatedCount} product(s)`,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return getInternalServerError(
      error,
      "Failed to propagate template changes to products",
    );
  }
}

export const POST = withRateLimit(_POST, "write");
