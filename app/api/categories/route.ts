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
  await connectDB();
  
  const { name } = await request.json();

  const last = await Category.findOne({}).sort({ position: -1 });
  const position = last ? last.position + 1 : 1;

  const category = await Category.create({ name, position });

  return NextResponse.json(category, { status: 201 });
}
