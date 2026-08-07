import cloudinary from "@/lib/cloudinary";
import { requireSuperAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { withRateLimit } from "@/lib/rateLimit";
import { Category } from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";
import "@/lib/registerModels";
import { getInternalServerError } from "@/lib/getApiError";

async function _GET() {
  try {
    await connectDB();

    const categories = await Category.aggregate([
      { $sort: { position: 1 } },
      {
        $lookup: {
          from: "subcategories", // MongoDB collection name (auto-lowercased+pluralized)
          localField: "_id",
          foreignField: "category",
          as: "subcategories",
        },
      },
      // Resolve effective isComingSoon using the same auto-live logic as
      // the products & branch-products routes ($addFields + $$NOW)
      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            // Auto-live: if goLiveDate has passed, treat as not coming-soon
            {
              $addFields: {
                isComingSoon: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ["$goLiveDate", null] },
                        { $lte: ["$goLiveDate", "$$NOW"] },
                      ],
                    },
                    then: false,
                    else: { $ifNull: ["$isComingSoon", false] },
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$categoryId"] },
                    // Must be active
                    {
                      $or: [
                        { $eq: ["$isActive", true] },
                        { $eq: [{ $type: "$isActive" }, "missing"] },
                      ],
                    },
                    // Must NOT be coming soon (uses resolved value from $addFields)
                    { $ne: ["$isComingSoon", true] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "activeProductData",
        },
      },
      // Count coming-soon products (active only, respects auto-live goLiveDate)
      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            // Auto-live: if goLiveDate has passed, treat as not coming-soon
            {
              $addFields: {
                isComingSoon: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ["$goLiveDate", null] },
                        { $lte: ["$goLiveDate", "$$NOW"] },
                      ],
                    },
                    then: false,
                    else: { $ifNull: ["$isComingSoon", false] },
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$categoryId"] },
                    // Must be active
                    {
                      $or: [
                        { $eq: ["$isActive", true] },
                        { $eq: [{ $type: "$isActive" }, "missing"] },
                      ],
                    },
                    // Must be coming soon (uses resolved value from $addFields)
                    { $eq: ["$isComingSoon", true] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "comingSoonData",
        },
      },
      {
        $addFields: {
          subCategoryCount: { $size: "$subcategories" },
          activeProductCount: {
            $ifNull: [{ $arrayElemAt: ["$activeProductData.count", 0] }, 0],
          },
          comingSoonCount: {
            $ifNull: [{ $arrayElemAt: ["$comingSoonData.count", 0] }, 0],
          },
        },
      },
      {
        $project: {
          subcategories: 0,
          activeProductData: 0,
          comingSoonData: 0,
        },
      },
    ]);

    return NextResponse.json(categories);
  } catch (error) {
    return getInternalServerError(error, "Failed to fetch categories");
  }
}

async function _POST(request: NextRequest) {
  try {
    await connectDB();
    await requireSuperAdmin(request);

    const { name, imageFile } = await request.json();

    const trimmedName = name?.trim().replace(/\s+/g, " ");

    if (!trimmedName) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    // Only upload if imageFile was actually provided
    let image = { url: "", public_id: "" };
    if (imageFile) {
      const uploaded = await cloudinary.uploader.upload(imageFile, {
        folder: "categories",
        transformation: [
          { width: 400, height: 400, crop: "limit" },
          { quality: "auto" },
        ],
      });
      image = { url: uploaded.secure_url, public_id: uploaded.public_id };
    }

    const last = await Category.findOne({}).sort({ position: -1 });
    const position = last ? last.position + 1 : 1;

    const category = await Category.create({
      name: trimmedName,
      position,
      image,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return getInternalServerError(error, "Failed to create category");
  }
}

export const GET = withRateLimit(_GET, "api");
export const POST = withRateLimit(_POST, "write");
