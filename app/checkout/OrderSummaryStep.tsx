import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import React from "react";

interface OrderSummaryStepProps {
  onNext: () => void
}

const OrderSummaryStep = ({onNext} : OrderSummaryStepProps) => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="text-center p-12">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-400">Add your favourite before checking out!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Summary</h2>
        <p className="text-gray-500">Review your items before proceeding.</p>
      </div>

      {/**Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4 bg-gray-50 rounded-xl p-4">
            <img
              src={item.image}
              alt={item.name || "Product Image"}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-semibold text-sm w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-bold text-[#e13e00]">
                  ₱{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/**Order Totals */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₱{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
           <span>Delivery Fee</span>
          <span>{totalPrice > 500 ? 'Free' : `₱ ${50}`}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-xl text-[#e13e00]">₱{(totalPrice +  50).toFixed(2)}</span>
        </div>
      </div>

      {/** Continue Button */}
      <button 
      onClick={onNext}
      className="w-full bg-[#e13e00] hover:bg-[#c13500] text-white py-4 rounded-xl font-bold text-lg transition-colors cursor-pointer">
        Continue to Delivery
      </button>
    </div>
  );
};

export default OrderSummaryStep;