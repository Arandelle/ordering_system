import { connectDB } from "@/lib/mongodb";
import { SubCategory } from "@/models/SubCategory";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/getAuth";
import mongoose from "mongoose";

// ─── PATCH — update subcategory name ─────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await requireSuperAdmin(request)

    const { id } = await context.params;
    const body = await request.json();
    const categoryId =
      typeof body.categoryId === "string" ? body.categoryId : undefined;

    const trimmedName = body.name?.trim().replace(/\s+/g, " ");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid subcategory id" },
        { status: 400 }
      );
    }

    if (!trimmedName) {
      return NextResponse.json(
        { error: "Subcategory name is required!" },
        { status: 400 }
      );
    }

    const existingSubcategory = await SubCategory.findById(id);

    if (!existingSubcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    const update: {
      name: string;
      category?: string;
      position?: number;
    } = { name: trimmedName };

    if (categoryId && categoryId !== existingSubcategory.category.toString()) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json(
          { error: "Invalid category id" },
          { status: 400 }
        );
      }

      const categoryExists = await Category.exists({ _id: categoryId });

      if (!categoryExists) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      const productCount = await Product.countDocuments({ subcategory: id });

      if (productCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot move subcategory — ${productCount} product(s) are using it`,
          },
          { status: 409 }
        );
      }

      const last = await SubCategory.findOne({ category: categoryId }).sort({
        position: -1,
      });

      update.category = categoryId;
      update.position = last ? last.position + 1 : 1;
    }

    const subcategory = await SubCategory.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    ).populate("category", "name position image");

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: "Subcategory updated successfully!", data: subcategory },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Subcategory name already exists!" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

// ─── DELETE — remove subcategory ─────────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await requireSuperAdmin(request)

    const { id } = await context.params;

    const subcategory = await SubCategory.findById(id);

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found!" },
        { status: 404 }
      );
    }

    // Guard — prevent deleting if products are still using this subcategory
    const productCount = await Product.countDocuments({ subcategory: id });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete — ${productCount} product(s) are using this subcategory`,
        },
        { status: 409 }
      );
    }

    await SubCategory.findByIdAndDelete(id);

    return NextResponse.json(
      { success: "Subcategory deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
