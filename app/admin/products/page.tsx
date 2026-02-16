"use client";

import ProductTable from "@/components/admin/ProductTable";
// import { mockProducts } from "@/data/mockData";
import { useEffect, useState } from "react";
import ProductsModal from "./ProductsModal";
import { Product } from "@/types/adminType";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try{  
      const response = await fetch('api/products');
      const data = await response.json();
      setProducts(data);
    }catch(error){
      console.error("Failed to fetch products: ", error)
    } finally{  
      setProductLoading(false);
    }
  }
  
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">
            Products Management
          </h1>
          <p className="text-stone-500">Manage your menu items and inventory</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#e13e00] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          + Add New Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-stone-100">
          <p className="text-sm text-stone-500 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-stone-800">
            {products.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-100">
          <p className="text-sm text-stone-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-emerald-600">
            {products.filter((p) => p.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-100">
          <p className="text-sm text-stone-500 mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600">
            {products.filter((p) => p.stock < 20).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-100">
          <p className="text-sm text-stone-500 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {products.filter((p) => p.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <ProductTable products={products} />

      {/* Add Product Modal */}
      {isModalOpen && (
        <ProductsModal setIsModalOpen={setIsModalOpen}/>
      )}
    </section>
  );
};

export default ProductsPage;
