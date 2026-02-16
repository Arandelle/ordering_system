"use client";

import Modal from "@/components/ui/Modal";
import ProductTable from "@/components/admin/ProductTable";
import { mockProducts } from "@/data/mockData";
import React from "react";
import { useState } from "react";

const ProductsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
            {mockProducts.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-100">
          <p className="text-sm text-stone-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-emerald-600">
            {mockProducts.filter((p) => p.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-100">
          <p className="text-sm text-stone-500 mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600">
            {mockProducts.filter((p) => p.stock < 20).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-100">
          <p className="text-sm text-stone-500 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {mockProducts.filter((p) => p.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <ProductTable products={mockProducts} />

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Product"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Chicken Inasal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Product description"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Category
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select category</option>
              <option value="Main Course">Main Course</option>
              <option value="Desserts">Desserts</option>
              <option value="Extras">Extras</option>
              <option value="Soup">Soup</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Price (₱)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-[#e13e00] text-white font-semibold hover:shadow-lg transition-all"
            >
              Add Product
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default ProductsPage;
