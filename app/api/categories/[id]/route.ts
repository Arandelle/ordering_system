import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";
import { success } from "zod";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const body = await request.json();

    const { name: newName } = body;
    const trimmedName = newName?.trim().replace(/\s+/g, " ");

    if (!trimmedName) {
      return NextResponse.json(
        {
          error: "Category name is required!",
        },
        { status: 400 },
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name: trimmedName,
      },
      { new: true, runValidators: true },
    );

    if (!category) {
      return NextResponse.json(
        {
          error: "Category not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: "Category updated successfully!",
        data: category,
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Category name already exist!",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to edit category" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Category ID is required!",
        },
        { status: 400 },
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found!" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: "Category deleted successfully!" },
      { status: 200 },
    );

  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete the category",
      },
      { status: 500 },
    );
  }
}
