import cloudinary from "@/lib/cloudinary";
import {requireSuperAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";
import "@/lib/registerModels";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.aggregate([
      { $sort: { position: 1 } },
      {
        $lookup: {
          from: "subcategories",       // MongoDB collection name (auto-lowercased+pluralized)
          localField: "_id",
          foreignField: "category",
          as: "subcategories",
        },
      },
      // Count active products per category so the customer menu can hide empty categories
      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$categoryId"] },
                    {
                      $or: [
                        { $eq: ["$isActive", true] },
                        { $eq: [{ $type: "$isActive" }, "missing"] },
                      ],
                    },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "activeProductData",
        },
      },
      {
        $addFields: {
          subCategoryCount: { $size: "$subcategories" },
          activeProductCount: {
            $ifNull: [{ $arrayElemAt: ["$activeProductData.count", 0] }, 0],
          },
        },
      },
      { $project: { subcategories: 0, activeProductData: 0 } }, // don't bloat the payload
    ]);

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    await requireSuperAdmin(request)

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
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create category" },
      { status: 500 },
    );
  }
}
