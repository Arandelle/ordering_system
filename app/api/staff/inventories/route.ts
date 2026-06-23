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

    // Superadmins can choose a branch, view all, or fall back to their own branch
    let branchId: mongoose.Types.ObjectId | null = staff.branch
      ? new mongoose.Types.ObjectId(staff.branch)
      : null;

    const allBranches = staff.role === STAFF_ROLES.SUPERADMIN && !searchParams.get("branchId");

    if (staff.role === STAFF_ROLES.SUPERADMIN) {
      const requestedBranch = searchParams.get("branchId");
      if (requestedBranch && mongoose.Types.ObjectId.isValid(requestedBranch)) {
        branchId = new mongoose.Types.ObjectId(requestedBranch);
      }
    }

    // For non-superadmins, if they have no branch, return error
    if (!branchId && staff.role !== STAFF_ROLES.SUPERADMIN) {
      return NextResponse.json(
        { error: "branchId is required" },
        { status: 400 },
      );
    }

    const productCount = await Product.countDocuments();

    // Sync inventory for the selected branch (or all branches for superadmin "all" view)
    if (branchId) {
      const inventoryCount = await Inventory.countDocuments({ branchId });
      if (inventoryCount < productCount) {
        await syncInventoryForBranch(branchId);
      }
    }

    // fetch data
    const products = await Product.find().populate("category", "name");

    let inventories;
    if (allBranches) {
      // Superadmin viewing all branches — fetch all inventories
      inventories = await Inventory.find().populate("branchId", "name code");
    } else {
      inventories = await Inventory.find({ branchId });
    }

    const inventoryMap = new Map(
      inventories.map((inv) => [inv.productId.toString(), inv]),
    );

    type InventoryResult = {
      id: string;
      image: { url: string; public_id: string };
      name: string;
      price: number;
      category: string;
      status: string;
      quantity: number;
      reserved: number;
      available: number;
      reorderLevel: number;
      branch?: { _id: string; name: string; code: string };
    };

    if (allBranches) {
      // For "all branches", return one row per product-branch combination
      const allResults: InventoryResult[] = [];
      for (const product of products) {
        const branchInventories = inventories.filter(
          (inv) => inv.productId.toString() === product._id.toString(),
        );

        if (branchInventories.length === 0) {
          // Product exists but no inventory in any branch — show with defaults
          allResults.push({
            id: product._id.toString(),
            image: {
              url: product.image.url,
              public_id: product.image.public_id,
            },
            name: product.name,
            price: product.price,
            category: product.category?.name ?? "Uncategorized",
            status: STOCK_STATUSES.IN_STOCK,
            quantity: 20,
            reserved: 0,
            available: 20,
            reorderLevel: 10,
          });
        } else {
          for (const inv of branchInventories) {
            const invData = inv.toObject();
            const branchInfo = inv.branchId
              ? {
                  _id: inv.branchId._id.toString(),
                  name: inv.branchId.name,
                  code: inv.branchId.code,
                }
              : undefined;

            let status =
              invData.quantity === 0
                ? STOCK_STATUSES.OUT_OF_STOCK
                : invData.quantity <= invData.reorderLevel
                  ? STOCK_STATUSES.LOW_STOCK
                  : STOCK_STATUSES.IN_STOCK;

            allResults.push({
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
              branch: branchInfo,
            });
          }
        }
      }
      return NextResponse.json(allResults);
    }

    // Single branch view — one row per product
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
