import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all products
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // ✅ Special endpoint to get unique categories
    if (action === 'categories') {
      const products = await Product.find({}).select('category').lean();
      
      // Use Set to get unique categories
      const uniqueCategories = [...new Set(
        products
          .map(p => p.category)
          .filter(Boolean) // Remove null/undefined
      )];

      // Sort alphabetically
      uniqueCategories.sort();

      return NextResponse.json({ 
        categories: uniqueCategories,
        count: uniqueCategories.length 
      });
    }

    // Regular product listing
    const product = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(product);
    
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching data!" },
      { status: 500 },
    );
  }
}

// POST create new product
export async function POST(request: Request) {
  try {
    await connectDB();

    const { name, price, description, image, category, imageFile } = await request.json();

    // ✅ STEP 1: VALIDATE
    if (!name || !price || !description || !category) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!image && !imageFile) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    // Validate category is not empty
    if (category.trim() === '') {
      return NextResponse.json(
        { error: "Category cannot be empty" },
        { status: 400 }
      );
    }

    // Validate price
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // ✅ STEP 2: Upload image (only after validation)
    let finalImageUrl = image;

    if (imageFile) {
      const uploadResult = await cloudinary.uploader.upload(imageFile, {
        folder: 'products',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
        ],
      });

      finalImageUrl = uploadResult.secure_url;
    }

    // ✅ STEP 3: Normalize category (lowercase, trim spaces)
    const normalizedCategory = category.toLowerCase().trim().replace(/\s+/g, '-');

    // ✅ STEP 4: Create product
    const product = await Product.create({
      name,
      price: parseFloat(price),
      description,
      image: finalImageUrl,
      category: normalizedCategory,
    });

    return NextResponse.json(product, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);

    return NextResponse.json(
      { error: error.message || "Failed to create product!" },
      { status: 500 },
    );
  }
}