import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// GET all products
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({})
      .populate("category")
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}



// POST create new product
export async function POST(request: Request) {
  let uploadResult;

  try {
    await connectDB();

    const { name, price, description, image, category, imageFile, stock } =
      await request.json();

    // ✅ STEP 1: VALIDATE
    if (
      !name ||
      !price ||
      !description ||
      !category ||
      stock === undefined ||
      stock === null
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (!image && !imageFile) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Validate category is not empty
    if (category.trim() === "") {
      return NextResponse.json(
        { error: "Category cannot be empty" },
        { status: 400 },
      );
    }

    // Validate price
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 },
      );
    }

    // Validate stock
    if (isNaN(parseFloat(stock))) {
      return NextResponse.json(
        { error: "Stock must be a positive number" },
        { status: 400 },
      );
    }

    // ✅ STEP 2: Upload image (only after validation)
    let finalImage = {
      url: "",
      public_id: "",
    };

    if (imageFile) {
      uploadResult = await cloudinary.uploader.upload(imageFile, {
        folder: "products",
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto" },
        ],
      });

      finalImage = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    // ✅ STEP 3: Normalize category (lowercase, trim spaces)
    const normalizedCategory = category
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    // ✅ STEP 4: Create product
    const product = await Product.create({
      name,
      price: parseFloat(price),
      description,
      image: finalImage,
      category: normalizedCategory,
      stock,
    });

    if (!product) {
      await cloudinary.uploader.destroy(finalImage.public_id);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);

    if (uploadResult?.public_id) {
      await cloudinary.uploader.destroy(uploadResult.public_id);
    }

    return NextResponse.json(
      { error: error.message || "Failed to create product!" },
      { status: 500 },
    );
  }
}
