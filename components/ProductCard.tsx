'use client'

import { Product } from "@/types/harrisonType";
import { useCart } from "@/contexts/harrisonCartContext";
import { Plus } from "lucide-react";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white border border-[#5C3A21]/10 rounded-md overflow-hidden hover:border-[#5C3A21]/30 transition-all duration-300 flex flex-col h-full">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-[#111111] text-lg">{product.name}</h3>
          <span className="text-[#5C3A21] font-semibold">₱{product.price}</span>
        </div>
        <p className="text-gray-500 text-sm mb-6 flex-grow">{product.description}</p>
        <button 
          onClick={() => addToCart(product)}
          className="w-full py-3 bg-[#111111] text-white text-sm font-medium rounded-md hover:bg-[#5C3A21] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add to Order
        </button>
      </div>
    </div>
  );
}