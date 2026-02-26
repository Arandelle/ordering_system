import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({})
      .sort({ position: 1 })
      .lean();

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { name } = await request.json();
    const trimmedName = name?.trim().replace(/\s+/g, " ");

    if (!trimmedName) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const last = await Category.findOne({}).sort({ position: -1 });
    const position = last ? last.position + 1 : 1;

    const category = await Category.create({ name: trimmedName, position });

    return NextResponse.json(category, { status: 201 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}