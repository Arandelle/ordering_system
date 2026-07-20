/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { syncInventoryForBranch } from "@/services/admin/sync-inventory.service";
import { Product } from "@/models/Product";
import { Inventory } from "@/models/Inventory";
import { Branch } from "@/models/Branch";
import { STOCK_STATUSES } from "@/types/inventory_types";
import { requireAdmin } from "@/lib/getAuth";
import "@/lib/registerModels";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import mongoose from "mongoose";
import { STAFF_ROLES } from "@/types/staff";
import { parseRequestQuery, buildPaginationMeta } from "@/utils/query-helpers";
import { getValidObjectId } from "@/helper/getValidObjectIds";
import { getAPIError } from "@/lib/getApiError";

/**
 * Resolves the branchId the staff member is allowed to query.
 * Superadmins can pick any branch or pass nothing for "all branches".
 * Regular admins are locked to their assigned branch.
 */
async function resolveBranchAccess(
  req: NextRequest,
  staff: { role: string; branch?: mongoose.Types.ObjectId | string },
) {
  const { searchParams } = new URL(req.url);

  let branchId: mongoose.Types.ObjectId | null = staff.branch
    ? staff.branch instanceof mongoose.Types.ObjectId
      ? staff.branch
      : new mongoose.Types.ObjectId(staff.branch)
    : null;

  // all branches on inventories are controlled by csr/cashier and superadmin
  const allBranches =
    staff.role !== STAFF_ROLES.ADMIN && !searchParams.get("branchId");

  if (staff.role !== STAFF_ROLES.ADMIN) {
    const requestedBranch = searchParams.get("branchId");
    if (requestedBranch && getValidObjectId(requestedBranch)) {
      branchId = new mongoose.Types.ObjectId(requestedBranch);
    }
  }

  if (!branchId && staff.role === STAFF_ROLES.ADMIN) {
    return { error: getAPIError("branchId is required", 400) };
  }

  return { branchId, allBranches };
}

/**
 * Aggregation stage that computes `reserved`, `available`, and `status`
 * from the joined inventory document.
 */
const computeInventoryFields = (): Record<string, any>[] => {
  const stages: Record<string, any>[] = [
    {
      $addFields: {
        invDoc: {
          $cond: {
            if: { $gt: [{ $size: "$inventory" }, 0] },
            then: { $arrayElemAt: ["$inventory", 0] },
            else: {
              quantity: 20,
              reorderLevel: 10,
              reservations: [],
            },
          },
        },
      },
    },
    {
      $addFields: {
        quantity: "$invDoc.quantity",
        reorderLevel: "$invDoc.reorderLevel",
        reserved: {
          $reduce: {
            input: { $ifNull: ["$invDoc.reservations", []] },
            initialValue: 0,
            in: { $add: ["$$value", "$$this.quantity"] },
          },
        },
      },
    },
    {
      $addFields: {
        available: { $subtract: ["$quantity", "$reserved"] },
        status: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$quantity", 0] },
                then: STOCK_STATUSES.OUT_OF_STOCK,
              },
              {
                case: { $lte: ["$quantity", "$reorderLevel"] },
                then: STOCK_STATUSES.LOW_STOCK,
              },
            ],
            default: STOCK_STATUSES.IN_STOCK,
          },
        },
      },
    },
  ];

  return stages;
};

/**
 * GET /api/staff/inventories?branchId=<id>&page=&limit=&search=&status=&sort=
 *
 * Paginated inventory list with search, status filter, and sorting.
 * Returns `{ data, pagination, counts }`.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const staff = await requireAdmin(req);

    if (!canAccess(staff.role, "inventories.read")) {
      return getAPIError("Forbidden", 403);
    }

    const resolved = await resolveBranchAccess(req, staff);
    if ("error" in resolved) return resolved.error;

    const { branchId, allBranches } = resolved;
    const { searchParams } = new URL(req.url);

    // Sync inventory records so every product has an entry per branch
    const productCount = await Product.countDocuments();

    // Clean up orphaned inventory records (products or branches that no longer exist)
    const [validProductIds, activeBranchIds] = await Promise.all([
      Product.find()
        .select("_id")
        .then((docs) => docs.map((d) => d._id)),
      Branch.find({ isActive: true })
        .select("_id")
        .then((docs) => docs.map((d) => d._id)),
    ]);

    const { deletedCount } = await Inventory.deleteMany({
      $or: [
        { productId: { $nin: validProductIds } },
        { branchId: { $nin: activeBranchIds } },
      ],
    });

    if (deletedCount > 0) {
      console.log(
        `Inventory cleanup: removed ${deletedCount} orphaned record(s)`,
      );
    }

    if (allBranches) {
      // Superadmin "all branches" view — sync every active branch
      await Promise.all(
        activeBranchIds.map(async (bId) => {
          const count = await Inventory.countDocuments({ branchId: bId });
          if (count < productCount) {
            await syncInventoryForBranch(bId);
          }
        }),
      );
    } else if (branchId) {
      const inventoryCount = await Inventory.countDocuments({ branchId });
      if (inventoryCount < productCount) {
        await syncInventoryForBranch(branchId);
      }
    }

    // Parse pagination, search, sort from query string
    const { page, limit, skip, sort, match } = parseRequestQuery(req, {
      searchFields: ["name"],
      exactFields: ["status", "category"],
      defaultSort: { name: 1 },
      defaultLimit: 15,
    });

    // Status filter is extracted separately since it's computed, not stored
    const statusFilter = searchParams.get("status");
    const validStatus =
      statusFilter &&
      Object.values(STOCK_STATUSES).includes(statusFilter as any)
        ? statusFilter
        : null;

    // Build the text search filter (name only)
    const searchFilter: Record<string, any> = {};
    if (match.$or) {
      searchFilter.$or = match.$or;
    }

    // Category lookup shared by both pipelines
    const categoryLookup = {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDoc",
      },
    };

    // Flatten category name
    const flattenCategory = {
      $addFields: {
        categoryName: {
          $cond: {
            if: { $gt: [{ $size: "$categoryDoc" }, 0] },
            then: { $arrayElemAt: ["$categoryDoc.name", 0] },
            else: "Uncategorized",
          },
        },
      },
    };

    // ── Build the pipeline ─────────────────────────────────────────────────
    // The pipeline order differs between "all branches" and single-branch:
    //   all branches:  lookup → unwind → compute per-row → filter
    //   single branch: lookup → compute (from array[0]) → filter

    const basePipeline: Record<string, any>[] = [categoryLookup];

    if (allBranches) {
      // Lookup ALL inventory records for each product (no branch filter)
      basePipeline.push({
        $lookup: {
          from: "inventories",
          localField: "_id",
          foreignField: "productId",
          as: "inventory",
        },
      });

      // Unwind FIRST so each row = one product-branch pair
      basePipeline.push({
        $unwind: {
          path: "$inventory",
          preserveNullAndEmptyArrays: true,
        },
      });

      // Compute fields from the unwound single inventory doc
      basePipeline.push({
        $addFields: {
          quantity: { $ifNull: ["$inventory.quantity", 20] },
          reorderLevel: { $ifNull: ["$inventory.reorderLevel", 10] },
          reserved: {
            $reduce: {
              input: { $ifNull: ["$inventory.reservations", []] },
              initialValue: 0,
              in: { $add: ["$$value", "$$this.quantity"] },
            },
          },
        },
      });
      basePipeline.push({
        $addFields: {
          available: { $subtract: ["$quantity", "$reserved"] },
          status: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$quantity", 0] },
                  then: STOCK_STATUSES.OUT_OF_STOCK,
                },
                {
                  case: { $lte: ["$quantity", "$reorderLevel"] },
                  then: STOCK_STATUSES.LOW_STOCK,
                },
              ],
              default: STOCK_STATUSES.IN_STOCK,
            },
          },
        },
      });
    } else {
      // Lookup inventory filtered to the specific branch
      basePipeline.push({
        $lookup: {
          from: "inventories",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$productId", "$$productId"] },
                    { $eq: ["$branchId", branchId] },
                  ],
                },
              },
            },
          ],
          as: "inventory",
        },
      });

      // Compute fields from inventory[0] (single branch, one element array)
      basePipeline.push(...computeInventoryFields());
    }

    basePipeline.push(flattenCategory);

    // Apply search filter (works on product fields — same for both paths)
    if (searchFilter.$or) {
      basePipeline.push({ $match: searchFilter });
    }

    // Apply status filter AFTER status has been correctly computed per row
    if (validStatus) {
      basePipeline.push({ $match: { status: validStatus } });
    }

    // ── Counts (for summary cards) — run before pagination ──────────────────

    const countPipeline = [
      ...basePipeline,
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ];

    const dataPipeline = [
      ...basePipeline,
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ];

    // For "all branches", join branch info for display
    if (allBranches) {
      dataPipeline.push({
        $lookup: {
          from: "branches",
          localField: "inventory.branchId",
          foreignField: "_id",
          as: "branchDoc",
        },
      });
    }

    dataPipeline.push({
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        image: 1,
        categoryName: 1,
        quantity: 1,
        reserved: 1,
        available: 1,
        reorderLevel: 1,
        status: 1,
        ...(allBranches
          ? {
              branch: {
                $cond: {
                  if: { $gt: [{ $size: "$branchDoc" }, 0] },
                  then: {
                    _id: { $toString: { $arrayElemAt: ["$branchDoc._id", 0] } },
                    name: { $arrayElemAt: ["$branchDoc.name", 0] },
                    code: { $arrayElemAt: ["$branchDoc.code", 0] },
                  },
                  else: null,
                },
              },
            }
          : {}),
      },
    });

    const [countResults, dataResults] = await Promise.all([
      Product.aggregate(countPipeline as any),
      Product.aggregate(dataPipeline as any),
    ]);

    // Build counts map
    const counts = { inStock: 0, lowStock: 0, outOfStock: 0, total: 0 };
    for (const row of countResults) {
      counts.total += row.count;
      if (row._id === STOCK_STATUSES.IN_STOCK) counts.inStock = row.count;
      else if (row._id === STOCK_STATUSES.LOW_STOCK)
        counts.lowStock = row.count;
      else if (row._id === STOCK_STATUSES.OUT_OF_STOCK)
        counts.outOfStock = row.count;
    }

    // Normalize results to match the frontend InventoryItem type
    const data = dataResults.map((doc: any) => ({
      id: doc._id.toString(),
      image: doc.image,
      name: doc.name,
      price: doc.price,
      category: doc.categoryName,
      quantity: doc.quantity,
      reserved: doc.reserved,
      available: doc.available,
      reorderLevel: doc.reorderLevel,
      status: doc.status,
      ...(allBranches && doc.branch ? { branch: doc.branch } : {}),
    }));

    return NextResponse.json({
      data,
      pagination: buildPaginationMeta(counts.total, page, limit),
      counts,
    });
  } catch (error) {
    console.error("INVENTORY FETCH ERROR:", error);

    return getAPIError(error, 500, {
      fallbackMessage: "Failed to fetch inventory",
    });
  }
}
