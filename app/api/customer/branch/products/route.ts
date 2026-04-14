import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/models/Product";
import { Inventory } from "@/models/Inventory";
import { STOCK_STATUSES } from "@/types/inventory_types";
import "@/lib/registerModels";

/**
 * GET /api/branch/products
 *
 * Fetch all products with stock information for a specific branch
 * Customer-facing endpoint to display products available in selected branch
 *
 * Query Parameters:
 * - branchId (required): The branch ID to fetch products for
 *
 * Example:
 * GET /api/branch/products?branchId=507f1f77bcf86cd799439011
 */

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get branchId from query parameters
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");

    // Validate branchId
    if (!branchId) {
      return NextResponse.json(
        {
          error: "Missing branchId",
          message: "Please provide branchId as query parameter",
          example: "/api/branch/products?branchId=507f1f77bcf86cd799439011",
        },
        { status: 400 },
      );
    }

    console.log(`[BRANCH_PRODUCTS] Fetching products for branch: ${branchId}`);

    // use aggregation pipeline to get products sorted by category position and quantity
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subcategories",
          localField: "subcategory",
          foreignField: "_id",
          as: "subcategory",
        },
      },
      { $unwind: { path: "$subcategory", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "products",
          localField: "includedItems.product",
          foreignField: "_id",
          as: "_includedProducts",
        },
      },
      {
        $addFields: {
          includedItems: {
            $map: {
              input: { $ifNull: ["$includedItems", []] },
              as: "item",
              in: {
                product: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$_includedProducts",
                        as: "p",
                        cond: { $eq: ["$$p._id", "$$item.product"] },
                      },
                    },
                    0,
                  ],
                },
                quantity: "$$item.quantity",
                label: "$$item.label",
              },
            },
          },
        },
      },
      { $unset: "_includedProducts" },

      // ✅ Lookup inventory for this specific branch
      {
        $lookup: {
          from: "inventories",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$productId", "$$productId"] },
                    { $eq: ["$branchId", { $toObjectId: branchId }] }, // match branch
                  ],
                },
              },
            },
            { $project: { quantity: 1, reorderLevel: 1 } },
          ],
          as: "inventory",
        },
      },
      // ✅ Flatten inventory array into fields (default to 0 if no record)
      {
        $addFields: {
          quantity: {
            $ifNull: [{ $arrayElemAt: ["$inventory.quantity", 0] }, 0],
          },
          reorderLevel: {
            $ifNull: [{ $arrayElemAt: ["$inventory.reorderLevel", 0] }, 10],
          },
        },
      },
      { $unset: "inventory" },

      // ✅ Compute stock status
      {
        $addFields: {
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

      // ✅ Sort by category position first, then quantity descending within each category
      { $sort: { "category.position": 1, quantity: -1 } },

      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          image: 1,
          info: 1,
          description: 1,
          category: { _id: "$category._id", name: "$category.name" },
          subcategory: { _id: "$subcategory._id", name: "$subcategory.name" },
          productType: 1,
          includedItems: 1,
          paxCount: 1,
          isPopular: 1,
          isSignature: 1,
          quantity: 1,
          status: 1,
        },
      },
    ]);

    console.log(`[BRANCH_PRODUCTS] Found ${products.length} total products`);

    // Fetch inventory for this specific branch
    const inventories = await Inventory.find({ branchId: branchId })
      .select("productId quantity reorderLevel")
      .lean();

    console.log(
      `[BRANCH_PRODUCTS] Found ${inventories.length} inventory records for branch`,
    );

    // Create a map for quick lookup: productId -> inventory data
    const inventoryMap = new Map(
      inventories.map((inv) => [
        inv.productId.toString(),
        {
          quantity: inv.quantity,
          reorderLevel: inv.reorderLevel ?? 10,
        },
      ]),
    );

    // Combine products with their stock information
    const result = products
      .map((product) => {
        const inv = inventoryMap.get(product._id.toString());

        // Default values if no inventory record exists
        const quantity = inv?.quantity ?? 0;
        const reorderLevel = inv?.reorderLevel ?? 10;

        // Determine status based on stock level
        let status = STOCK_STATUSES.IN_STOCK;
        if (quantity === 0) {
          status = STOCK_STATUSES.OUT_OF_STOCK;
        } else if (quantity <= reorderLevel) {
          status = STOCK_STATUSES.LOW_STOCK;
        }

        // Build response object matching the Product model
        return {
          _id: product._id.toString(),
          name: product.name,
          price: product.price,
          image: {
            url: product.image?.url || "",
            public_id: product.image?.public_id || "",
          },
          info: product.info || "Product info is not available",
          description:
            product.description || "Product description is not available",
          category: {
            _id: product.category?._id?.toString() || "",
            name: product.category?.name || "Uncategorized",
          },
          subcategory: product.subcategory
            ? {
                _id: product.subcategory._id.toString(),
                name: product.subcategory.name,
              }
            : null,
          productType: product.productType || "solo",
          includedItems:
            product.includedItems?.map((item: any) => ({
              _id: item.product?._id?.toString() || "",
              productName: item.product?.name || "",
              quantity: item.quantity,
              label: item.label,
            })) || [],
          paxCount: product.paxCount,
          isPopular: product.isPopular || false,
          isSignature: product.isSignature || false,
          // Stock information for this branch
          quantity,
          status,
        };
      })
      .sort((a, b) => b.quantity - a.quantity);

    console.log(
      `[BRANCH_PRODUCTS] Returning ${result.length} products with stock info`,
    );

    return NextResponse.json(
      {
        success: true,
        branchId,
        totalProducts: result.length,
        data: result,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[BRANCH_PRODUCTS] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch products",
        message: error.message || "An error occurred while fetching products",
      },
      { status: 500 },
    );
  }
}
