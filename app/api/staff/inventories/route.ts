import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { syncInventoryForBranch } from "@/services/admin/sync-inventory.service";
import { Product } from "@/models/Product";
import { Inventory } from "@/models/Inventory";
import { STOCK_STATUSES } from "@/types/inventory_types";
import { requireAdmin } from "@/lib/getAuth";
import "@/lib/registerModels";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import mongoose from "mongoose";
import { STAFF_ROLES } from "@/types/staff";

/**
 * GET /api/staff/inventories?branchId=<id>
 *
 * Returns all products with their inventory for the current staff member's
 * branch. Superadmins can pass `branchId` to view any branch; regular admins
 * are locked to their assigned branch.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const staff = await requireAdmin(req);

    if (!canAccess(staff.role, "inventories.read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);

    // Superadmins can choose a branch; regular admins are locked to their own
    let branchId = staff.branch;
    if (staff.role === STAFF_ROLES.SUPERADMIN) {
      const requestedBranch = searchParams.get("branchId");
      if (requestedBranch && mongoose.Types.ObjectId.isValid(requestedBranch)) {
        branchId = new mongoose.Types.ObjectId(requestedBranch);
      }
    }

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
        : {
            quantity: 20,
            reserved: 0,
            available: 20,
            reorderLevel: 10,
          };

      let status =
        invData.quantity === 0
          ? STOCK_STATUSES.OUT_OF_STOCK
          : invData.quantity <= invData.reorderLevel
            ? STOCK_STATUSES.LOW_STOCK
            : STOCK_STATUSES.IN_STOCK;

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
        available: invData.available,
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
