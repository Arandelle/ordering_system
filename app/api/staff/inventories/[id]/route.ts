import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Inventory } from "@/models/Inventory";
import z from "zod";
import { requireAdmin } from "@/lib/getAuth";

const updateInventorySchema = z
  .object({
    quantity: z.coerce.number().min(0).optional(),
    reorderLevel: z.coerce.number().min(0).optional(),
  })
  .refine((data) => data.quantity != null || data.reorderLevel != null, {
    message: "At least one field must be provided",
  });

type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const staff = await requireAdmin(req);

    const branchId = staff.branch as string;
    const staffId = staff.id as string;

    if (!branchId) {
      return NextResponse.json(
        { error: "No branch assigned" },
        { status: 403 },
      );
    }

    // Get Product id from the params
    const { id: productId } = await context.params;
    const body = await req.json();
    const parsed = updateInventorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { quantity, reorderLevel } = parsed.data;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    // 3. Build update object (only update provided fields)
    const updateData: Partial<UpdateInventoryInput> & {
      updatedBy: string;
    } = {
      updatedBy: staffId,
    };

    if (quantity != null) updateData.quantity = quantity;
    if (reorderLevel != null) updateData.reorderLevel = reorderLevel;

    // 4. Update (or create if missing)
    const inventory = await Inventory.findOneAndUpdate(
      {
        productId: productId,
        branchId: branchId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        upsert: true,
      },
    );

    return NextResponse.json({
      message: "Inventory updated successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("UPDATE INVENTORY ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 },
    );
  }
}
