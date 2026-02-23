"use client";
import { useCart } from "@/contexts/harrisonCartContext";
import { Trash2, Plus, Minus, CreditCard, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function CartSummary() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const serviceFee = 20;
  const finalTotal = total > 0 ? total + serviceFee : 0;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="bg-white border border-[#5C3A21]/20 p-8 rounded-md text-center h-full flex flex-col justify-center items-center">
        <CheckCircle className="w-16 h-16 text-[#5C3A21] mb-4" />
        <h2 className="text-2xl font-bold text-[#111111] mb-2">Order Received!</h2>
        <p className="text-gray-600 mb-6">Thank you for ordering from Harrison.</p>
        <button 
          onClick={() => { setOrderPlaced(false); setShowCheckout(false); }}
          className="text-[#5C3A21] font-medium hover:underline"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="bg-white border border-[#5C3A21]/20 p-6 rounded-md sticky top-24">
        <h2 className="text-xl font-bold mb-6 text-[#111111]">Checkout Details</h2>
        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
            <input required type="text" className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#5C3A21]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Number</label>
            <input required type="tel" className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#5C3A21]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Address</label>
            <textarea required className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#5C3A21] h-20" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Method</label>
            <select className="w-full p-2 border border-gray-200 rounded-md bg-white">
              <option>Cash on Delivery (COD)</option>
              <option>GCash</option>
            </select>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <button type="submit" className="w-full py-3 bg-[#5C3A21] text-white font-bold rounded-md hover:bg-[#111111] transition-colors flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" /> Place Order
            </button>
            <button type="button" onClick={() => setShowCheckout(false)} className="text-sm text-gray-500 hover:text-[#111111]">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#5C3A21]/20 p-6 rounded-md sticky top-24">
      <h2 className="text-xl font-bold mb-6 text-[#111111] border-b border-gray-100 pb-4">Your Order</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>Your cart is empty</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-start">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-sm bg-gray-100" />
                <div className="flex-grow">
                  <h4 className="font-medium text-[#111111] text-sm">{item.name}</h4>
                  <p className="text-[#5C3A21] font-bold text-sm">₱{item.price * item.quantity}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-sm">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₱{total}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Service Fee</span>
              <span>₱{serviceFee}</span>
            </div>
            <div className="flex justify-between font-bold text-[#111111] text-lg pt-2 border-t border-gray-100 mt-2">
              <span>Total</span>
              <span>₱{finalTotal}</span>
            </div>
          </div>

          <button 
            onClick={() => setShowCheckout(true)}
            className="w-full py-3 bg-[#111111] text-white font-bold rounded-md hover:bg-[#5C3A21] transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}