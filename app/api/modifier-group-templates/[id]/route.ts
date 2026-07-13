import "@/lib/registerModels";
import { connectDB } from "@/lib/mongodb";
import { ModifierGroupTemplate } from "@/models/ModifierGroupTemplate";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/getAuth";
import { getValidObjectId } from "@/helper/getValidObjectIds";
import { getAPIError } from "@/lib/getApiError";
import { canAccess } from "@/lib/roleBasedAccessCtrl";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const modifierTemplateItemSchema = z.object({
  product: z.string().min(1, "Item must reference a product"),
  quantity: z.coerce.number().int().min(1).default(1),
  label: z.string().nullable().optional(),
  price: z.coerce.number().nullable().optional(),
  snapshotName: z.string().nullable().optional(),
  snapshotPrice: z.coerce.number().nullable().optional(),
});

const templateUpdateSchema = z.object({
  name: z.string().min(1, "Template name is required").optional(),
  required: z.boolean().optional(),
  minSelect: z.coerce.number().int().min(1).optional(),
  maxSelect: z.coerce.number().int().min(1).optional(),
  items: z
    .array(modifierTemplateItemSchema)
    .min(1, "Template must have at least one item")
    .optional(),
});

// ─── GET ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/modifier-group-templates/[id]
 * Fetch a single template with populated product references
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const superadmin = await requireSuperAdmin(request);

    if (!canAccess(superadmin.role, "modifier-groups.read")) {
      return getAPIError("Forbidden", 403);
    }

    const { id } = await context.params;

    if (!getValidObjectId(id)) {
      return getAPIError("Invalid template id", 400);
    }

    const [template] = await ModifierGroupTemplate.aggregate([
      { $match: { _id: { $toObjectId: id } } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "_modifierProducts",
        },
      },
      {
        $addFields: {
          items: {
            $map: {
              input: { $ifNull: ["$items", []] },
              as: "item",
              in: {
                product: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$_modifierProducts",
                        as: "p",
                        cond: { $eq: ["$$p._id", "$$item.product"] },
                      },
                    },
                    0,
                  ],
                },
                quantity: "$$item.quantity",
                label: "$$item.label",
                price: "$$item.price",
                snapshotName: "$$item.snapshotName",
                snapshotPrice: "$$item.snapshotPrice",
              },
            },
          },
        },
      },
      { $unset: "_modifierProducts" },
    ]);

    if (!template) {
      return getAPIError("Template not found", 404);
    }

    const normalized = {
      ...template,
      _id: template._id?.toString(),
      items: template.items?.map((item: any) => ({
        ...item,
        product: item.product
          ? {
              _id: item.product._id?.toString() || "",
              name: item.product.name || "",
              price: item.product.price ?? null,
              image: {
                url: item.product.image?.url || "",
                public_id: item.product.image?.public_id || "",
              },
              productType: item.product.productType || "solo",
            }
          : null,
      })),
    };

    return NextResponse.json({ data: normalized }, { status: 200 });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to fetch modifier group template",
    });
  }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────

/**
 * PUT /api/modifier-group-templates/[id]
 * Update an existing modifier group template
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const superadmin = await requireSuperAdmin(request);

    if (!canAccess(superadmin.role, "modifier-groups.update")) {
      return getAPIError("Forbidden", 403);
    }

    const { id } = await context.params;

    if (!getValidObjectId(id)) {
      return getAPIError("Invalid template id", 400);
    }

    const body = await request.json();
    const validated = templateUpdateSchema.parse(body);

    const updateFields: any = {};
    if (validated.name !== undefined) updateFields.name = validated.name;
    if (validated.required !== undefined)
      updateFields.required = validated.required;
    if (validated.minSelect !== undefined)
      updateFields.minSelect = validated.minSelect;
    if (validated.maxSelect !== undefined)
      updateFields.maxSelect = validated.maxSelect;
    if (validated.items !== undefined) {
      updateFields.items = validated.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        label: item.label ?? null,
        price: item.price ?? null,
        snapshotName: item.snapshotName ?? item.label ?? null,
        snapshotPrice: item.snapshotPrice ?? null,
      }));
    }

    const updated = await ModifierGroupTemplate.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true },
    );

    if (!updated) {
      return getAPIError("Template not found", 404);
    }

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to update modifier group template",
    });
  }
}

// ─── DELETE ────────────────────────────────────────────────────────────────────

/**
 * DELETE /api/modifier-group-templates/[id]
 * Delete a modifier group template
 * Note: Products that reference this template will keep their embedded data
 * but the templateId link becomes stale
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const superadmin = await requireSuperAdmin(request);

    if (!canAccess(superadmin.role, "modifier-groups.delete")) {
      return getAPIError("Forbidden", 403);
    }

    const { id } = await context.params;

    if (!getValidObjectId(id)) {
      return getAPIError("Invalid template id", 400);
    }

    const deleted = await ModifierGroupTemplate.findByIdAndDelete(id);

    if (!deleted) {
      return getAPIError("Template not found", 404);
    }

    return NextResponse.json(
      { message: "Modifier group template deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to delete modifier group template",
    });
  }
}
