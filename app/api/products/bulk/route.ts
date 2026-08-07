import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import "@/lib/registerModels";
import { requireSuperAdmin } from "@/lib/getAuth";
import { getAPIError } from "@/lib/getApiError";
import { withRateLimit } from "@/lib/rateLimit";

// Validates that at least one updatable field is provided
const bulkUpdateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "At least one product ID is required"),
  updates: z
    .object({
      category: z.string().optional(),
      subcategory: z.string().nullable().optional(),
      price: z.number().min(0).nullable().optional(),
      isActive: z.boolean().optional(),
      isComingSoon: z.boolean().optional(),
      goLiveDate: z.string().nullable().optional(),
      isOnlineExclusive: z.boolean().optional(),
      isPopular: z.boolean().optional(),
      isSignature: z.boolean().optional(),
    })
    .refine(
      (u) => Object.keys(u).length > 0,
      "At least one field must be provided in updates",
    ),
});

/**
 * PUT /api/products/bulk
 * Bulk-update shared attributes across multiple products at once.
 * Only the fields present in `updates` are applied — omitted fields are left untouched.
 */
async function _PUT(request: NextRequest) {
  try {
    await connectDB();
    await requireSuperAdmin(request);

    const body = await request.json();
    const { ids, updates } = bulkUpdateSchema.parse(body);

    // Build the $set payload — only include fields that were explicitly sent
    const $set: Record<string, unknown> = {};
    if (updates.category !== undefined) $set.category = updates.category;
    if (updates.subcategory !== undefined) $set.subcategory = updates.subcategory || null;
    if (updates.price !== undefined) $set.price = updates.price;
    if (updates.isActive !== undefined) $set.isActive = updates.isActive;
    // Resolve goLiveDate first — it affects how isComingSoon is computed
    if (updates.goLiveDate !== undefined) {
      $set.goLiveDate = updates.goLiveDate ? new Date(updates.goLiveDate) : null;
    }

    if (updates.isComingSoon !== undefined) {
      $set.isComingSoon = updates.isComingSoon;
      if (updates.goLiveDate === undefined) {
        // No explicit goLiveDate provided — clear it to prevent the single-product
        // edit route from re-enabling coming-soon based on a stale date
        $set.goLiveDate = null;
      }
    }
    if (updates.isOnlineExclusive !== undefined) $set.isOnlineExclusive = updates.isOnlineExclusive;
    if (updates.isPopular !== undefined) $set.isPopular = updates.isPopular;
    if (updates.isSignature !== undefined) $set.isSignature = updates.isSignature;

    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { $set },
    );

    return NextResponse.json(
      {
        success: true,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        
        { error: "Validation failed", details: error.flatten() },
        { status: 400 },
      );
    }
    return getAPIError(error, 500, { fallbackMessage: "Failed to bulk update products" });
  }
}

export const PUT = withRateLimit(_PUT, "write");
