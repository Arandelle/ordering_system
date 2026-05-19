import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { syncInventoryForBranch } from "@/services/admin/sync-inventory.service";
import { Product } from "@/models/Product";
import { Inventory } from "@/models/Inventory";
import { STOCK_STATUSES } from "@/types/inventory_types";
import { requireAdmin } from "@/lib/getAuth";
import "@/lib/registerModels";

/**
 * POST /api/inventory/sync
 * Body: { branchId: string }
 */

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const staff = await requireAdmin(req);

    const branchId = staff.branch;

    if (!branchId) {
      return NextResponse.json(
        { error: "branchId is required" },
        { status: 400 },
      );
    }

    const productCount = await Product.countDocuments();
    const inventoryCount = await Inventory.countDocuments({
      branchId: branchId,
    });

    if (inventoryCount < productCount) {
      await syncInventoryForBranch(branchId);
    }

    // fetch data
    const products = await Product.find().populate("category", "name");
    const inventories = await Inventory.find({ branchId: branchId });

    const inventoryMap = new Map(
      inventories.map((inv) => [inv.productId.toString(), inv]),
    );

    const result = products.map((product) => {
      const inv = inventoryMap.get(product._id.toString());

      // Convert to plain object - includes virtuals if toObject : { virtuals: true}
      const invData = inv
        ? inv.toObject()
        : { quantity: 0, reserved: 0, available: 0, reorderLevel: 0 };

      let status = STOCK_STATUSES.IN_STOCK;

      if (invData.quantity === 0) status = STOCK_STATUSES.OUT_OF_STOCK;
      else if (invData.quantity <= invData.reorderLevel)
        status = STOCK_STATUSES.LOW_STOCK;

      return {
        id: product._id.toString(),
        image: {
          url: product.image.url,
          public_id: product.image.public_id,
        },
        name: product.name,
        price: product.price,
        category: product.category?.name ?? "Uncategorized",
        status,

        quantity: invData.quantity,
        reserved: invData.reserved,
        available: invData.available, // comes from virtual automatically
        reorderLevel: invData.reorderLevel,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("SYNC ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to sync inventory",
      },
      { status: 500 },
    );
  }
}
