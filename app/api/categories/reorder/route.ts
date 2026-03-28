import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const { categories } = await request.json();

    if (!categories.length) {
      return NextResponse.json(
        {
          error: "Categories is required!",
        },
        { status: 400 },
      );
    }

    // Bulk update - runs all updates in parallel
    await Promise.all(
      categories.map(({ id, position }: { id: string; position: number }) =>
        Category.findByIdAndUpdate(id, { position }),
      ),
    );

    return NextResponse.json(
      {
        success: "Categories reordered successfully!",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to reorder the categories",
      },
      { status: 500 },
    );
  }
}
