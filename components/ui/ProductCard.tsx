'use client'

import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/adminType";
import { Check, Plus, ShoppingBag } from "lucide-react";
import React, { useState } from "react";

interface ProductCardProps {
  item: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.price,
      image: item.image.url,
      category: item.category.name ?? "N/a",
      description: item.description ?? "N/a"
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 500);
  };

  return (
    <div className="group h-full bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duratin-300 overflow-hidden transform hover:-translate-y-1">
      {/** Image container */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={item.image.url}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/** Best Seller Badge */}
        {item.isPopular && (
          <div className="absolute left-3 top-3 bg-[#e13e00] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Best Seller
          </div>
        )}

        {/** Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`${isAdded ? "bg-green-500 scale-110" : "bg-[#e13e00] hover:bg-[#c13500]"} text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transform transition-all duration-300 hover:scale-105 shadow-lg`}
          >
            {isAdded ? (
              <>
                <Check size={18} />
                Added!
              </>
            ) : (
              <>
                <Plus size={18} />
                Add To Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/** Content */}
      <div className="flex flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">
            {item.name}
          </h3>
        </div>

        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {item.description !== "" ? item.description : "No description"}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-[#e13e00] font-bold text-xl">
            ₱{item.price}
          </span>

          <button
           onClick={handleAddToCart}
           disabled={isAdded}
            className={`${isAdded ? "bg-green-500" : "bg-[#1a1a1a] hover:bg-[#e13e00]"} text-white p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg`}
          >
            {isAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
