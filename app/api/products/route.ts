import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const product = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error fetching data!",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const {
      name, price, description, image, categoryId
    } = await request.json();


    const product = await Product.create({
      name, price, description, image, categoryId
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product!" },
      { status: 500 },
    );
  }
}
