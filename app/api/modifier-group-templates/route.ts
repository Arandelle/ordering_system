import "@/lib/registerModels";
import { connectDB } from "@/lib/mongodb";
import { ModifierGroupTemplate } from "@/models/ModifierGroupTemplate";
import { Product } from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/getAuth";
import { getAPIError } from "@/lib/getApiError";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import { withRateLimit } from "@/lib/rateLimit";
import { modifierItemSchema } from "@/types/modifier-zod";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const templateCreateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  required: z.boolean().default(true),
  minSelect: z.coerce.number().int().min(1).default(1),
  maxSelect: z.coerce.number().int().min(1).default(1),
  maxQty: z.coerce.number().int().min(1).optional(),
  items: z
    .array(modifierItemSchema)
    .min(1, "Template must have at least one item"),
});

// ─── GET ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/modifier-group-templates
 * List all modifier group templates with populated product references
 */
async function _GET(request: NextRequest) {
  try {
    await connectDB();

    const superadmin = await requireSuperAdmin(request);

    if (!canAccess(superadmin.role, "modifier-groups.read")) {
      return getAPIError("Forbidden", 403);
    }

    const templates = await ModifierGroupTemplate.aggregate([
      { $sort: { createdAt: -1 } },
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
                label: "$$item.label",
                price: "$$item.price",
                snapshotName: "$$item.snapshotName",
                snapshotPrice: "$$item.snapshotPrice",
                position: "$$item.position",
              },
            },
          },
        },
      },
      { $unset: "_modifierProducts" },
    ]);

    // Count products per template in a single query — avoids fragile $expr matching
    // on nested array fields which can silently fail on type mismatches.
    const productCounts = await Product.aggregate([
      { $unwind: "$modifierGroups" },
      { $match: { "modifierGroups.templateId": { $ne: null } } },
      {
        $group: {
          _id: "$modifierGroups.templateId",
          count: { $sum: 1 },
        },
      },
    ]);
    const countMap = new Map(
      productCounts.map((c) => [c._id.toString(), c.count]),
    );

    const normalized = templates.map((t) => ({
      ...t,
      _id: t._id?.toString(),
      productCount: countMap.get(t._id?.toString()) ?? 0,
      items: t.items?.map((item: any) => ({
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
    }));

    return NextResponse.json({ data: normalized }, { status: 200 });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to fetch modifier group templates",
    });
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/modifier-group-templates
 * Create a new reusable modifier group template
 */
async function _POST(request: NextRequest) {
  try {
    await connectDB();

    const superadmin = await requireSuperAdmin(request);

    if (!canAccess(superadmin.role, "modifier-groups.create")) {
      return getAPIError("Forbidden", 403);
    }

    const body = await request.json();
    const validated = templateCreateSchema.parse(body);

    const template = await ModifierGroupTemplate.create({
      name: validated.name,
      required: validated.required,
      minSelect: validated.minSelect,
      maxSelect: validated.maxSelect,
      maxQty: validated.maxQty ?? Math.max(validated.minSelect, validated.maxSelect),
      items: validated.items.map((item, idx) => ({
        product: item.product,
        label: item.label ?? null,
        price: item.price ?? null,
        snapshotName: item.snapshotName ?? item.label ?? null,
        snapshotPrice: item.snapshotPrice ?? null,
        position: item.position ?? idx + 1,
      })),
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch (error) {
    return getAPIError(error, 500, {
      fallbackMessage: "Failed to create modifier group template",
    });
  }
}

export const GET = withRateLimit(_GET, "api");
export const POST = withRateLimit(_POST, "write");
