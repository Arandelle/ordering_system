import { requireAdmin } from "@/lib/getAuth";
import { connectDB } from "@/lib/mongodb";
import "@/lib/registerModels";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type CategoryRecord = {
  _id: mongoose.Types.ObjectId;
  name: string;
  position?: number;
};

type ProductRecord = {
  _id: mongoose.Types.ObjectId;
  name: string;
  price?: number | null;
  image?: {
    url?: string;
  };
  category?: mongoose.Types.ObjectId | null;
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await requireAdmin(request);

    const [categories, products] = await Promise.all([
      Category.find({})
        .select({ name: 1, position: 1 })
        .sort({ position: 1, name: 1 })
        .lean<CategoryRecord[]>(),
      Product.find({})
        .select({ name: 1, price: 1, image: 1, category: 1 })
        .sort({ name: 1 })
        .lean<ProductRecord[]>(),
    ]);

    const uncategorizedCategory = {
      _id: "uncategorized",
      name: "Uncategorized",
      products: [] as {
        _id: string;
        name: string;
        price: number | null;
        imageUrl: string;
      }[],
    };

    const categoryMap = new Map(
      categories.map((category) => [
        category._id.toString(),
        {
          _id: category._id.toString(),
          name: category.name,
          products: [] as {
            _id: string;
            name: string;
            price: number | null;
            imageUrl: string;
          }[],
        },
      ]),
    );

    products.forEach((product) => {
      const categoryId = product.category?.toString();
      const category = categoryId ? categoryMap.get(categoryId) : null;
      const productOption = {
        _id: product._id.toString(),
        name: product.name,
        price: product.price ?? null,
        imageUrl: product.image?.url ?? "",
      };

      if (category) {
        category.products.push(productOption);
        return;
      }

      uncategorizedCategory.products.push(productOption);
    });

    const data = [
      ...Array.from(categoryMap.values()).filter(
        (category) => category.products.length > 0,
      ),
      ...(uncategorizedCategory.products.length > 0
        ? [uncategorizedCategory]
        : []),
    ];

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch product discount options.",
      },
      { status: 500 },
    );
  }
}
