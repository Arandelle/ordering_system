import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/models/Product";
import { Inventory } from "@/models/Inventory";
import { STOCK_STATUSES } from "@/types/inventory_types";
import "@/models/SubCategory"

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

    // Fetch all products with all necessary fields
    const products = await Product.find()
      .select(
        "_id name price image info description category subcategory productType includedItems paxCount isPopular isSignature",
      )
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate({
        path: "includedItems.product",
        select: "name price",
      })
      .lean();

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
          reorderLevel: inv.reorderLevel,
        },
      ]),
    );

    // Combine products with their stock information
    const result = products.map((product) => {
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
        productId: product._id.toString(),
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
          id: product.category?._id?.toString() || "",
          name: product.category?.name || "Uncategorized",
        },
        subcategory: product.subcategory
          ? {
              id: product.subcategory._id.toString(),
              name: product.subcategory.name,
            }
          : null,
        productType: product.productType || "solo",
        includedItems:
          product.includedItems?.map((item: any) => ({
            productId: item.product?._id?.toString() || "",
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
    }).sort((a,b) => b.quantity - a.quantity);

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
