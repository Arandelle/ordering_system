"use client";

import { CartItem } from "@/types/MenuTypes";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

// This context will hold cart state and actions
const CartContext = createContext<CartContextType | undefined>(undefined);

// CartProvider component to wrap the app and provide cart state
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

 useEffect(() => {
  const savedCart = localStorage.getItem('cart');

  if (savedCart) {
    try {
      const parsed = JSON.parse(savedCart);

      // ✅ ENSURE ARRAY
      if (Array.isArray(parsed)) {
        setCartItems(parsed);
      } else {
        setCartItems([]);
      }

    } catch (error) {
      console.error("Error loading cart", error);
      setCartItems([]); // ✅ fallback
    }
  }

  setIsHydrated(true);
}, []);


  // Save cart to localstorage whenever it changes
  useEffect(() => {
    if(isHydrated){
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem._id === item._id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const updateQuantity = (id: string | number, quantity: number)=> {
    if(quantity <= 0 ){
      removeFromCart(id);
      return;
    }

    setCartItems(prev => prev.map(item => item._id === id ? {...item, quantity} : item))
  }

  const clearCart = () => {
    setCartItems([]);
  }

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if(!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
