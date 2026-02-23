"use client";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import CartSummary from "@/components/CardSummary";
import { products } from "@/data/harrisonProducts";
import { Filter } from "lucide-react";

type Category = 'all' | 'inasal' | 'bbq' | 'combo' | 'drinks';

export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'inasal', label: 'Chicken Inasal' },
    { id: 'bbq', label: 'BBQ Meals' },
    { id: 'combo', label: 'Combo Meals' },
    { id: 'drinks', label: 'Drinks' },
  ];

  return (
    <div className="bg-[#F8F7F4] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111111] mb-2">Order Online</h1>
          <p className="text-gray-600">Select your favorites and we'll prepare them fresh.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Product Grid */}
          <div className="flex-grow">
            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors border ${
                    activeCategory === cat.id 
                      ? 'bg-[#111111] text-white border-[#111111]' 
                      : 'bg-white text-gray-600 border-[#5C3A21]/20 hover:border-[#5C3A21]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Right: Cart (Sticky) */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <CartSummary />
          </div>

        </div>
      </div>
    </div>
  );
}