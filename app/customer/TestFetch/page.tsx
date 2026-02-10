// app/products/page.tsx (Server Component)
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import ProductCard from "@/components/ui/ProductCard";

const ProductsPage = async () => {
  await connectDB();
  const products = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean(); // ✅ This converts to plain objects

  // ✅ Serialize all MongoDB-specific fields to strings
  const productsData = products.map(product => ({
    _id: product._id.toString(),
    name: product.name,
    price: product.price,
    description: product.description,
    image: product.image,
    categoryId: product.categoryId.toString(), // ✅ Convert ObjectId to string
    isBestSeller: product.isBestSeller,
    stock: product.stock,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(), // ✅ Convert Date to string
    updatedAt: product.updatedAt.toISOString(), // ✅ Convert Date to string
  }));

  return (
    <div>
      {productsData.map((product) => (
        <ProductCard key={product._id} item={product} />
      ))}
    </div>
  )
}

export default ProductsPage;